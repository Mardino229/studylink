import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Clock, Menu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackPreview } from '../../summary/flashcards/flashcards';
import type { ArtefactFlashcard, PaginatedResponse } from '../../../types/workspace';

interface FlashcardsTabProps {
    flashcards?: PaginatedResponse<ArtefactFlashcard>;
    isLoadingFlashcards: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'flashcards') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deleteFlashcard: { mutateAsync: (args: { notebookId: string; flashcardId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
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
}) => {
    const [selectedFlashcardBatchId, setSelectedFlashcardBatchId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

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

    const selectedFlashcardBatch = flashcardBatchesList.find(batch => batch.id === selectedFlashcardBatchId) ?? flashcardBatchesList[0] ?? null;
    const selectedFlashcards = selectedFlashcardBatch?.items.map((item, index) => ({
        id: item.id || `${selectedFlashcardBatch.id}-${index}`,
        summary_id: selectedFlashcardBatch.id,
        question: item.front,
        answer: item.back,
    })) ?? [];

    const SidebarContent = () => (
        <div className="flex h-full flex-col ">
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
                        <Sparkles size={12} />
                        Générer
                    </button>
                </div>
                
            </div>

            {/* Sidebar Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {flashcardBatchesList.map((batch) => {
                    const isActive = selectedFlashcardBatch?.id === batch.id;
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
                                <p className="truncate text-sm font-semibold text-foreground">{batch.title || 'Flashcards'} ({batch.items.length} cartes)</p>
                                <div className="mt-1 flex items-center gap-3 text-xs text-foreground/50">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{formatDate(batch.created_at)}</span>
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete('Supprimer ce lot de flashcards ?', async () => {
                                        await deleteFlashcard.mutateAsync({ notebookId, flashcardId: batch.id });
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                title="Supprimer"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
                {flashcardBatchesList.length === 0 && !isLoadingFlashcards && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        Aucun lot généré.
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
                            className="hidden xl:flex flex-col shrink-0 overflow-hidden rounded-2xl shadow-t-sm shadow-r-sm border-t border-r border-border  bg-card"
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
                                title={desktopSidebarOpen ? "Fermer la liste" : "Ouvrir la liste"}
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
                                {selectedFlashcardBatch?.title || 'Détails des Flashcards'}
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
                                Supprimer
                            </button>
                        )}
                    </div>

                    {/* Main Content (StackPreview / Empty State) */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                        {selectedFlashcards.length > 0 ? (
                            <div className="w-full pt-10 max-w-2xl">
                                <StackPreview flashcards={selectedFlashcards} />
                            </div> 
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50 text-brand-500">
                                    <Layers size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">Aucune flashcard sélectionnée</h4>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    Sélectionnez un lot de flashcards dans la liste ou générez-en un nouveau lot.
                                </p>
                                <button
                                    onClick={() => openGenerationModal('flashcards')}
                                    disabled={isGenerating}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all"
                                >
                                    <Sparkles size={16} />
                                    Préparer les flashcards
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
