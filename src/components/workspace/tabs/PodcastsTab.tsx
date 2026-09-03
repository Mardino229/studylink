import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Trash2, Clock, Loader, Menu, Play, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArtefactPodcast, PaginatedResponse } from '../../../types/workspace';
import { PlusIcon } from '../../../icons';
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import Mermaid from "../../ui/Mermaid.tsx";


interface PodcastsTabProps {
    podcasts?: PaginatedResponse<ArtefactPodcast>;
    isLoadingPodcasts: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'podcast') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deletePodcast: { mutateAsync: (args: { notebookId: string; podcastId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
    pendingSelectId?: string | null;
}

export const PodcastsTab: React.FC<PodcastsTabProps> = ({
    podcasts,
    isLoadingPodcasts,
    isGenerating,
    openGenerationModal,
    handleDelete,
    deletePodcast,
    notebookId,
    formatDate,
    pendingSelectId,
}) => {
    const { t } = useTranslation('workspace');
    const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.75);

    const podcastsList = podcasts?.items ?? [];

    useEffect(() => {
        if (!selectedPodcastId && podcastsList.length > 0) {
            setSelectedPodcastId(podcastsList[0].id);
        }
    }, [podcastsList, selectedPodcastId]);

    useEffect(() => {
        if (pendingSelectId) setSelectedPodcastId(pendingSelectId);
    }, [pendingSelectId]);

    const selectedPodcast = podcastsList.find(p => p.id === selectedPodcastId) ?? podcastsList[0] ?? null;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }

        const handleLoadedMetadata = () => {
            setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [selectedPodcast?.audio_url]);

    useEffect(() => {
        const audio = audioRef.current;
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, [selectedPodcast?.id]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const formatTime = (timeInSeconds: number) => {
        if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
            return '0:00';
        }

        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60)
            .toString()
            .padStart(2, '0');

        return `${minutes}:${seconds}`;
    };

    const playbackProgress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    const togglePlayback = async () => {
        const audio = audioRef.current;
        if (!audio || !selectedPodcast?.audio_url) {
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
            } catch {
                setIsPlaying(false);
            }
            return;
        }

        audio.pause();
    };

    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio || duration <= 0) {
            return;
        }

        const nextTime = (Number(event.target.value) / 100) * duration;
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const handleSkip = (deltaSeconds: number) => {
        const audio = audioRef.current;
        if (!audio || duration <= 0) {
            return;
        }

        const nextTime = Math.max(0, Math.min(audio.currentTime + deltaSeconds, duration));
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const renderMathMarkdown = (content: string, className?: string) => (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm, remarkBreaks, remarkEmoji, [remarkToc, { heading: "sommaire|toc|table of contents" }]]}
                rehypePlugins={[rehypeKatex, rehypeSlug, rehypeAutolinkHeadings, rehypeRaw]}
                components={{
                    p: ({ children }) => <>{children}</>,
                    code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match && match[1] === "mermaid" ? (
                            <Mermaid chart={String(children).replace(/\n$/, "")} />
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );

    const SidebarContent = () => (
        <div className="flex h-full flex-col ">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Mic size={16} className="text-indigo-500" />
                    Audio Briefs
                </h4>
                <button
                    onClick={() => openGenerationModal('podcast')}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                    <PlusIcon size={12} />
                    {t('tabs.podcasts.create_short')}
                </button>
            </div>

            {/* Sidebar Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {podcastsList.map((podcast) => {
                    const isActive = selectedPodcast?.id === podcast.id;
                    return (
                        <div
                            key={podcast.id}
                            className={`group relative rounded-xl border p-3 text-left transition-all ${
                                isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/30 shadow-sm'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setSelectedPodcastId(podcast.id);
                                    setSidebarOpen(false);
                                    setIsPlaying(false);
                                }}
                                className="w-full text-left pr-8"
                            >
                                <p className="truncate text-sm font-semibold text-foreground">{podcast.title || t('tabs.podcasts.default_title')}</p>
                                <div className="mt-1 flex items-center gap-1 text-xs text-foreground/50">
                                    {(podcast.status === 'processing' || podcast.status === 'pending') ? (
                                        <>
                                            <Loader size={12} className="animate-spin" />
                                            <span>{t('tabs.podcasts.generating')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock size={12} />
                                            <span>{formatDate(podcast.created_at)}</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(t('tabs.podcasts.confirm_delete'), async () => {
                                        await deletePodcast.mutateAsync({ notebookId, podcastId: podcast.id });
                                        if (selectedPodcastId === podcast.id) {
                                            setSelectedPodcastId(null);
                                        }
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                title={t('tabs.podcasts.delete_title')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
                {podcastsList.length === 0 && !isLoadingPodcasts && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        {t('tabs.podcasts.no_podcasts')}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className='h-full'>
                    <div className="flex h-full sm:p-4 p-1 w-full gap-4 overflow-hidden relative">
                        {/* Mobile Drawer */}
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
                            className="absolute left-0 top-0 bottom-0 w-[280px] p-4 flex flex-col z-10"
                        >
                            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-lg">
                                <SidebarContent />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <AnimatePresence initial={false}>
                {desktopSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="hidden xl:flex flex-col shrink-0 overflow-hidden rounded-2xl border-t border-r border-border bg-card "
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <section className="flex flex-1 min-w-0 px-2 flex-col overflow-hidden rounded-2xl">
                {/* Main Header */}
                <div className="flex items-center justify-between py-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setDesktopSidebarOpen(prev => !prev)}
                            className="hidden xl:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-all"
                            title={desktopSidebarOpen ? t('tabs.podcasts.close_list') : t('tabs.podcasts.open_list')}
                        >
                            <svg className={`w-4 h-4 transition-transform ${desktopSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex xl:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-foreground/5 text-foreground/70 transition-all"
                        >
                            <Menu size={18} />
                        </button>
                        <h3 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                            {selectedPodcast?.title || t('tabs.podcasts.detail_default')}
                        </h3>
                    </div>

                    {selectedPodcast && (
                        <button
                            onClick={() => handleDelete(t('tabs.podcasts.confirm_delete'), async () => {
                                await deletePodcast.mutateAsync({ notebookId, podcastId: selectedPodcast.id });
                                setSelectedPodcastId(null);
                            })}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-2.5 py-1.5 rounded-full font-medium transition-all"
                        >
                            <Trash2 size={12} />
                            <span className="hidden sm:block">{t('tabs.podcasts.delete_title')}</span>
                        </button>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto sm:p-6 scroll-smooth">
                    {selectedPodcast ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Audio Player */}
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-emerald-500/5 dark:to-teal-500/5 text-white border border-emerald-500/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl flex items-center justify-center text-white">
                                    <Mic size={32} />
                                </div>
                                <div className="flex-1 min-w-0 w-full text-center md:text-left space-y-3">
                                    <div>
                                        <h4 className="text-base font-bold truncate">{selectedPodcast.title || t('tabs.podcasts.briefing_default')}</h4>
                                        <p className="text-xs  mt-1">{t('tabs.podcasts.created_at', { date: formatDate(selectedPodcast.created_at) })}</p>
                                    </div>

                                    {(selectedPodcast.status === 'processing' || selectedPodcast.status === 'pending') ? (
                                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/10 px-4 py-3 text-sm text-white/90">
                                            <Loader size={16} className="animate-spin shrink-0" />
                                            <span>{t('tabs.podcasts.in_progress')}</span>
                                        </div>
                                    ) : selectedPodcast.audio_url ? (
                                        <div className="flex flex-col gap-3">
                                            <audio ref={audioRef} src={selectedPodcast.audio_url} preload="metadata" />

                                            <div className="flex items-center gap-3">
                                                <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    step={0.1}
                                                    value={playbackProgress}
                                                    onChange={handleSeek}
                                                    className="h-1.5 flex-1 cursor-pointer accent-white-500"
                                                    aria-label={t('tabs.podcasts.progress_label')}
                                                />
                                                <span className="text-xs tabular-nums">{formatTime(duration)}</span>
                                            </div>

                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSkip(-15)}
                                                        className="p-2 transition-all hover:bg-foreground/5 rounded-full"
                                                        aria-label={t('tabs.podcasts.rewind')}
                                                    >
                                                        <SkipBack size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={togglePlayback}
                                                        className="inline-flex items-center justify-center h-12 w-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all shadow-sm hover:scale-105"
                                                        aria-label={isPlaying ? t('tabs.podcasts.pause') : t('tabs.podcasts.play')}
                                                    >
                                                        <Play size={20} className={isPlaying ? 'hidden' : 'ml-0.5'} />
                                                        <svg className={`h-5 w-5 ${isPlaying ? 'block' : 'hidden'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSkip(15)}
                                                        className="p-2 transition-all hover:bg-foreground/5 rounded-full"
                                                        aria-label={t('tabs.podcasts.forward')}
                                                    >
                                                        <SkipForward size={16} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 text-white md:ml-6">
                                                    <Volume2 size={16} />
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={volume}
                                                        onChange={(event) => setVolume(Number(event.target.value))}
                                                        className="h-1 w-24 cursor-pointer accent-white-500"
                                                        aria-label={t('tabs.podcasts.volume')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
                                            {t('tabs.podcasts.no_audio_url')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transcript Content */}
                            {selectedPodcast.transcript && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground tracking-wider border-b border-border pb-2">{t('tabs.podcasts.transcript')}</h3>
                                    <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap bg-background p-5 rounded-2xl border border-border">
                                        
                                        {renderMathMarkdown(selectedPodcast.transcript)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50 text-brand-500">
                                <Mic size={28} />
                            </div>
                            <h4 className="text-base font-bold text-foreground">{t('tabs.podcasts.empty')}</h4>
                            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                {t('tabs.podcasts.empty_hint')}
                            </p>
                            <button
                                onClick={() => openGenerationModal('podcast')}
                                disabled={isGenerating}
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all"
                            >
                                <PlusIcon size={16} />
                                {t('tabs.podcasts.create_btn')}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
        </div>
    );
};

export default PodcastsTab;
