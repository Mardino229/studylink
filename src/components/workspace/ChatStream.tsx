import React, { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useCreateChatSession, useGetChatMessages, useGetChatSessions } from '../../utils/workspace';
import { SendIcon, BotIcon, PlusIcon, MessageSquare, Clock3, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { autoScrollListRef } from '../summary/ai/use-auto-scroll';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { baseUrl } from '../../utils/api.ts';
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
    created_at?: string;
}

const SUGGESTED_QUESTIONS = [
    "Explique-moi ce concept",
    "Donne-moi un exemple",
    "Quels sont les points clés ?",
    "Crée un quiz",
];

const toUiMessage = (message: WorkspaceChatMessage): Message => ({
    id: message.id,
    role: message.role,
    content: message.content,
    citations: message.citations,
    created_at: message.created_at,
});

const sortMessages = (messages: Message[]) =>
    [...messages].sort((left, right) => {
        const leftTime = left.created_at ?? '';
        const rightTime = right.created_at ?? '';
        return leftTime.localeCompare(rightTime);
    });

const mergeMessages = (baseMessages: Message[], incomingMessages: Message[]) => {
    const byId = new Map<string, Message>();
    baseMessages.forEach((message) => byId.set(message.id, message));
    incomingMessages.forEach((message) => {
        const current = byId.get(message.id);
        byId.set(message.id, current ? { ...current, ...message } : message);
    });
    return sortMessages(Array.from(byId.values()));
};

const ChatStream: React.FC<ChatStreamProps> = ({ notebookId }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottomRef = useRef(false);
    const preserveScrollRef = useRef(false);
    const previousScrollHeightRef = useRef(0);
    const lastSessionIdRef = useRef<string | null>(null);

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
        isLoading: isLoadingChatMessages,
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

    useEffect(() => {
        setSessionId(null);
        setMessages([]);
        setInput('');
        setIsStreaming(false);
        setCreateModalOpen(false);
        setNewSessionTitle('');
        lastSessionIdRef.current = null;
        shouldScrollToBottomRef.current = false;
        preserveScrollRef.current = false;
    }, [notebookId]);

    useEffect(() => {
        if (!sessions.length) {
            if (sessionId !== null) {
                setSessionId(null);
                setMessages([]);
            }
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

    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            return;
        }

        if (lastSessionIdRef.current !== sessionId) {
            lastSessionIdRef.current = sessionId;
            setMessages([]);
            shouldScrollToBottomRef.current = true;
        }

        if (!fetchedMessages.length) {
            if (!isLoadingChatMessages) {
                setMessages((current) => mergeMessages(current, []));
            }
            return;
        }

        setMessages((current) => mergeMessages(current, fetchedMessages));
    }, [fetchedMessages, isLoadingChatMessages, sessionId]);

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
    }, [messages]);

    const handleOpenSession = (nextSessionId: string) => {
        if (nextSessionId === sessionId) return;
        setSessionId(nextSessionId);
        setMessages([]);
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
            setMessages([]);
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

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        };
        const assistantMessageId = `assistant-${Date.now() + 1}`;

        setMessages((current) => sortMessages([...current, userMessage, { id: assistantMessageId, role: 'assistant', content: '', created_at: new Date().toISOString() }]));
        setInput('');
        setIsStreaming(true);
        shouldScrollToBottomRef.current = true;

        try {
            await fetchEventSource(`${baseUrl}/notebooks/${notebookId}/chats/${sessionId}/messages/stream`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({ content }),
                onmessage(event) {
                    if (!event.data) return;

                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'token') {
                            setMessages((current) => current.map((message) => (
                                message.id === assistantMessageId
                                    ? { ...message, content: message.content + data.text }
                                    : message
                            )));
                        } else if (data.type === 'citations') {
                            setMessages((current) => current.map((message) => (
                                message.id === assistantMessageId
                                    ? { ...message, citations: data.citations }
                                    : message
                            )));
                        } else if (data.type === 'done') {
                            setIsStreaming(false);
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
                    void refetchChatMessages();
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

    const sessionTitle = activeSession?.title ?? 'Assistant IA';
    const emptySidebar = !isLoadingChatSessions && sessions.length === 0;

    const SidebarContent = () => (
        <>
            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-foreground/50">Historique </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                    >
                        <PlusIcon size={12} />
                        Nouvelle
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {emptySidebar && (
                    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-6 text-center">
                        <MessageSquare className="text-foreground/40" size={28} />
                        <p className="mt-3 text-sm font-medium text-foreground/80">Aucune session</p>
                        <p className="mt-1 text-xs text-foreground/50">Crée une session pour commencer à discuter.</p>
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                        >
                            <PlusIcon size={16} />
                            Créer une session
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
                                                <span>{new Date(session.created_at).toLocaleString('fr-FR')}</span>
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
                                <SidebarContent />
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
                        <SidebarContent />
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
                            title={desktopSidebarOpen ? "Fermer l'historique" : "Ouvrir l'historique"}
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
                        {/* Mobile sidebar toggle button */}
                        {/*<button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 xl:hidden"
                        >
                            <MessageSquare size={16} />
                            Historique
                        </button>*/}
                        
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5"
                        >
                            <PlusIcon size={16} />
                            Nouvelle session
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
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-full flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50">
                                    <BotIcon className="w-6 h-6 text-brand-500 dark:text-brand-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Comment puis-je vous aider ?</p>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((msg) => {
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
                                                : 'px-1 py-1 text-slate-700 dark:text-slate-200'
                                        )}>
                                            {sender === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isStreaming && (
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
                <div className="p-4 border-t border-border bg-white dark:bg-slate-900">
                    <div className="max-w-3xl mx-auto">
                        {messages.length < 2 && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => void handleSendMessage(q)}
                                        className="text-left px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white hover:bg-brand-50/50 dark:bg-slate-800/50 dark:hover:bg-brand-500/[0.08] hover:text-brand-500 dark:hover:text-brand-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all truncate"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        void handleSendMessage();
                                    }
                                }}
                                placeholder="Envoyer un message..."
                                className="w-full py-3.5 pl-5 pr-12 bg-transparent border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                                disabled={!sessionId || isStreaming}
                            />
                            <button
                                onClick={() => void handleSendMessage()}
                                disabled={!input.trim() || isStreaming || !sessionId}
                                className="absolute right-2 p-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-30 text-white rounded-full transition-all"
                            >
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-slate-400">
                                L'IA peut faire des erreurs. Envisagez de vérifier les informations importantes.
                            </p>
                        </div>
                    </div>
                </div>

                <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} className="max-w-lg p-6">
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Créer une session</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Donne un titre à la nouvelle conversation avant de commencer.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                            <input
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                placeholder="Ex: Révisions thermodynamique"
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
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleCreateSession()}
                                disabled={!newSessionTitle.trim() || createSessionMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PlusIcon size={16} />
                                Créer
                            </button>
                        </div>
                    </div>
                </Modal>
            </section>
        </div>
    );
};

export default ChatStream;
