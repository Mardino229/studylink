import React, { useEffect, useRef, useState } from 'react';
import { FileText, Sparkles, Trash2, Clock, Menu, Loader2, Volume2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Mermaid from '../../ui/Mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import 'katex/dist/katex.min.css';
import { useQueryClient } from '@tanstack/react-query';
import { useAxiosPrivate } from '../../../hoooks/useAxiosPrivate.ts';
import { baseUrl } from '../../../utils/api.ts';
import type { ArtefactSummary, PaginatedResponse } from '../../../types/workspace';

interface SummariesTabProps {
    summaries?: PaginatedResponse<ArtefactSummary>;
    isLoadingSummaries: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'summary') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deleteSummary: { mutateAsync: (args: { notebookId: string; summaryId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
}

export const SummariesTab: React.FC<SummariesTabProps> = ({
    summaries,
    isLoadingSummaries,
    isGenerating,
    openGenerationModal,
    handleDelete,
    deleteSummary,
    notebookId,
    formatDate,
}) => {
    const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [audioRequestSummaryId, setAudioRequestSummaryId] = useState<string | null>(null);
    const [audioOverrides, setAudioOverrides] = useState<Record<string, Pick<ArtefactSummary, 'audio_status' | 'audio_url'>>>({});

    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    const audioStreamAbortRef = useRef<AbortController | null>(null);

    const summariesList = summaries?.items ?? [];

    const applyAudioOverride = (summaryId: string, patch: Pick<ArtefactSummary, 'audio_status' | 'audio_url'>) => {
        setAudioOverrides((current) => ({
            ...current,
            [summaryId]: {
                ...current[summaryId],
                ...patch,
            },
        }));
    };

    const mergeSummaryAudio = (summary: ArtefactSummary) => {
        const override = audioOverrides[summary.id];
        return {
            ...summary,
            audio_status: override?.audio_status ?? summary.audio_status,
            audio_url: override?.audio_url ?? summary.audio_url ?? null,
        };
    };

    const mergedSummariesList = summariesList.map(mergeSummaryAudio);

    useEffect(() => {
        if (!selectedSummaryId && mergedSummariesList.length > 0) {
            setSelectedSummaryId(mergedSummariesList[0].id);
        }
    }, [mergedSummariesList, selectedSummaryId]);

    useEffect(() => {
        return () => {
            audioStreamAbortRef.current?.abort();
            audioStreamAbortRef.current = null;
        };
    }, []);

    const selectedSummary = mergedSummariesList.find((summary) => summary.id === selectedSummaryId) ?? mergedSummariesList[0] ?? null;

    const getAudioStatusLabel = (status?: ArtefactSummary['audio_status']) => {
        if (status === 'processing') return 'Audio en cours';
        if (status === 'completed') return 'Audio prêt';
        if (status === 'error') return 'Audio en erreur';
        if (status === 'pending') return 'Audio en attente';
        return null;
    };

    const getAudioStatusClass = (status?: ArtefactSummary['audio_status']) => {
        if (status === 'processing') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200';
        if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200';
        if (status === 'error') return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200';
        return 'border-border bg-background text-foreground/60';
    };

    const handleGenerateAudio = async (summaryId: string) => {
        if (!notebookId) return;

        audioStreamAbortRef.current?.abort();
        const controller = new AbortController();
        audioStreamAbortRef.current = controller;

        setAudioRequestSummaryId(summaryId);
        applyAudioOverride(summaryId, {
            audio_status: 'processing',
            audio_url: null,
        });

        try {
            await axiosPrivate.post(`/notebooks/${notebookId}/artefacts/summaries/${summaryId}/audio`);

            await fetchEventSource(`${baseUrl}/notebooks/${notebookId}/artefacts/summaries/${summaryId}/audio/stream`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Accept: 'text/event-stream',
                },
                signal: controller.signal,
                async onopen(response) {
                    if (!response.ok) {
                        throw new Error('Unable to open summary audio stream');
                    }
                },
                onmessage(event) {
                    if (!event.data) return;

                    try {
                        const payload = JSON.parse(event.data) as {
                            status?: ArtefactSummary['audio_status'];
                            audio_url?: string | null;
                            summary_id?: string;
                        };

                        if (payload.summary_id && payload.summary_id !== summaryId) {
                            return;
                        }

                        applyAudioOverride(summaryId, {
                            audio_status: payload.status ?? 'processing',
                            audio_url: payload.audio_url ?? null,
                        });

                        if (payload.status === 'completed' || payload.status === 'error') {
                            void queryClient.refetchQueries({ queryKey: ['artefact-summaries', notebookId] });
                            controller.abort();
                        }
                    } catch {
                        // Ignore malformed stream payloads.
                    }
                },
                onerror(error) {
                    applyAudioOverride(summaryId, {
                        audio_status: 'error',
                    });
                    throw error;
                },
                onclose() {
                    void queryClient.refetchQueries({ queryKey: ['artefact-summaries', notebookId] });
                    if (audioStreamAbortRef.current === controller) {
                        audioStreamAbortRef.current = null;
                    }
                },
            });
        } catch {
            applyAudioOverride(summaryId, {
                audio_status: 'error',
            });
        } finally {
            setAudioRequestSummaryId(null);
            if (audioStreamAbortRef.current === controller) {
                audioStreamAbortRef.current = null;
            }
        }
    };

    const renderMarkdown = (content: string) => {
        // Normalize literal \n / \t escape sequences to real characters in case
        // the backend double-encoded the string.
        const normalized = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        return (
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 leading-tight">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-7 mb-3 leading-tight border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mt-5 mb-2">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2">{children}</h4>,
                    p: ({ children }) => <p className="my-3 leading-7 text-gray-700 dark:text-gray-300">{children}</p>,
                    ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
                    ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
                    li: ({ children }) => <li className="leading-7 pl-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ href, children }) => <a href={href} className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">{children}</a>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-500 dark:text-gray-400">{children}</blockquote>,
                    hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
                    table: ({ children }) => (
                        <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800/60">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
                    tr: ({ children }) => <tr className="even:bg-gray-50/50 dark:even:bg-white/[0.02]">{children}</tr>,
                    th: ({ children }) => <th className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{children}</th>,
                    td: ({ children }) => <td className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{children}</td>,
                    pre: ({ node, children }) => {
                        // If the pre contains a mermaid code block, skip the pre wrapper
                        // so the Mermaid component can render unobstructed.
                        const hasMermaid = (node as { children?: { tagName?: string; properties?: { className?: string[] } }[] })
                            ?.children?.some(
                                (c) => c.tagName === 'code' && c.properties?.className?.some((cls) => cls.includes('mermaid'))
                            );
                        if (hasMermaid) return <>{children}</>;
                        return (
                            <pre className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 my-4 overflow-x-auto text-sm font-mono leading-relaxed">
                                {children}
                            </pre>
                        );
                    },
                    code({ className, children, ...props }: React.ComponentProps<'code'> & { className?: string; children?: React.ReactNode }) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (match && match[1] === 'mermaid') {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                        }
                        if (match) {
                            return <code className="text-sm font-mono" {...props}>{children}</code>;
                        }
                        return (
                            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {normalized}
            </ReactMarkdown>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <FileText size={16} className="text-brand-500" />
                    Historique
                </h4>
                <button
                    onClick={() => openGenerationModal('summary')}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 disabled:opacity-50"
                >
                    <Sparkles size={12} />
                    Générer
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {mergedSummariesList.map((summary) => {
                    const isActive = selectedSummary?.id === summary.id;
                    const audioLabel = getAudioStatusLabel(summary.audio_status);

                    return (
                        <div
                            key={summary.id}
                            className={`group relative rounded-xl border p-3 text-left transition-all ${
                                isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setSelectedSummaryId(summary.id);
                                    setSidebarOpen(false);
                                }}
                                className="w-full pr-8 text-left"
                            >
                                <p className="truncate text-sm font-semibold text-foreground">{summary.title || 'Résumé'}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                                    <Clock size={12} />
                                    <span>{formatDate(summary.created_at)}</span>
                                    {audioLabel && (
                                        <span className={`rounded-full border px-2 py-0.5 font-medium ${getAudioStatusClass(summary.audio_status)}`}>
                                            {audioLabel}
                                        </span>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete('Supprimer ce résumé ?', async () => {
                                        await deleteSummary.mutateAsync({ notebookId, summaryId: summary.id });
                                        if (selectedSummaryId === summary.id) {
                                            setSelectedSummaryId(null);
                                        }
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-950/20"
                                title="Supprimer"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}

                {mergedSummariesList.length === 0 && !isLoadingSummaries && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        Aucun résumé.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full">
            <div className="relative flex h-full w-full gap-4 overflow-hidden p-1 sm:p-4">
                <AnimatePresence>
                    {sidebarOpen && (
                        <div className="fixed top-16 inset-0 z-50 xl:hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 top-0 z-10 flex w-[280px] flex-col p-4"
                            >
                                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                                    <SidebarContent />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {desktopSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="hidden shrink-0 overflow-hidden rounded-2xl border-t border-r border-border bg-card xl:flex xl:flex-col"
                        >
                            <SidebarContent />
                        </motion.aside>
                    )}
                </AnimatePresence>

                <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl px-2">
                    <div className="flex shrink-0 items-center justify-between px-2 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDesktopSidebarOpen((prev) => !prev)}
                                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground/70 transition-all hover:bg-foreground/5 hover:text-foreground xl:inline-flex"
                                title={desktopSidebarOpen ? "Fermer l'historique" : "Ouvrir l'historique"}
                            >
                                <svg className={`h-4 w-4 transition-transform ${desktopSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground/70 transition-all hover:bg-foreground/5 xl:hidden"
                            >
                                <Menu size={18} />
                            </button>
                            <h3 className="max-w-[200px] truncate text-sm font-bold text-foreground sm:max-w-xs">
                                {selectedSummary?.title || 'Détails du résumé'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedSummary && (
                                <button
                                    onClick={() => handleGenerateAudio(selectedSummary.id)}
                                    disabled={audioRequestSummaryId === selectedSummary.id || selectedSummary.audio_status === 'processing'}
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/20 dark:text-emerald-100 dark:hover:bg-emerald-950/40"
                                >
                                    {audioRequestSummaryId === selectedSummary.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                                    <span className="">
                                        {selectedSummary.audio_status === 'completed' ? 'Régénérer audio' : 'Générer audio'}
                                    </span>
                                </button>
                            )}

                            {selectedSummary && (
                                <button
                                    onClick={() => handleDelete('Supprimer ce résumé ?', async () => {
                                        await deleteSummary.mutateAsync({ notebookId, summaryId: selectedSummary.id });
                                        setSelectedSummaryId(null);
                                    })}
                                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-100 hover:text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40"
                                >
                                    <Trash2 size={12} />
                                    <span className="hidden sm:block">Supprimer</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="scroll-smooth flex-1 overflow-y-auto p-2 sm:p-6">
                        {selectedSummary ? (
                            <div className="mx-auto max-w-4xl space-y-6">
                                {selectedSummary.audio_status === 'processing' && (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-2 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
                                        L'audio du résumé est en génération. Le lecteur apparaîtra automatiquement dès qu'il sera prêt.
                                    </div>
                                )}

                                {selectedSummary.audio_url && selectedSummary.audio_status === 'completed' && (
                                    <div className="p-2">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                                            <Play size={16} />
                                            Lecture audio du résumé
                                        </div>
                                        <audio controls preload="metadata" src={selectedSummary.audio_url} className="w-full" />
                                    </div>
                                )}

                                {selectedSummary.audio_status === 'error' && !selectedSummary.audio_url && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-2 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100">
                                        La génération audio a échoué. Tu peux relancer la génération.
                                    </div>
                                )}

                                <div className="">
                                    {renderMarkdown(selectedSummary.content)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-500 dark:border-brand-900/50 dark:bg-brand-950/30">
                                    <FileText size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">Aucun résumé sélectionné</h4>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                    Sélectionnez un résumé existant dans l'historique ou générez-en un nouveau dès maintenant.
                                </p>
                                <button
                                    onClick={() => openGenerationModal('summary')}
                                    disabled={isGenerating}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600"
                                >
                                    <Sparkles size={16} />
                                    Générer un résumé
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SummariesTab;