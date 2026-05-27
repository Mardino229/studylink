import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Modal } from '../../components/ui/modal/index.tsx';
import {
    ArrowLeftIcon,
    BookOpen,
    FileText,
    HelpCircle,
    Layers,
    MessageSquare,
    Sparkles,
    Target,
} from 'lucide-react';
import {
    useDeleteArtefactFlashcard,
    useDeleteArtefactPodcast,
    useDeleteArtefactQuiz,
    useDeleteArtefactSummary,
    useGenerateFlashcards,
    useGeneratePodcast,
    useGenerateQuiz,
    useGenerateSummary,
    useGetArtefactFlashcards,
    useGetArtefactPodcasts,
    useGetArtefactQuizzes,
    useGetArtefactSummaries,
    useGetNotebook,
    useGetSources,
    useGetThemes,
} from '../../utils/workspace';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ConfirmModal from '../../components/ui/ConfirmModal';

// Modularized Tab Components
import OverviewTab from '../../components/workspace/tabs/OverviewTab';
import SourcesTab from '../../components/workspace/tabs/SourcesTab';
import FlashcardsTab from '../../components/workspace/tabs/FlashcardsTab';
import QuizzesTab from '../../components/workspace/tabs/QuizzesTab';
import PodcastsTab from '../../components/workspace/tabs/PodcastsTab';
import ChatTab from '../../components/workspace/tabs/ChatTab';
import SummariesTab from '../../components/workspace/tabs/SummariesTab.tsx';

const WorkspaceNotebook: React.FC = () => {
    const { notebookId } = useParams<{ notebookId: string }>();
    const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'summaries' | 'flashcards' | 'quizzes' | 'podcasts' | 'chat'>('overview');
    const [generationModal, setGenerationModal] = useState<'summary' | 'flashcards' | 'quiz' | 'podcast' | null>(null);
    const [generationTitle, setGenerationTitle] = useState('');
    const [flashcardCount, setFlashcardCount] = useState(10);
    const [quizCount, setQuizCount] = useState(5);
    const [summaryTarget, setSummaryTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [flashcardTarget, setFlashcardTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [quizTarget, setQuizTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [podcastTarget, setPodcastTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });

    const { data: notebook, isLoading: isLoadingNotebook } = useGetNotebook(notebookId);
    const { data: sources, isLoading: isLoadingSources } = useGetSources(notebookId ?? "", { perPage: 100 });
    const { data: themes, isLoading: isLoadingThemes } = useGetThemes(notebookId ?? "", { perPage: 100 });
    const { data: summaries, isLoading: isLoadingSummaries } = useGetArtefactSummaries(notebookId ?? "", { perPage: 100 });
    const { data: flashcards, isLoading: isLoadingFlashcards } = useGetArtefactFlashcards(notebookId ?? "", { perPage: 100 });
    const { data: quizzes, isLoading: isLoadingQuizzes } = useGetArtefactQuizzes(notebookId ?? "", { perPage: 100 });
    const { data: podcasts, isLoading: isLoadingPodcasts } = useGetArtefactPodcasts(notebookId ?? "", { perPage: 100 });

    const createSummary = useGenerateSummary();
    const createFlashcards = useGenerateFlashcards();
    const createQuiz = useGenerateQuiz();
    const createPodcast = useGeneratePodcast();
    const deleteSummary = useDeleteArtefactSummary();
    const deleteFlashcard = useDeleteArtefactFlashcard();
    const deleteQuiz = useDeleteArtefactQuiz();
    const deletePodcast = useDeleteArtefactPodcast();
    
    if (!notebookId) return <div>Notebook non trouvé</div>;

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BookOpen },
        { id: 'sources', label: 'Sources', icon: FileText },
        { id: 'summaries', label: 'Résumés', value: summaries?.items?.length ?? 0, hint: isLoadingSummaries ? 'Chargement...' : 'Résumés générés', icon: Sparkles },
        { id: 'flashcards', label: 'Flashcards', icon: Layers },
        { id: 'quizzes', label: 'Quiz', icon: HelpCircle },
        //{ id: 'podcasts', label: 'Podcasts', icon: Mic },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
    ] as const;

    const isGenerating = createSummary.isPending || createFlashcards.isPending || createQuiz.isPending || createPodcast.isPending;

    const stats = [
        { label: 'Sources', value: sources?.items?.length ?? 0, hint: isLoadingSources ? 'Chargement...' : 'Documents importés', icon: FileText },
        { label: 'Thèmes', value: themes?.items?.length ?? 0, hint: isLoadingThemes ? 'Chargement...' : 'Concepts détectés', icon: Target },
        { label: 'Résumé', value: summaries?.items?.length ?? 0, hint: isLoadingSummaries ? 'Chargement...' : 'Résumés générés', icon: Sparkles },
        { label: 'Artefacts', value: (summaries?.items?.length ?? 0) + (flashcards?.items?.length ?? 0) + (quizzes?.items?.length ?? 0) + (podcasts?.items?.length ?? 0), hint: 'Contenus au total', icon: Layers },
    ];

    const formatDate = (date?: string) => {
        if (!date) return 'Just now';
        return new Date(date).toLocaleString();
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => Promise<unknown>) | null>(null);

    const handleDelete = (message: string, onDelete: () => Promise<unknown>) => {
        setConfirmMessage(message);
        setConfirmAction(() => onDelete);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setConfirmOpen(false);
        if (!confirmAction) return;
        try {
            await confirmAction();
        } catch {
            // The mutation already reports the error via toast.
        } finally {
            setConfirmAction(null);
            setConfirmMessage('');
        }
    };

    const openGenerationModal = (type: 'summary' | 'flashcards' | 'quiz' | 'podcast') => {
        setGenerationModal(type);
        const notebookName = notebook?.name?.trim() || 'Notebook';
        if (type === 'summary') {
            setGenerationTitle(`${notebookName} - Résumé`);
        } else if (type === 'flashcards') {
            setGenerationTitle(`${notebookName} - Flashcards`);
        } else if (type === 'quiz') {
            setGenerationTitle(`${notebookName} - Quiz`);
        } else {
            setGenerationTitle(`${notebookName} - Podcast`);
        }
    };

    return (
        <>
            <PageMeta title={notebook?.name || 'Notebook'} description="Espace de travail" />
            <PageBreadcrumb
                pageTitle={isLoadingNotebook ? 'Chargement...' : notebook?.name || 'Notebook'}
                titleAction={
                    <Link
                        to="/workspaces"
                        className="inline-flex items-center gap-1 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Retour aux workspaces"
                    >
                        <ArrowLeftIcon size={20} />
                    </Link>
                }
            />
            <div className="relative dark:bg-background min-h-dvh rounded-none">
                <div className="mx-auto gap-2 flex min-h-dvh max-w-(--breakpoint-2xl) flex-col px-2 pb-6 pt-4 sm:px-6">
                    
                    <div className="sticky top-[72px] z-30 -mx-4 mb-6 border-b border-gray-200 bg-white/85 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85 sm:-mx-6 sm:px-6">
                        <nav className="flex gap-6 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        className={`flex items-center gap-2 border-b-2 px-1 pb-3 pt-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                            }`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-6 flex-1 overflow-hidden">
                        <div className={`rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${
                            ['chat', 'summaries', 'flashcards', 'podcasts'].includes(activeTab)
                                ? 'h-dvh sm:h-[600px] md:h-[calc(100vh-340px)] lg:h-[calc(100vh-300px)] overflow-hidden'
                                : ''
                        }`}>
                            {activeTab === 'overview' && (
                                <OverviewTab stats={stats} themes={themes} isLoadingThemes={isLoadingThemes} />
                            )}

                            {activeTab === 'sources' && (
                                <SourcesTab notebookId={notebookId} />
                            )}

                            {activeTab === 'summaries' && (
                                <SummariesTab
                                    summaries={summaries}
                                    isLoadingSummaries={isLoadingSummaries}
                                    isGenerating={isGenerating}
                                    openGenerationModal={openGenerationModal}
                                    handleDelete={handleDelete}
                                    deleteSummary={deleteSummary}
                                    notebookId={notebookId}
                                    formatDate={formatDate}
                                />
                            )}

                            {activeTab === 'flashcards' && (
                                <FlashcardsTab
                                    flashcards={flashcards}
                                    isLoadingFlashcards={isLoadingFlashcards}
                                    isGenerating={isGenerating}
                                    flashcardCount={flashcardCount}
                                    setFlashcardCount={setFlashcardCount}
                                    openGenerationModal={openGenerationModal}
                                    handleDelete={handleDelete}
                                    deleteFlashcard={deleteFlashcard}
                                    notebookId={notebookId}
                                    formatDate={formatDate}
                                />
                            )}

                            {activeTab === 'quizzes' && (
                                <QuizzesTab
                                    quizzes={quizzes}
                                    isLoadingQuizzes={isLoadingQuizzes}
                                    isGenerating={isGenerating}
                                    quizCount={quizCount}
                                    setQuizCount={setQuizCount}
                                    openGenerationModal={openGenerationModal}
                                    handleDelete={handleDelete}
                                    deleteQuiz={deleteQuiz}
                                    notebookId={notebookId}
                                    formatDate={formatDate}
                                />
                            )}

                            {activeTab === 'podcasts' && (
                                <PodcastsTab
                                    podcasts={podcasts}
                                    isLoadingPodcasts={isLoadingPodcasts}
                                    isGenerating={isGenerating}
                                    openGenerationModal={openGenerationModal}
                                    handleDelete={handleDelete}
                                    deletePodcast={deletePodcast}
                                    notebookId={notebookId}
                                    formatDate={formatDate}
                                />
                            )}

                            {activeTab === 'chat' && (
                                <ChatTab notebookId={notebookId} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={generationModal !== null}
                onClose={() => setGenerationModal(null)}
                className="max-w-3xl p-6"
            >
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generationModal === 'summary' && 'Préparer le résumé'}
                        {generationModal === 'flashcards' && 'Préparer les flashcards'}
                        {generationModal === 'quiz' && 'Préparer le quiz'}
                        {generationModal === 'podcast' && 'Préparer le podcast'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choisis les sources et les thèmes, puis lance la génération finale.
                    </p>
                </div>

                <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Titre</label>
                    <input
                        type="text"
                        value={generationTitle}
                        onChange={(e) => setGenerationTitle(e.target.value)}
                        placeholder="Ex: Notebook - Résumé"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Sources à inclure</p>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {sources?.items?.map(source => {
                                const currentTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : podcastTarget;
                                const currentSetTarget = generationModal === 'summary' ? setSummaryTarget : generationModal === 'flashcards' ? setFlashcardTarget : generationModal === 'quiz' ? setQuizTarget : setPodcastTarget;
                                return (
                                    <label key={source.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={currentTarget.sourceIds.includes(source.id)}
                                            onChange={() => currentSetTarget(prev => ({ ...prev, sourceIds: prev.sourceIds.includes(source.id) ? prev.sourceIds.filter(id => id !== source.id) : [...prev.sourceIds, source.id] }))}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="truncate">{source.filename}</span>
                                    </label>
                                );
                            })}
                            {sources?.items?.length === 0 && <p className="text-xs text-gray-400">Aucune source disponible.</p>}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Thèmes à inclure</p>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {themes?.items?.map(theme => {
                                const currentTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : podcastTarget;
                                const currentSetTarget = generationModal === 'summary' ? setSummaryTarget : generationModal === 'flashcards' ? setFlashcardTarget : generationModal === 'quiz' ? setQuizTarget : setPodcastTarget;
                                return (
                                    <label key={theme.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={currentTarget.themeIds.includes(theme.id)}
                                            onChange={() => currentSetTarget(prev => ({ ...prev, themeIds: prev.themeIds.includes(theme.id) ? prev.themeIds.filter(id => id !== theme.id) : [...prev.themeIds, theme.id] }))}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="truncate">{theme.name}</span>
                                    </label>
                                );
                            })}
                            {themes?.items?.length === 0 && <p className="text-xs text-gray-400">Aucun thème disponible.</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setGenerationModal(null);
                            setGenerationTitle('');
                        }}
                        className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/5"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!generationTitle.trim()) {
                                return;
                            }
                            if (generationModal === 'summary') {
                                createSummary.mutate({ notebookId, title: generationTitle.trim(), sourceIds: summaryTarget.sourceIds, themeIds: summaryTarget.themeIds });
                            }
                            if (generationModal === 'flashcards') {
                                createFlashcards.mutate({ notebookId, title: generationTitle.trim(), count: flashcardCount, sourceIds: flashcardTarget.sourceIds, themeIds: flashcardTarget.themeIds });
                            }
                            if (generationModal === 'quiz') {
                                createQuiz.mutate({ notebookId, title: generationTitle.trim(), count: quizCount, sourceIds: quizTarget.sourceIds, themeIds: quizTarget.themeIds });
                            }
                            if (generationModal === 'podcast') {
                                createPodcast.mutate({ notebookId, title: generationTitle.trim(), sourceIds: podcastTarget.sourceIds, themeIds: podcastTarget.themeIds });
                            }
                            setGenerationModal(null);
                            setGenerationTitle('');
                        }}
                        disabled={!generationTitle.trim()}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Lancer la génération
                    </button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={confirmOpen}
                title="Confirmer la suppression"
                message={confirmMessage}
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
};

export default WorkspaceNotebook;
