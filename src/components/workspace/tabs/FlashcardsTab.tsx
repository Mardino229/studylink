import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Trash2, Clock, Menu, Sparkles, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackPreview } from '../../summary/flashcards/flashcards';
import type { ArtefactFlashcard, PaginatedResponse } from '../../../types/workspace';
import { useUpdateFlashcardPosition, useSetFlashcardItemStatus } from '../../../utils/workspace';
import { PlusIcon } from '../../../icons';

interface FlashcardsTabProps {
    flashcards?: PaginatedResponse<ArtefactFlashcard>;
    isLoadingFlashcards: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'flashcards') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deleteFlashcard: { mutateAsync: (args: { notebookId: string; flashcardId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
    pendingSelectId?: string | null;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
    flashcards,
    isLoadingFlashcards,
    isGenerating,
    openGenerationModal,
    handleDelete,
    deleteFlashcard,
    notebookId,
    formatDate,
    pendingSelectId,
}) => {
    const { t } = useTranslation('workspace');
    const [selectedFlashcardBatchId, setSelectedFlashcardBatchId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [filter, setFilter] = useState<'all' | 'flagged'>('all');

    const updatePosition = useUpdateFlashcardPosition();
    const setItemStatus = useSetFlashcardItemStatus();

    const flashcardBatchesList = flashcards?.items ?? [];

    useEffect(() => {
        if (flashcardBatchesList.length === 0) {
            setSelectedFlashcardBatchId(null);
            return;
        }
        if (!selectedFlashcardBatchId || !flashcardBatchesList.some((b) => b.id === selectedFlashcardBatchId)) {
            setSelectedFlashcardBatchId(flashcardBatchesList[0].id);
        }
    }, [flashcardBatchesList, selectedFlashcardBatchId]);

    useEffect(() => {
        if (pendingSelectId) setSelectedFlashcardBatchId(pendingSelectId);
    }, [pendingSelectId]);

    // Reset filter when batch changes
    useEffect(() => {
        setFilter('all');
    }, [selectedFlashcardBatchId]);

    const selectedFlashcardBatch = flashcardBatchesList.find(b => b.id === selectedFlashcardBatchId) ?? flashcardBatchesList[0] ?? null;

    const selectedFlashcards = selectedFlashcardBatch?.items.map((item, index) => ({
        id: `${selectedFlashcardBatch.id}-${index}`,
        summary_id: selectedFlashcardBatch.id,
        question: item.front,
        answer: item.back,
        itemIndex: index,
        status: item.status,
    })) ?? [];

    const flaggedCount = selectedFlashcards.filter(fc => fc.status === 'review_again').length;
    const displayedFlashcards = filter === 'flagged'
        ? selectedFlashcards.filter(fc => fc.status === 'review_again')
        : selectedFlashcards;

    const handleNavigate = useCallback((itemIndex: number) => {
        if (!selectedFlashcardBatch || !notebookId) return;
        updatePosition.mutate({ notebookId, flashcardId: selectedFlashcardBatch.id, currentIndex: itemIndex });
    }, [selectedFlashcardBatch, notebookId, updatePosition]);

    const handleToggleStatus = useCallback((itemIndex: number, newStatus: 'review_again' | null) => {
        if (!selectedFlashcardBatch || !notebookId) return;
        setItemStatus.mutate({ notebookId, flashcardId: selectedFlashcardBatch.id, itemIndex, status: newStatus });
    }, [selectedFlashcardBatch, notebookId, setItemStatus]);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Layers size={16} className="text-orange-500" />
                        Flashcards
                    </h4>
                    <button
                        onClick={() => openGenerationModal('flashcards')}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                        <PlusIcon size={12} />
                        Créer
                    </button>  
                </div> 

                {/* Filter tabs */}
                {selectedFlashcardBatch && (
                    <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-white/5 p-0.5">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
                                filter === 'all'
                                    ? 'bg-white dark:bg-white/10 text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t('tabs.flashcards.all')}
                        </button>
                        <button
                            onClick={() => setFilter('flagged')}
                            className={`flex-1 inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
                                filter === 'flagged'
                                    ? 'bg-white dark:bg-white/10 text-amber-500 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Bookmark size={10} fill={filter === 'flagged' ? 'currentColor' : 'none'} />
                            {t('tabs.flashcards.to_review')}
                            {flaggedCount > 0 && (
                                <span className="ml-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 text-[9px] font-bold">
                                    {flaggedCount}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {flashcardBatchesList.map((batch) => {
                    const isActive = selectedFlashcardBatch?.id === batch.id;
                    const batchFlaggedCount = batch.items.filter(i => i.status === 'review_again').length;
                    return (
                        <div
                            key={batch.id}
                            className={`group relative rounded-xl border p-3 text-left transition-all ${
                                isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/30 shadow-sm'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setSelectedFlashcardBatchId(batch.id);
                                    setSidebarOpen(false);
                                }}
                                className="w-full text-left pr-8"
                            >
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {batch.title || t('tabs.flashcards.default_title')} ({batch.items.length})
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-xs text-foreground/50">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{formatDate(batch.created_at)}</span>
                                    </span>
                                    {batchFlaggedCount > 0 && (
                                        <span className="flex items-center gap-1 text-amber-500">
                                            <Bookmark size={10} fill="currentColor" />
                                            {batchFlaggedCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(t('tabs.flashcards.confirm_delete'), async () => {
                                        await deleteFlashcard.mutateAsync({ notebookId, flashcardId: batch.id });
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 focus:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                title={t('tabs.flashcards.delete_title')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
                {flashcardBatchesList.length === 0 && !isLoadingFlashcards && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        {t('tabs.flashcards.no_batches')}
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
                                <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg">
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
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="hidden xl:flex flex-col shrink-0 overflow-hidden rounded-2xl shadow-t-sm shadow-r-sm border-t border-r border-border bg-card"
                        >
                            <SidebarContent />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <section className="flex flex-1 min-w-0 px-2 flex-col overflow-hidden bg-card">
                    {/* Main Header */}
                    <div className="flex items-center justify-between px-2 py-3 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDesktopSidebarOpen(prev => !prev)}
                                className="hidden xl:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-all"
                                title={desktopSidebarOpen ? t('tabs.flashcards.close_list') : t('tabs.flashcards.open_list')}
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
                                {selectedFlashcardBatch?.title || t('tabs.flashcards.detail_default')}
                            </h3>
                        </div>

                        {selectedFlashcardBatch && (
                            <button
                                onClick={() => handleDelete('Supprimer ce lot de flashcards ?', async () => {
                                    await deleteFlashcard.mutateAsync({ notebookId, flashcardId: selectedFlashcardBatch.id });
                                })}
                                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-2.5 py-1.5 rounded-full font-medium transition-all"
                            >
                                <Trash2 size={12} />
                                {t('tabs.flashcards.delete_btn')}
                            </button>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                        {displayedFlashcards.length > 0 ? (
                            <div className="w-full pt-10 max-w-2xl">
                                <StackPreview
                                    key={`${selectedFlashcardBatch?.id}-${filter}`}
                                    flashcards={displayedFlashcards}
                                    initialIndex={filter === 'all' ? (selectedFlashcardBatch?.current_index ?? 0) : 0}
                                    onNavigate={filter === 'all' ? handleNavigate : undefined}
                                    onToggleStatus={handleToggleStatus}
                                />
                            </div>
                        ) : filter === 'flagged' ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-500/20 text-amber-500">
                                    <Bookmark size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">{t('tabs.flashcards.no_marked')}</h4>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {t('tabs.flashcards.no_marked_hint')}
                                </p>
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-4 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
                                >
                                    {t('tabs.flashcards.show_all')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50 text-brand-500">
                                    <Layers size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">{t('tabs.flashcards.empty')}</h4>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {t('tabs.flashcards.empty_hint')}
                                </p>
                                <button
                                    onClick={() => openGenerationModal('flashcards')}
                                    disabled={isGenerating}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all"
                                >
                                    <Sparkles size={16} />
                                    {t('tabs.flashcards.create_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FlashcardsTab;
