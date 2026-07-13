import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Modal } from '../../components/ui/modal/index.tsx';
import {
    ArrowLeftIcon,
    BookOpen,
    FileText,
    HelpCircle,
    Layers,
    MessageSquare,
    Mic,
    Sparkles,
    Target,
    Upload,
    Zap,
} from 'lucide-react';
import { useBilling } from '../../context/BillingContext';
import UpgradeModal from '../../components/ui/UpgradeModal';
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
import { useQueryClient } from '@tanstack/react-query';
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
    const [generationLanguage, setGenerationLanguage] = useState('fr');

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
    
    const { isPro, isUltra, tokenBalance } = useBilling();
    const queryClient = useQueryClient();
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    const sourceCount = sources?.items?.length ?? 0;
    const hasNoSources = !isLoadingSources && sourceCount === 0;

    // Poll every 2 s while any podcast is still processing
    const hasProcessingPodcast = podcasts?.items?.some(
        p => p.status === 'processing' || p.status === 'pending'
    );
    useEffect(() => {
        if (!hasProcessingPodcast || !notebookId) return;
        const id = setInterval(() => {
            void queryClient.invalidateQueries({ queryKey: ['artefact-podcasts', notebookId] });
        }, 2000);
        return () => clearInterval(id);
    }, [hasProcessingPodcast, notebookId, queryClient]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    const ARTEFACT_COST = 1;
    const AUDIO_COST = 2;

    // Audio (podcast) is free only on Ultra; text artefacts are free on Pro or Ultra
    const canGenerate = generationModal === 'podcast'
        ? (isUltra || tokenBalance >= AUDIO_COST)
        : (isPro || tokenBalance >= ARTEFACT_COST);

    const handle402 = (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 402) setUpgradeModalOpen(true);
    };

    if (!notebookId) return <div>Notebook non trouvé</div>;

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BookOpen },
        { id: 'sources', label: 'Sources', icon: FileText },
        { id: 'summaries', label: 'Résumés', value: summaries?.items?.length ?? 0, hint: isLoadingSummaries ? 'Chargement...' : 'Résumés générés', icon: Sparkles },
        { id: 'flashcards', label: 'Flashcards', icon: Layers },
        { id: 'quizzes', label: 'Quiz', icon: HelpCircle },
        { id: 'podcasts', label: 'Podcasts', icon: Mic },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
    ] as const;

    const isGenerating = createSummary.isPending || createFlashcards.isPending || createQuiz.isPending || createPodcast.isPending;

    const isCurrentlyGenerating =
        (generationModal === 'summary' && createSummary.isPending) ||
        (generationModal === 'flashcards' && createFlashcards.isPending) ||
        (generationModal === 'quiz' && createQuiz.isPending) ||
        (generationModal === 'podcast' && createPodcast.isPending);

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

    const MOBILE_TAB_LABEL: Record<string, string> = {
        overview:   'Aperçu',
        sources:    'Sources',
        summaries:  'Résumés',
        flashcards: 'Cartes',
        quizzes:    'Quiz',
        chat:       'Chat',
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
                <div className="mx-auto gap-2 flex min-h-dvh max-w-(--breakpoint-2xl) flex-col px-2 pb-6 lg:pt-4 sm:px-6 pb-20 md:pb-6">

                    {hasNoSources ? (
                        /* ── Source gate: no sources yet ── */
                        <div className="flex flex-col items-center justify-center px-4">
                            <div className="w-full max-w-xl py-20">
                                <div className="mb-8 text-center">
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                                        <Upload size={28} className="text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Ajoutez vos premières sources
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Importez vos documents (PDF, DOCX, PPTX…) pour commencer à générer des résumés, flashcards et quiz.
                                    </p>
                                </div>
                                <SourcesTab notebookId={notebookId} />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tab bar — desktop only */}
                            <div className="hidden md:block sticky top-[72px] z-30 -mx-4 mb-6 border-b border-gray-200 bg-white/85 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/85 sm:-mx-6 sm:px-6">
                                <div className="flex items-center">
                                    <nav className="flex flex-1 gap-6 overflow-x-auto no-scrollbar">
                                        {tabs.map((tab) => {
                                            const IconComponent = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    className={`flex items-center gap-1.5 border-b-2 px-1 pb-3 pt-4 text-sm font-medium whitespace-nowrap transition-colors ${
                                                        activeTab === tab.id
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
                                    {/* Token / subscription badge */}
                                    <div className="ml-3 shrink-0 pb-2 pt-3">
                                        {isPro ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                                                <Sparkles size={10} />
                                                Pro
                                            </span>
                                        ) : isUltra ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                                                <Sparkles size={10} />
                                                Ultra
                                            </span>
                                        ) : tokenBalance > 0 ? (
                                            <button
                                                onClick={() => setUpgradeModalOpen(true)}
                                                className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400"
                                            >
                                                <Zap size={10} />
                                                {tokenBalance} jeton{tokenBalance > 1 ? 's' : ''}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setUpgradeModalOpen(true)}
                                                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                                            >
                                                <Zap size={10} />
                                                Recharger
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div ref={contentRef} className="lg:mt-6 mt-2 flex-1 overflow-hidden">
                                <div className={`rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${
                                    ['chat', 'summaries', 'flashcards', 'podcasts'].includes(activeTab)
                                        ? 'h-[calc(100dvh-56px)] sm:h-[600px] md:h-[calc(100vh-340px)] lg:h-[calc(100vh-300px)] overflow-hidden'
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
                        </>
                    )}
                </div>
            </div>

            {/* Mobile bottom navigation — hidden during source gate */}
            {!hasNoSources && (
                <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 md:hidden safe-pb">
                    <div className="flex items-stretch">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                                        isActive
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    )}
                                    <IconComponent size={20} />
                                    <span className="text-[10px] font-medium leading-none">
                                        {MOBILE_TAB_LABEL[tab.id] ?? tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}

            <Modal
                isOpen={generationModal !== null}
                onClose={() => { if (!isCurrentlyGenerating) { setGenerationModal(null); setGenerationTitle(''); } }}
                className="max-w-3xl p-4 sm:p-6 max-h-[92dvh] overflow-y-auto"
            >
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generationModal === 'summary' && 'Préparer le résumé'}
                        {generationModal === 'flashcards' && 'Préparer les flashcards'}
                        {generationModal === 'quiz' && 'Préparer le quiz'}
                        {generationModal === 'podcast' && 'Préparer le podcast'}
                    </h3>
                    {!isCurrentlyGenerating && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Choisis les sources et les thèmes, puis lance la génération finale.
                        </p>
                    )}
                </div>

                {isCurrentlyGenerating ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-5">
                        <div className="relative flex items-center justify-center">
                            <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-900" />
                            <div className="absolute h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {generationModal === 'summary' && 'Génération du résumé en cours…'}
                                {generationModal === 'flashcards' && 'Génération des flashcards en cours…'}
                                {generationModal === 'quiz' && 'Génération du quiz en cours…'}
                                {generationModal === 'podcast' && 'Génération du podcast en cours…'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Cela peut prendre quelques instants. Ne fermez pas cette fenêtre.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Titre</label>
                                <input
                                    type="text"
                                    //value={generationTitle}
                                    onChange={(e) => setGenerationTitle(e.target.value)}
                                    placeholder="Ex: Notebook - Résumé"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Langue</label>
                                <select
                                    value={generationLanguage}
                                    onChange={(e) => setGenerationLanguage(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="de">Deutsch</option>
                                    <option value="pt">Português</option>
                                    <option value="it">Italiano</option>
                                    <option value="ar">العربية</option>
                                </select>
                            </div>
                            {generationModal === 'flashcards' && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Nombre de cartes</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={flashcardCount}
                                        onChange={(e) => setFlashcardCount(Math.max(1, Math.min(50, Number(e.target.value) || 10)))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                            {generationModal === 'quiz' && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Nombre de questions</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={quizCount}
                                        onChange={(e) => setQuizCount(Math.max(1, Math.min(20, Number(e.target.value) || 5)))}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                                <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Sources à inclure</p>
                                <div className="max-h-36 sm:max-h-52 lg:max-h-64 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                    {sources?.items?.map(source => {
                                        const currentTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : podcastTarget;
                                        const currentSetTarget = generationModal === 'summary' ? setSummaryTarget : generationModal === 'flashcards' ? setFlashcardTarget : generationModal === 'quiz' ? setQuizTarget : setPodcastTarget;
                                        return (
                                            <label key={source.id} className="flex w-full min-w-0 overflow-hidden cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={currentTarget.sourceIds.includes(source.id)}
                                                    onChange={() => currentSetTarget(prev => ({ ...prev, sourceIds: prev.sourceIds.includes(source.id) ? prev.sourceIds.filter(id => id !== source.id) : [...prev.sourceIds, source.id] }))}
                                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="min-w-0 truncate">{source.filename}</span>
                                            </label>
                                        );
                                    })}
                                    {sources?.items?.length === 0 && <p className="text-xs text-gray-400">Aucune source disponible.</p>}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Thèmes à inclure</p>
                                <div className="max-h-36 sm:max-h-52 lg:max-h-64 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                    {themes?.items?.map(theme => {
                                        const currentTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : podcastTarget;
                                        const currentSetTarget = generationModal === 'summary' ? setSummaryTarget : generationModal === 'flashcards' ? setFlashcardTarget : generationModal === 'quiz' ? setQuizTarget : setPodcastTarget;
                                        return (
                                            <label key={theme.id} className="flex w-full min-w-0 overflow-hidden cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={currentTarget.themeIds.includes(theme.id)}
                                                    onChange={() => currentSetTarget(prev => ({ ...prev, themeIds: prev.themeIds.includes(theme.id) ? prev.themeIds.filter(id => id !== theme.id) : [...prev.themeIds, theme.id] }))}
                                                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="min-w-0 truncate">{theme.name}</span>
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
                                    if (!canGenerate) {
                                        setUpgradeModalOpen(true);
                                        return;
                                    }
                                    if (!generationTitle.trim()) return;
                                    const closeOnSuccess = () => {
                                        setGenerationModal(null);
                                        setGenerationTitle('');
                                    };
                                    if (generationModal === 'summary') {
                                        createSummary.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, sourceIds: summaryTarget.sourceIds, themeIds: summaryTarget.themeIds }, { onSuccess: closeOnSuccess, onError: handle402 });
                                    }
                                    if (generationModal === 'flashcards') {
                                        createFlashcards.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, count: flashcardCount, sourceIds: flashcardTarget.sourceIds, themeIds: flashcardTarget.themeIds }, { onSuccess: closeOnSuccess, onError: handle402 });
                                    }
                                    if (generationModal === 'quiz') {
                                        createQuiz.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, count: quizCount, sourceIds: quizTarget.sourceIds, themeIds: quizTarget.themeIds }, { onSuccess: closeOnSuccess, onError: handle402 });
                                    }
                                    if (generationModal === 'podcast') {
                                        createPodcast.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, sourceIds: podcastTarget.sourceIds, themeIds: podcastTarget.themeIds }, { onSuccess: closeOnSuccess, onError: handle402 });
                                    }
                                }}
                                disabled={!generationTitle.trim() && canGenerate}
                                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                                    canGenerate
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                                {canGenerate ? (
                                    <>
                                        Lancer la génération
                                        {generationModal === 'podcast' ? (
                                            !isUltra && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                                                    <Zap size={9} />
                                                    {AUDIO_COST}
                                                </span>
                                            )
                                        ) : (
                                            !isPro && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                                                    <Zap size={9} />
                                                    {ARTEFACT_COST}
                                                </span>
                                            )
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Zap size={13} />
                                        Aucun jeton
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
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

            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
            />
        </>
    );
};

export default WorkspaceNotebook;
