import React, { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateChatSession, useGetChatMessages, useGetChatSessions } from '../../utils/workspace';
import { SendIcon, BotIcon, PlusIcon, MessageSquare, Clock3, Menu, MessageCirclePlus, ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { autoScrollListRef } from '../summary/ai/use-auto-scroll';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { axiosPrivate, baseUrl } from '../../utils/api.ts';
import { Modal } from '../ui/modal/index.tsx';
import type { ChatSession, ChatMessage as WorkspaceChatMessage } from '../../types/workspace.ts';

interface ChatStreamProps {
    notebookId: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: WorkspaceChatMessage['citations'];
    image_urls?: string[];
    imageBlobUrls?: string[];
    created_at?: string;
} 

const toUiMessage = (message: WorkspaceChatMessage): Message => ({
    id: message.id,
    role: message.role,
    content: message.content,
    citations: message.citations,
    image_urls: message.image_urls,
    created_at: message.created_at,
});

interface ChatImageProps {
    notebookId: string;
    sessionId: string;
    messageId: string;
    index: number;
}

// Survives component remounts within a page session.
// Keys are `${messageId}/${index}`; blob URLs are never explicitly revoked here
// (they live until page unload, acceptable for a few images per session).
const chatImageCache = new Map<string, string>();

const ChatImage: React.FC<ChatImageProps> = ({ notebookId, sessionId, messageId, index }) => {
    const cacheKey = `${messageId}/${index}`;
    const [src, setSrc] = useState<string | null>(() => chatImageCache.get(cacheKey) ?? null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (src) return;
        let cancelled = false;
        axiosPrivate
            .get(`/notebooks/${notebookId}/chats/${sessionId}/messages/${messageId}/images/${index}`, { responseType: 'blob' })
            .then((res) => {
                const url = URL.createObjectURL(res.data as Blob);
                chatImageCache.set(cacheKey, url);
                if (!cancelled) setSrc(url);
            })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [cacheKey, notebookId, sessionId, messageId, index]);

    if (failed) return (
        <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs">
            ⚠ image
        </div>
    );
    if (!src) return null;
    return <img src={src} alt="" className="max-h-48 rounded-2xl object-cover" />;
};

const sortMessages = (messages: Message[]) =>
    [...messages].sort((left, right) => {
        const leftTime = left.created_at ?? '';
        const rightTime = right.created_at ?? '';
        return leftTime.localeCompare(rightTime);
    });

// Treat a server timestamp that has no TZ suffix as UTC so Date display is correct.
const toUTCDate = (s: string) =>
    new Date(/Z$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + 'Z');

interface SidebarContentProps {
    sessions?: ChatSession[];
    sessionId: string | null;
    emptySidebar: boolean;
    handleOpenSession: (id: string) => void;
    setCreateModalOpen: (open: boolean) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
    sessions = [], sessionId, emptySidebar, handleOpenSession, setCreateModalOpen,
}) => {
    const { t } = useTranslation('workspace');
    return (
    <>
        <div className="p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-foreground/50">{t('chat.history')}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                >
                    <PlusIcon size={12} />
                    {t('chat.new_short')}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
            {emptySidebar && (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-6 text-center">
                    <MessageSquare className="text-foreground/40" size={28} />
                    <p className="mt-3 text-sm font-medium text-foreground/80">{t('chat.no_session_title')}</p>
                    <p className="mt-1 text-xs text-foreground/50">{t('chat.no_session_hint')}</p>
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                    >
                        <PlusIcon size={16} />
                        {t('chat.create_session_btn')}
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {sessions
                    .slice()
                    .sort((left, right) => right.created_at.localeCompare(left.created_at))
                    .map((session) => {
                        const isActive = session.id === sessionId;
                        return (
                            <button
                                key={session.id}
                                type="button"
                                onClick={() => handleOpenSession(session.id)}
                                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/30 shadow-sm'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400'}`}>
                                        <MessageSquare size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-foreground/50">
                                            <Clock3 size={12} />
                                            <span>{toUTCDate(session.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
            </div>
        </div>
    </>
    );
};

const ChatStream: React.FC<ChatStreamProps> = ({ notebookId }) => {
    const { t } = useTranslation('workspace');
    const suggestedQuestions = [
        t('chat.suggested_q1'),
        t('chat.suggested_q2'),
        t('chat.suggested_q3'),
        t('chat.suggested_q4'),
    ];
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    // Pending optimistic messages for the current in-flight exchange.
    // Kept separate from real DB messages — never merged by content.
    const [pendingUserMsg, setPendingUserMsg] = useState<Message | null>(null);
    const [streamingAssistantMsg, setStreamingAssistantMsg] = useState<Message | null>(null);
    const [input, setInput] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const shouldScrollToBottomRef = useRef(false);
    const preserveScrollRef = useRef(false);
    const previousScrollHeightRef = useRef(0);
    const lastSessionIdRef = useRef<string | null>(null);
    // Server-side created_at of the last known message before the current exchange.
    // Comparing server timestamps against each other avoids any client/server TZ skew.
    const exchangeSnapshotTimeRef = useRef<string>('');
    const pollCancelRef = useRef(false);

    const createSessionMutation = useCreateChatSession();
    const {
        data: chatSessions,
        isLoading: isLoadingChatSessions,
        refetch: refetchChatSessions,
    } = useGetChatSessions(notebookId, { perPage: 100 });
    const {
        data: chatMessages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchChatMessages,
    } = useGetChatMessages(notebookId, sessionId, { perPage: 20 });

    const sessions = chatSessions?.items ?? [];

    const activeSession = useMemo<ChatSession | null>(() => {
        if (!sessionId) return null;
        return sessions.find((session) => session.id === sessionId) ?? null;
    }, [sessionId, sessions]);

    const fetchedMessages = useMemo<Message[]>(() => {
        const pages = chatMessages?.pages ?? [];
        const flattened = pages.flatMap((page) => page.items.map(toUiMessage));
        return sortMessages(flattened);
    }, [chatMessages]);

    // What's actually rendered: real DB messages + pending temp messages (if not yet confirmed).
    // Both sides of the comparison are server timestamps in the same format/timezone,
    // so string ordering is correct and no client/server TZ skew can affect the result.
    const displayMessages = useMemo<Message[]>(() => {
        if (!pendingUserMsg && !streamingAssistantMsg) return fetchedMessages;

        const snapshot = exchangeSnapshotTimeRef.current;
        const confirmed = fetchedMessages.some(
            (m) => m.role === 'assistant' && (m.created_at ?? '') > snapshot
        );
        if (confirmed) return fetchedMessages;

        const pending: Message[] = [];
        if (pendingUserMsg) pending.push(pendingUserMsg);
        // Only show the streaming bubble once it has content; before the first token
        // the typing indicator dots handle the "thinking" state instead.
        if (streamingAssistantMsg?.content) pending.push(streamingAssistantMsg);
        return [...fetchedMessages, ...pending];
    }, [fetchedMessages, pendingUserMsg, streamingAssistantMsg]);

    const clearPending = () => {
        pollCancelRef.current = true;
        setPendingUserMsg(null);
        setStreamingAssistantMsg(null);
    };

    const clearAllImages = () => {
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setImageFiles([]);
        setImagePreviewUrls([]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files ?? []);
        if (!newFiles.length) return;
        const combined = [...imageFiles, ...newFiles].slice(0, 5);
        const addedFiles = combined.slice(imageFiles.length);
        const newUrls = addedFiles.map(f => URL.createObjectURL(f));
        setImageFiles(combined);
        setImagePreviewUrls(prev => [...prev, ...newUrls]);
        e.target.value = '';
    };

    // Reset all state when the notebook changes
    useEffect(() => {
        setSessionId(null);
        clearPending();
        setInput('');
        clearAllImages();
        setIsStreaming(false);
        setCreateModalOpen(false);
        setNewSessionTitle('');
        lastSessionIdRef.current = null;
        shouldScrollToBottomRef.current = false;
        preserveScrollRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebookId]);

    // Auto-select the latest session when the list loads or changes
    useEffect(() => {
        if (!sessions.length) {
            if (sessionId !== null) setSessionId(null);
            return;
        }
        if (!sessionId) {
            const latestSession = [...sessions].sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
            if (latestSession) {
                shouldScrollToBottomRef.current = true;
                setSessionId(latestSession.id);
            }
            return;
        }
        if (!sessions.some((session) => session.id === sessionId)) {
            const latestSession = [...sessions].sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
            shouldScrollToBottomRef.current = true;
            setSessionId(latestSession?.id ?? null);
        }
    }, [sessions, sessionId]);

    // Clear pending exchange whenever the active session changes
    useEffect(() => {
        if (lastSessionIdRef.current !== sessionId) {
            lastSessionIdRef.current = sessionId;
            clearPending();
            shouldScrollToBottomRef.current = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Drop temp messages once the real exchange arrives in fetchedMessages
    useEffect(() => {
        if (!pendingUserMsg && !streamingAssistantMsg) return;
        const snapshot = exchangeSnapshotTimeRef.current;
        const confirmed = fetchedMessages.some(
            (m) => m.role === 'assistant' && (m.created_at ?? '') > snapshot
        );
        if (confirmed) clearPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedMessages]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            const cleanup = autoScrollListRef(messagesContainerRef.current);
            return cleanup;
        }
        return;
    }, []);

    useEffect(() => {
        if (!messagesContainerRef.current) return;

        if (preserveScrollRef.current) {
            const container = messagesContainerRef.current;
            const nextScrollHeight = container.scrollHeight;
            container.scrollTop += nextScrollHeight - previousScrollHeightRef.current;
            preserveScrollRef.current = false;
            return;
        }

        if (shouldScrollToBottomRef.current) {
            messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'auto' });
            shouldScrollToBottomRef.current = false;
        }
    }, [displayMessages]);

    const handleOpenSession = (nextSessionId: string) => {
        if (nextSessionId === sessionId) return;
        setSessionId(nextSessionId);
        clearPending();
        setInput('');
        setIsStreaming(false);
        shouldScrollToBottomRef.current = true;
    };

    const handleCreateSession = async () => {
        const title = newSessionTitle.trim();
        if (!title) return;
        try {
            const createdSession = await createSessionMutation.mutateAsync({ notebookId, title });
            await refetchChatSessions();
            setSessionId(createdSession.id);
            clearPending();
            setInput('');
            setIsStreaming(false);
            setCreateModalOpen(false);
            setNewSessionTitle('');
            shouldScrollToBottomRef.current = true;
        } catch (error) {
            console.error('Failed to create chat session', error);
        }
    };

    const handleSendMessage = async (overrideContent?: string) => {
        const content = (overrideContent ?? input).trim();
        if (!content || !sessionId) return;

        const now = Date.now();
        const currentImageFiles = imageFiles;
        const currentBlobUrls = imagePreviewUrls;

        exchangeSnapshotTimeRef.current = fetchedMessages[fetchedMessages.length - 1]?.created_at ?? '';
        pollCancelRef.current = false;

        setPendingUserMsg({
            id: `user-${now}`,
            role: 'user',
            content,
            imageBlobUrls: currentBlobUrls.length ? currentBlobUrls : undefined,
            created_at: new Date(now).toISOString(),
        });
        setStreamingAssistantMsg({
            id: `assistant-${now}`,
            role: 'assistant',
            content: '',
            created_at: new Date(now).toISOString(),
        });
        setInput('');
        setImageFiles([]);
        setImagePreviewUrls([]);
        setIsStreaming(true);
        shouldScrollToBottomRef.current = true;

        const form = new FormData();
        form.append('content', content);
        for (const file of currentImageFiles) form.append('images', file);

        try {
            await fetchEventSource(`${baseUrl}/notebooks/${notebookId}/chats/${sessionId}/messages/stream`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'text/event-stream',
                },
                body: form,
                onmessage(event) {
                    if (!event.data) return;
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'token') {
                            setStreamingAssistantMsg((prev) =>
                                prev ? { ...prev, content: prev.content + data.text } : null
                            );
                        } else if (data.type === 'citations') {
                            setStreamingAssistantMsg((prev) =>
                                prev ? { ...prev, citations: data.citations } : null
                            );
                        } else if (data.type === 'error') {
                            setStreamingAssistantMsg((prev) =>
                                prev ? { ...prev, content: data.text ?? 'Une erreur est survenue.' } : null
                            );
                            setIsStreaming(false);
                        } else if (data.type === 'done') {
                            setIsStreaming(false);
                            // Early refetch: server has finished generating, DB write
                            // likely committed, so grab the real messages now while the
                            // SSE connection is still technically open.
                            void refetchChatMessages();
                        }
                    } catch {
                        // Ignore malformed payloads.
                    }
                },
                onerror(error) {
                    setIsStreaming(false);
                    throw error;
                },
                onclose() {
                    setIsStreaming(false);
                    // Fallback poll: handles the race where the server closes the SSE
                    // connection slightly before the DB write is committed.
                    // The `done` refetch above already fired; this retries if it missed.
                    const snapshot = exchangeSnapshotTimeRef.current;
                    const poll = async (attempt = 0) => {
                        if (pollCancelRef.current) return;
                        try {
                            const result = await refetchChatMessages();
                            if (pollCancelRef.current) return;
                            const found = result.data?.pages?.some((page) =>
                                page.items?.some(
                                    (m) => m.role === 'assistant' && (m.created_at ?? '') > snapshot
                                )
                            ) ?? false;
                            if (found || attempt >= 5) {
                                if (!pollCancelRef.current) clearPending();
                            } else {
                                setTimeout(() => void poll(attempt + 1), 600);
                            }
                        } catch {
                            if (attempt < 5) {
                                setTimeout(() => void poll(attempt + 1), 600);
                            } else if (!pollCancelRef.current) {
                                clearPending();
                            }
                        }
                    };
                    void poll();
                },
            });
        } catch (error) {
            setIsStreaming(false);
            console.error('Stream failed', error);
        }
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container || !sessionId || !hasNextPage || isFetchingNextPage) return;

        if (container.scrollTop <= 120) {
            previousScrollHeightRef.current = container.scrollHeight;
            preserveScrollRef.current = true;
            void fetchNextPage();
        }
    };

    const sessionTitle = activeSession?.title ?? t('chat.session_default');
    const emptySidebar = !isLoadingChatSessions && sessions.length === 0;

    const sidebarProps: SidebarContentProps = {
        sessions, sessionId, emptySidebar, handleOpenSession, setCreateModalOpen,
    };

    return (
        <div className="flex h-full w-full gap-4 overflow-hidden relative">
            {/* Mobile drawer with framer-motion slide-in */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="fixed top-16 inset-0 z-50 xl:hidden">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                            onClick={() => setSidebarOpen(false)}
                        />
                        {/* Slide panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-[300px] p-4 flex flex-col z-10"
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card">
                                <SidebarContent {...sidebarProps} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Desktop Collapsible Sidebar */}
            <AnimatePresence initial={false}>
                {desktopSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 290, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="hidden xl:flex flex-col shrink-0 overflow-hidden rounded-2xl border-t border-r border-border bg-card "
                    >
                        <SidebarContent {...sidebarProps} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Interface */}
            <section className="flex flex-1 min-w-0 px-2 flex-col overflow-hidden bg-card">
                {/* Chat Header */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        {/* Desktop sidebar toggle button when closed/open */}
                        <button
                            type="button"
                            onClick={() => setDesktopSidebarOpen(prev => !prev)}
                            className="hidden xl:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-all"
                            title={desktopSidebarOpen ? t('chat.close_history') : t('chat.open_history')}
                        >
                            <svg className={`w-4 h-4 transition-transform ${desktopSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex xl:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-foreground/5 text-foreground/70 transition-all"
                            >
                                <Menu size={18} />
                            </button>
                            <h3 className="mt-0.5 text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{sessionTitle}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
                        >
                            <MessageCirclePlus size={16} />
                            <span className="hidden sm:block">{t('chat.new_session_label')}</span>
                        </button>
                    </div>
                </div>

                {/* Message list container */}
                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-2 py-6 scroll-smooth dark:bg-slate-900/10"
                >
                    <div className="max-w-6xl mx-auto space-y-6">
                        {!sessionId && !isLoadingChatSessions && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-5 border border-brand-100 dark:border-brand-900/50">
                                    <BotIcon className="w-8 h-8 text-brand-500 dark:text-brand-400" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">{t('chat.start_title')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                                    {t('chat.start_hint')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                                >
                                    <PlusIcon size={16} />
                                    {t('chat.create_chat_btn')}
                                </button>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {displayMessages.map((msg) => {
                                const sender = msg.role === 'user' ? 'user' : 'ai';
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            'flex gap-4',
                                            sender === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {sender === 'ai' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center border border-brand-100 dark:border-brand-900/50 mt-1">
                                                <BotIcon className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            'max-w-[90%] sm:max-w-[80%] text-sm sm:text-base leading-relaxed',
                                            sender === 'user'
                                                ? 'bg-brand-500 dark:bg-brand-600 px-5 py-3 rounded-3xl rounded-tr-sm text-white shadow-xs'
                                                : 'px-1 py-1'
                                        )}>
                                            {sender === 'user' ? (
                                                <div>
                                                    {(msg.imageBlobUrls ?? []).length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(msg.imageBlobUrls ?? []).map((url, i) => (
                                                                <img key={i} src={url} alt="" className="max-h-48 rounded-2xl object-cover" />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {!msg.imageBlobUrls?.length && (msg.image_urls ?? []).length > 0 && sessionId && (
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(msg.image_urls ?? []).map((_, i) => (
                                                                <ChatImage key={i} notebookId={notebookId} sessionId={sessionId} messageId={msg.id} index={i} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className="prose text-slate-700 dark:text-slate-200 prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
                                                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                                                    >{msg.content}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isStreaming && !streamingAssistantMsg?.content && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center border border-brand-100 dark:border-brand-900/50">
                                    <BotIcon className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-brand-500 dark:bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-brand-500 dark:bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-brand-500 dark:bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-white dark:bg-slate-900">
                    {!sessionId && !isLoadingChatSessions ? (
                        /* No session   CTA to create one */
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('chat.no_session_cta')}
                            </p>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(true)}
                                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                            >
                                <PlusIcon size={14} />
                                {t('chat.new_session_label')}
                            </button>
                        </div>
                    ) : isLoadingChatSessions ? (
                        /* Loading   neutral skeleton */
                        <div className="flex items-center justify-center py-4">
                            <div className="h-10 w-full max-w-3xl mx-4 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                        </div>
                    ) : (
                        /* Normal input */
                        <div className="lg:px-4 py-4">
                            <div className="max-w-3xl mx-auto">
                                {fetchedMessages.length < 2 && (
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {suggestedQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setInput(q);
                                                    inputRef.current?.focus();
                                                }}
                                                className="text-left px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white hover:bg-brand-50/50 dark:bg-slate-800/50 dark:hover:bg-brand-500/[0.08] hover:text-brand-500 dark:hover:text-brand-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all truncate"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {imagePreviewUrls.length > 0 && (
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        {imagePreviewUrls.map((url, i) => (
                                            <div key={i} className="relative inline-block">
                                                <img src={url} alt="" className="h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="relative flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        disabled={isStreaming || imageFiles.length >= 5}
                                        className="absolute left-2 p-2 text-slate-400 hover:text-brand-500 disabled:opacity-30 transition-colors rounded-full"
                                        title={t('chat.attach_image')}
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageSelect}
                                    />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                void handleSendMessage();
                                            }
                                        }}
                                        placeholder={t('chat.message_placeholder')}
                                        className="w-full py-3.5 pl-10 pr-12 bg-transparent border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                                        disabled={isStreaming}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => void handleSendMessage()}
                                        disabled={!input.trim() || isStreaming}
                                        className="absolute right-2 p-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-30 text-white rounded-full transition-all"
                                    >
                                        <SendIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-slate-400">
                                        {t('chat.ai_disclaimer')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} className="max-w-lg p-6">
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.create_session')}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {t('chat.create_hint')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('chat.session_title_label')}</label>
                            <input
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                placeholder={t('chat.session_title_placeholder')}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-300 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-brand-700"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                            >
                                {t('chat.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleCreateSession()}
                                disabled={!newSessionTitle.trim() || createSessionMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PlusIcon size={16} />
                                {t('chat.create_short')}
                            </button>
                        </div>
                    </div>
                </Modal>
            </section>
        </div>
    );
};

export default ChatStream;
