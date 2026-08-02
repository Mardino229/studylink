import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Trash2, Clock, Menu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizRunner from '../../summary/quiz/quiz';
import { useGetArtefactQuiz } from '../../../utils/workspace';
import type { ArtefactQuiz, PaginatedResponse } from '../../../types/workspace';
import { PlusIcon } from '../../../icons';

interface QuizzesTabProps {
    quizzes?: PaginatedResponse<ArtefactQuiz>;
    isLoadingQuizzes: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'quiz') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deleteQuiz: { mutateAsync: (args: { notebookId: string; quizId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
}

export const QuizzesTab: React.FC<QuizzesTabProps> = ({
    quizzes,
    isLoadingQuizzes,
    isGenerating,
    openGenerationModal,
    handleDelete,
    deleteQuiz,
    notebookId,
    formatDate,
}) => {
    const { t } = useTranslation('workspace');
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

    const quizzesList = quizzes?.items ?? [];

    useEffect(() => {
        if (quizzesList.length === 0) {
            setSelectedQuizId(null);
            return;
        }
        if (!selectedQuizId || !quizzesList.some((q) => q.id === selectedQuizId)) {
            setSelectedQuizId(quizzesList[0].id);
        }
    }, [quizzesList, selectedQuizId]);

    const { data: selectedQuizDetail, isLoading: isLoadingSelectedQuiz } = useGetArtefactQuiz(notebookId, selectedQuizId ?? undefined);

    const selectedQuiz = quizzesList.find((quiz) => quiz.id === selectedQuizId) ?? quizzesList[0] ?? null;
    const selectedQuizForRunner = selectedQuizDetail
        ? [{
            id: selectedQuizDetail.id,
            quiz_name: selectedQuizDetail.title || 'Quiz',
            questions: (selectedQuizDetail.questions || []).map((q) => ({
                type: 'mcq' as const,
                question: q.question_text,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
            })),
        }]
        : [];

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <HelpCircle size={16} className="text-violet-500" />
                        Quiz
                    </h4>
                    <button
                        onClick={() => openGenerationModal('quiz')}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                    >
                        <PlusIcon size={12} />
                        Créer
                    </button>
                </div>

            </div>

            {/* Sidebar Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {quizzesList.map((quiz) => {
                    const isActive = selectedQuiz?.id === quiz.id;
                    return (
                        <div
                            key={quiz.id}
                            className={`group relative rounded-xl border p-3 text-left transition-all ${
                                isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/30 shadow-sm'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setSelectedQuizId(quiz.id);
                                    setSidebarOpen(false);
                                }}
                                className="w-full text-left pr-8"
                            >
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {quiz.title || t('tabs.quizzes.quiz_default_title')} ({quiz.questions?.length ?? '…'})
                                </p>
                                <div className="mt-1 flex items-center gap-1 text-xs text-foreground/50">
                                    <Clock size={12} />
                                    <span>{formatDate(quiz.created_at)}</span>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(t('tabs.quizzes.confirm_delete'), async () => {
                                        await deleteQuiz.mutateAsync({ notebookId, quizId: quiz.id });
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                title={t('tabs.quizzes.delete_title')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
                {quizzesList.length === 0 && !isLoadingQuizzes && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        {t('tabs.quizzes.no_quizzes')}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full">
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
                            className="hidden xl:flex flex-col shrink-0 overflow-hidden rounded-2xl border-t border-r border-border bg-card"
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
                                title={desktopSidebarOpen ? t('tabs.quizzes.close_list') : t('tabs.quizzes.open_list')}
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
                                {selectedQuiz?.title || t('tabs.quizzes.detail_default')}
                            </h3>
                        </div>

                        {selectedQuiz && (
                            <button
                                onClick={() => handleDelete(t('tabs.quizzes.confirm_delete'), async () => {
                                    await deleteQuiz.mutateAsync({ notebookId, quizId: selectedQuiz.id });
                                })}
                                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-2.5 py-1.5 rounded-full font-medium transition-all"
                            >
                                <Trash2 size={12} />
                                <span className="hidden sm:block">{t('tabs.quizzes.delete_btn')}</span>
                            </button>
                        )}
                    </div>

                    {/* Main Content (QuizRunner / Empty State) */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                        {isLoadingSelectedQuiz ? (
                            <div className="flex h-full items-center justify-center py-20 text-sm text-foreground/50">
                                {t('tabs.quizzes.loading')}
                            </div>
                        ) : selectedQuizForRunner.length > 0 ? (
                            <div className="w-full max-w-3xl mx-auto">
                                <QuizRunner quizzes={selectedQuizForRunner} />
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50 text-brand-500">
                                    <HelpCircle size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">{t('tabs.quizzes.empty')}</h4>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {t('tabs.quizzes.empty_hint')}
                                </p>
                                <button
                                    onClick={() => openGenerationModal('quiz')}
                                    disabled={isGenerating}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-all"
                                >
                                    <Sparkles size={16} />
                                    {t('tabs.quizzes.create_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default QuizzesTab;
