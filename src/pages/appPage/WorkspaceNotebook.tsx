import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/modal/index.tsx';
import {
    ArrowLeftIcon,
    BookOpen,
    FileText,
    GitBranch,
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
    useDeleteArtefactMindmap,
    useDeleteArtefactPodcast,
    useDeleteArtefactQuiz,
    useDeleteArtefactSummary,
    useGenerateFlashcards,
    useGenerateMindmap,
    useGeneratePodcast,
    useGenerateQuiz,
    useGenerateSummary,
    useGetArtefactFlashcards,
    useGetArtefactMindmaps,
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
import MindmapTab from '../../components/workspace/tabs/MindmapTab.tsx';

const WorkspaceNotebook: React.FC = () => {
    const { notebookId } = useParams<{ notebookId: string }>();
    const { t } = useTranslation('workspace');
    const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'summaries' | 'flashcards' | 'quizzes' | 'podcasts' | 'mindmaps' | 'chat'>('overview');
    const [generationModal, setGenerationModal] = useState<'summary' | 'flashcards' | 'quiz' | 'podcast' | 'mindmap' | null>(null);
    const [generationTitle, setGenerationTitle] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [generationFailed, setGenerationFailed] = useState(false);
    const [flashcardCount, setFlashcardCount] = useState(10);
    const [quizCount, setQuizCount] = useState(5);
    const [summaryTarget, setSummaryTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [flashcardTarget, setFlashcardTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [quizTarget, setQuizTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [podcastTarget, setPodcastTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [mindmapTarget, setMindmapTarget] = useState<{ sourceIds: string[]; themeIds: string[] }>({ sourceIds: [], themeIds: [] });
    const [mindmapDepth, setMindmapDepth] = useState(3);
    const [generationLanguage, setGenerationLanguage] = useState('fr');
    const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);

    const { data: notebook, isLoading: isLoadingNotebook } = useGetNotebook(notebookId);
    const { data: sources, isLoading: isLoadingSources } = useGetSources(notebookId ?? "", { perPage: 100 });
    const { data: themes, isLoading: isLoadingThemes } = useGetThemes(notebookId ?? "", { perPage: 100 });
    const { data: summaries, isLoading: isLoadingSummaries } = useGetArtefactSummaries(notebookId ?? "", { perPage: 100 });
    const { data: flashcards, isLoading: isLoadingFlashcards } = useGetArtefactFlashcards(notebookId ?? "", { perPage: 100 });
    const { data: quizzes, isLoading: isLoadingQuizzes } = useGetArtefactQuizzes(notebookId ?? "", { perPage: 100 });
    const { data: podcasts, isLoading: isLoadingPodcasts } = useGetArtefactPodcasts(notebookId ?? "", { perPage: 100 });
    const { data: mindmaps, isLoading: isLoadingMindmaps } = useGetArtefactMindmaps(notebookId ?? "", { perPage: 100 });

    const createSummary = useGenerateSummary();
    const createFlashcards = useGenerateFlashcards();
    const createQuiz = useGenerateQuiz();
    const createPodcast = useGeneratePodcast();
    const deleteSummary = useDeleteArtefactSummary();
    const deleteFlashcard = useDeleteArtefactFlashcard();
    const deleteQuiz = useDeleteArtefactQuiz();
    const deletePodcast = useDeleteArtefactPodcast();
    const createMindmap = useGenerateMindmap();
    const deleteMindmap = useDeleteArtefactMindmap();
    
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
    const AUDIO_COST = 5;

    // Audio (podcast) is free only on Ultra; text artefacts are free on Pro or Ultra
    const canGenerate = generationModal === 'podcast'
        ? (isUltra || tokenBalance >= AUDIO_COST)
        : (isPro || isUltra || tokenBalance >= ARTEFACT_COST);

    console.log(isPro, isUltra, tokenBalance, canGenerate, generationModal);

    const handleGenerationError = (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 402) {
            setUpgradeModalOpen(true);
        } else {
            setGenerationFailed(true);
        }
    };

    if (!notebookId) return <div>{t('notebook.not_found')}</div>;

    const tabs = [
        { id: 'overview', label: t('notebook.tab_overview'), icon: BookOpen },
        { id: 'sources', label: 'Sources', icon: FileText },
        { id: 'summaries', label: t('notebook.tab_summaries'), icon: Sparkles },
        { id: 'flashcards', label: 'Flashcards', icon: Layers },
        { id: 'quizzes', label: t('notebook.tab_quizzes'), icon: HelpCircle },
        { id: 'podcasts', label: 'Podcasts', icon: Mic },
        { id: 'mindmaps', label: 'Cartes', icon: GitBranch },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
    ] as const;

    const isGenerating = createSummary.isPending || createFlashcards.isPending || createQuiz.isPending || createPodcast.isPending || createMindmap.isPending;

    const isCurrentlyGenerating =
        (generationModal === 'summary' && createSummary.isPending) ||
        (generationModal === 'flashcards' && createFlashcards.isPending) ||
        (generationModal === 'quiz' && createQuiz.isPending) ||
        (generationModal === 'podcast' && createPodcast.isPending) ||
        (generationModal === 'mindmap' && createMindmap.isPending);

    const currentModalTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : generationModal === 'mindmap' ? mindmapTarget : podcastTarget;
    const noSourceSelected = currentModalTarget.sourceIds.length === 0;

    const stats = [
        { label: t('notebook.stat_sources_label'), value: sources?.items?.length ?? 0, hint: isLoadingSources ? t('notebook.loading') : t('notebook.stat_sources_hint'), icon: FileText },
        { label: t('notebook.stat_themes_label'), value: themes?.items?.length ?? 0, hint: isLoadingThemes ? t('notebook.loading') : t('notebook.stat_themes_hint'), icon: Target },
        { label: t('notebook.stat_summaries_label'), value: summaries?.items?.length ?? 0, hint: isLoadingSummaries ? t('notebook.loading') : t('notebook.stat_summaries_hint'), icon: Sparkles },
        { label: t('notebook.stat_artefacts_label'), value: (summaries?.items?.length ?? 0) + (flashcards?.items?.length ?? 0) + (quizzes?.items?.length ?? 0) + (podcasts?.items?.length ?? 0), hint: t('notebook.stat_artefacts_hint'), icon: Layers },
    ];

    const formatDate = (date?: string) => {
        if (!date) return t('notebook.just_now');
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
        overview:   t('notebook.mobile_overview'),
        sources:    'Sources',
        summaries:  t('notebook.mobile_summaries'),
        flashcards: t('notebook.mobile_flashcards'),
        quizzes:    t('notebook.tab_quizzes'),
        chat:       'Chat',
    };

    const openGenerationModal = (type: 'summary' | 'flashcards' | 'quiz' | 'podcast' | 'mindmap') => {
        setGenerationModal(type);
        const notebookName = notebook?.name?.trim() || 'Notebook';
        const suffixKey = type === 'summary' ? 'gen_suffix_summary'
            : type === 'flashcards' ? 'gen_suffix_flashcards'
            : type === 'quiz' ? 'gen_suffix_quiz'
            : type === 'podcast' ? 'gen_suffix_podcast'
            : 'gen_suffix_mindmap';
        setGenerationTitle(`${notebookName} - ${t(`notebook.${suffixKey}`)}`);
    };

    return (
        <>
            <PageMeta title={notebook?.name || 'Notebook'} description={t('notebook.page_desc')} />
            <PageBreadcrumb
                pageTitle={isLoadingNotebook ? t('notebook.loading') : notebook?.name || 'Notebook'}
                titleAction={
                    <Link
                        to="/workspaces"
                        className="inline-flex items-center gap-1 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label={t('notebook.back_label')}
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
                                        {t('notebook.add_sources_title')}
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {t('notebook.add_sources_desc')}
                                    </p>
                                </div>
                                <SourcesTab notebookId={notebookId} />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tab bar   desktop only */}
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
                                                {t('notebook.token', { count: tokenBalance })}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setUpgradeModalOpen(true)}
                                                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                                            >
                                                <Zap size={10} />
                                                {t('notebook.recharge')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div ref={contentRef} className="lg:mt-6 mt-2 flex-1 overflow-hidden">
                                <div className={`rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/80 ${
                                    ['chat', 'summaries', 'flashcards', 'podcasts', 'mindmaps'].includes(activeTab)
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
                                            pendingSelectId={pendingSelectId}
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
                                            pendingSelectId={pendingSelectId}
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
                                            pendingSelectId={pendingSelectId}
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
                                            pendingSelectId={pendingSelectId}
                                        />
                                    )}

                                    {activeTab === 'mindmaps' && (
                                        <MindmapTab
                                            mindmaps={mindmaps}
                                            isLoadingMindmaps={isLoadingMindmaps}
                                            isGenerating={isGenerating}
                                            openGenerationModal={openGenerationModal}
                                            handleDelete={handleDelete}
                                            deleteMindmap={deleteMindmap}
                                            notebookId={notebookId}
                                            formatDate={formatDate}
                                            pendingSelectId={pendingSelectId}
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

            {/* Mobile bottom navigation   hidden during source gate */}
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
                onClose={() => { if (!isCurrentlyGenerating) { setGenerationModal(null); setGenerationTitle(''); setCustomInstructions(''); setGenerationFailed(false); } }}
                className="max-w-3xl p-4 sm:p-6 max-h-[92dvh] overflow-y-auto"
            >
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {generationModal === 'summary' && t('notebook.modal_prepare_summary')}
                        {generationModal === 'flashcards' && t('notebook.modal_prepare_flashcards')}
                        {generationModal === 'quiz' && t('notebook.modal_prepare_quiz')}
                        {generationModal === 'podcast' && t('notebook.modal_prepare_podcast')}
                        {generationModal === 'mindmap' && t('notebook.modal_prepare_mindmap')}
                    </h3>
                    {!isCurrentlyGenerating && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('notebook.modal_choose_hint')}
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
                                {generationModal === 'summary' && t('notebook.modal_gen_summary')}
                                {generationModal === 'flashcards' && t('notebook.modal_gen_flashcards')}
                                {generationModal === 'quiz' && t('notebook.modal_gen_quiz')}
                                {generationModal === 'podcast' && t('notebook.modal_gen_podcast')}
                                {generationModal === 'mindmap' && t('notebook.modal_gen_mindmap')}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {t('notebook.modal_gen_wait')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_title_label')}</label>
                                <input
                                    type="text"
                                    //value={generationTitle}
                                    onChange={(e) => setGenerationTitle(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_language_label')}</label>
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
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_cards_label')}</label>
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
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_questions_label')}</label>
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
                            {generationModal === 'mindmap' && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {t('notebook.gen_depth_label')} — {mindmapDepth}
                                    </label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={5}
                                        value={mindmapDepth}
                                        onChange={(e) => setMindmapDepth(Number(e.target.value))}
                                        className="w-full accent-blue-600"
                                    />
                                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {t('notebook.gen_custom_label')}
                                </label>
                                <span className={`text-xs ${customInstructions.length > 950 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {customInstructions.length}/1000
                                </span>
                            </div>
                            <textarea
                                value={customInstructions}
                                onChange={(e) => { setCustomInstructions(e.target.value.slice(0, 1000)); setGenerationFailed(false); }}
                                placeholder={t('notebook.gen_custom_placeholder')}
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition resize-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            />
                            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                {t('notebook.gen_custom_hint')}
                            </p>
                        </div>

                        {(() => {
                            const currentTarget = generationModal === 'summary' ? summaryTarget : generationModal === 'flashcards' ? flashcardTarget : generationModal === 'quiz' ? quizTarget : generationModal === 'mindmap' ? mindmapTarget : podcastTarget;
                            const currentSetTarget = generationModal === 'summary' ? setSummaryTarget : generationModal === 'flashcards' ? setFlashcardTarget : generationModal === 'quiz' ? setQuizTarget : generationModal === 'mindmap' ? setMindmapTarget : setPodcastTarget;
                            const selectedSourceIds = currentTarget.sourceIds;
                            const noSourceSelected = selectedSourceIds.length === 0;
                            const visibleThemes = (themes?.items ?? []).filter(theme =>
                                selectedSourceIds.length === 0 ||
                                !theme.source_ids?.length ||
                                theme.source_ids.some(sid => selectedSourceIds.includes(sid))
                            );
                            return (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_sources_label')}</p>
                                        <div className="max-h-36 sm:max-h-52 lg:max-h-64 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                            {sources?.items?.map(source => (
                                                <label key={source.id} className="flex w-full min-w-0 overflow-hidden cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentTarget.sourceIds.includes(source.id)}
                                                        onChange={() => currentSetTarget(prev => ({ ...prev, sourceIds: prev.sourceIds.includes(source.id) ? prev.sourceIds.filter(id => id !== source.id) : [...prev.sourceIds, source.id] }))}
                                                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="min-w-0 truncate">{source.filename}</span>
                                                </label>
                                            ))}
                                            {sources?.items?.length === 0 && <p className="text-xs text-gray-400">{t('notebook.no_source')}</p>}
                                        </div>
                                        {noSourceSelected && (sources?.items?.length ?? 0) > 0 && (
                                            <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                {t('notebook.source_required')}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('notebook.gen_themes_label')}</p>
                                        <div className="max-h-36 sm:max-h-52 lg:max-h-64 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                                            {visibleThemes.map(theme => (
                                                <label key={theme.id} className="flex w-full min-w-0 overflow-hidden cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentTarget.themeIds.includes(theme.id)}
                                                        onChange={() => currentSetTarget(prev => ({ ...prev, themeIds: prev.themeIds.includes(theme.id) ? prev.themeIds.filter(id => id !== theme.id) : [...prev.themeIds, theme.id] }))}
                                                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="min-w-0 truncate">{theme.name}</span>
                                                </label>
                                            ))}
                                            {visibleThemes.length === 0 && <p className="text-xs text-gray-400">{t('notebook.no_theme')}</p>}
                                        </div> 
                                    </div>
                                </div>
                            );
                        })()}

                        {generationFailed && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
                                <p className="text-sm font-semibold text-red-700 dark:text-red-300">{t('notebook.modal_gen_failed')}</p>
                                {(generationModal === 'flashcards' || generationModal === 'quiz') && (
                                    <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">{t('notebook.modal_gen_failed_tokens')}</p>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setGenerationModal(null);
                                    setGenerationTitle('');
                                    setCustomInstructions('');
                                    setGenerationFailed(false);
                                }}
                                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/5"
                            >
                                {t('list.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!canGenerate) {
                                        setUpgradeModalOpen(true);
                                        return;
                                    }
                                    if (!generationTitle.trim()) return;
                                    if (noSourceSelected && (sources?.items?.length ?? 0) > 0) return;
                                    setGenerationFailed(false);
                                    const ci = customInstructions.trim() || undefined;
                                    const tabForModal = { summary: 'summaries', flashcards: 'flashcards', quiz: 'quizzes', podcast: 'podcasts', mindmap: 'mindmaps' } as const;
                                    const closeOnSuccess = (artifact: { id: string }) => {
                                        const modal = generationModal;
                                        setGenerationModal(null);
                                        setGenerationTitle('');
                                        setCustomInstructions('');
                                        setGenerationFailed(false);
                                        if (modal) {
                                            setActiveTab(tabForModal[modal]);
                                            setPendingSelectId(artifact.id);
                                        }
                                    };
                                    if (generationModal === 'summary') {
                                        createSummary.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, sourceIds: summaryTarget.sourceIds, themeIds: summaryTarget.themeIds, customInstructions: ci }, { onSuccess: closeOnSuccess, onError: handleGenerationError });
                                    }
                                    if (generationModal === 'flashcards') {
                                        createFlashcards.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, count: flashcardCount, sourceIds: flashcardTarget.sourceIds, themeIds: flashcardTarget.themeIds, customInstructions: ci }, { onSuccess: closeOnSuccess, onError: handleGenerationError });
                                    }
                                    if (generationModal === 'quiz') {
                                        createQuiz.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, count: quizCount, sourceIds: quizTarget.sourceIds, themeIds: quizTarget.themeIds, customInstructions: ci }, { onSuccess: closeOnSuccess, onError: handleGenerationError });
                                    }
                                    if (generationModal === 'podcast') {
                                        createPodcast.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, sourceIds: podcastTarget.sourceIds, themeIds: podcastTarget.themeIds, customInstructions: ci }, { onSuccess: closeOnSuccess, onError: handleGenerationError });
                                    }
                                    if (generationModal === 'mindmap') {
                                        createMindmap.mutate({ notebookId, title: generationTitle.trim(), language: generationLanguage, maxDepth: mindmapDepth, sourceIds: mindmapTarget.sourceIds, themeIds: mindmapTarget.themeIds, customInstructions: ci }, { onSuccess: closeOnSuccess, onError: handleGenerationError });
                                    }
                                }}
                                disabled={(!generationTitle.trim() || (noSourceSelected && (sources?.items?.length ?? 0) > 0)) && canGenerate}
                                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                                    canGenerate
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                                {canGenerate ? (
                                    <>
                                        {t('notebook.modal_generate')}
                                        {generationModal === 'podcast' ? (
                                            !isUltra && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                                                    <Zap size={9} />
                                                    {AUDIO_COST}
                                                </span>
                                            )
                                        ) : (
                                            (!isPro && !isUltra) && (
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
                                        {t('notebook.no_tokens')}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmOpen}
                title={t('notebook.confirm_delete_title')}
                message={confirmMessage}
                confirmLabel={t('notebook.confirm_delete_btn')}
                cancelLabel={t('list.cancel')}
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
