import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useGenerateQuiz,
    useGenerateFlashcards,
    useGenerateSummary,
    useGeneratePodcast,
    useGetArtefactSummaries,
    useGetArtefactFlashcards,
    useGetArtefactQuizzes,
    useGetArtefactPodcasts,
} from '../../utils/workspace';
import { BrainIcon, FileQuestionIcon, LayersIcon, LoaderIcon, FileTextIcon, MicIcon } from 'lucide-react';
import { renderMarkdown } from '../../utils/mk';

interface ArtefactGeneratorProps {
    notebookId: string;
}

const ArtefactGenerator: React.FC<ArtefactGeneratorProps> = ({ notebookId }) => {
    const { t } = useTranslation('workspace');
    const generateSummaryMutation = useGenerateSummary();
    const generateQuizMutation = useGenerateQuiz();
    const generateFlashcardsMutation = useGenerateFlashcards();
    const generatePodcastMutation = useGeneratePodcast();
    const [activeArtefact, setActiveArtefact] = useState<any>(null);
    const [artefactType, setArtefactType] = useState<'summary' | 'quiz' | 'flashcards' | 'podcast' | null>(null);

    const { data: summaries } = useGetArtefactSummaries(notebookId, { perPage: 100 });
    const { data: flashcards } = useGetArtefactFlashcards(notebookId, { perPage: 100 });
    const { data: quizzes } = useGetArtefactQuizzes(notebookId, { perPage: 100 });
    const { data: podcasts } = useGetArtefactPodcasts(notebookId, { perPage: 100 });

    const isGenerating =
        generateSummaryMutation.isPending ||
        generateQuizMutation.isPending ||
        generateFlashcardsMutation.isPending ||
        generatePodcastMutation.isPending;

    const handleGenerateSummary = async () => {
        try {
            setActiveArtefact(null);
            setArtefactType('summary');
            const result = await generateSummaryMutation.mutateAsync({ notebookId, title: t('artefact.generated_summary') });
            setActiveArtefact(result);
        } catch (e) {
            console.error(e);
        }
    };

    const handleGenerateQuiz = async () => {
        try {
            setActiveArtefact(null);
            setArtefactType('quiz');
            const result = await generateQuizMutation.mutateAsync({ notebookId, title: t('artefact.generated_quiz'), count: 3 });
            setActiveArtefact(result);
        } catch (e) {
            console.error(e);
        }
    };

    const handleGenerateFlashcards = async () => {
        try {
            setActiveArtefact(null);
            setArtefactType('flashcards');
            const result = await generateFlashcardsMutation.mutateAsync({ notebookId, title: t('artefact.generated_flashcards'), count: 5 });
            setActiveArtefact(result);
        } catch (e) {
            console.error(e);
        }
    };

    const handleGeneratePodcast = async () => {
        try {
            setActiveArtefact(null);
            setArtefactType('podcast');
            const result = await generatePodcastMutation.mutateAsync({ notebookId, title: t('artefact.generated_podcast') });
            setActiveArtefact(result);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BrainIcon className="text-purple-500" />
                {t('artefact.title')}
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
                <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="flex-1 flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {generateSummaryMutation.isPending ? <LoaderIcon className="animate-spin mb-1 text-sky-500" /> : <FileTextIcon className="mb-1 text-sky-500" />}
                    <span className="text-sm font-medium">{t('artefact.tab_summary')}</span>
                </button>
                <button 
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating}
                    className="flex-1 flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {generateQuizMutation.isPending ? <LoaderIcon className="animate-spin mb-1 text-purple-500" /> : <FileQuestionIcon className="mb-1 text-purple-500" />}
                    <span className="text-sm font-medium">{t('artefact.tab_quiz')}</span>
                </button>
                
                <button 
                    onClick={handleGenerateFlashcards}
                    disabled={isGenerating}
                    className="flex-1 flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {generateFlashcardsMutation.isPending ? <LoaderIcon className="animate-spin mb-1 text-orange-500" /> : <LayersIcon className="mb-1 text-orange-500" />}
                    <span className="text-sm font-medium">Flashcards</span>
                </button>
                <button 
                    onClick={handleGeneratePodcast}
                    disabled={isGenerating}
                    className="flex-1 flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {generatePodcastMutation.isPending ? <LoaderIcon className="animate-spin mb-1 text-emerald-500" /> : <MicIcon className="mb-1 text-emerald-500" />}
                    <span className="text-sm font-medium">Podcast</span>
                </button>
            </div>

            {/* Display Artefact Result */}
            {activeArtefact && artefactType === 'summary' && (
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-sky-800 mb-3">{t('artefact.generated_summary')}</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{activeArtefact.content}</div>
                </div>
            )}

            {activeArtefact && artefactType === 'quiz' && (
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">{activeArtefact.title || t('artefact.generated_quiz')}</h4>
                    <div className="space-y-4">
                        {activeArtefact.questions?.map((q: any, i: number) => (
                            <div key={q.id || i} className="bg-white p-3 rounded shadow-sm text-sm">
                                <p className="font-medium mb-2">{i+1}. {q.question_text}</p>
                                <ul className="space-y-1 mb-2">
                                    {q.options?.map((opt: string, j: number) => (
                                        <li key={j} className="text-gray-600 flex gap-2">
                                            <input type="radio" disabled checked={opt === q.correct_answer} className="mt-1" />
                                            <span>{opt}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                                    <span className="font-semibold">{t('artefact.explanation')} </span>{q.explanation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeArtefact && artefactType === 'flashcards' && (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-3">{t('artefact.generated_flashcards')}</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {(activeArtefact.items || []).map((fc: any, i: number) => (
                            <div key={fc.id || i} className="bg-white p-3 rounded shadow-sm text-sm relative overflow-hidden group">
                                <div className="font-medium text-gray-800 pb-2 border-b border-gray-100 mb-2">Q: {fc.front}</div>
                                <div className="text-gray-600 font-medium">R: {fc.back}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeArtefact && artefactType === 'podcast' && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-3">{t('artefact.generated_podcast')}</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{activeArtefact.transcript}</div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('artefact.history_summary')}</p>
                    <div className="space-y-2">
                        {summaries?.items?.map(summary => (
                            <div key={summary.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90">{summary.title || t('artefact.tab_summary')}</p>
                                <p className="mt-1 line-clamp-3 text-xs text-gray-500 dark:text-gray-400">{summary.content}</p>
                            </div>
                        ))}
                        {summaries?.items?.length === 0 && <p className="text-xs text-gray-400">{t('artefact.empty_summary')}</p>}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('artefact.history_flashcards')}</p>
                    <div className="space-y-2">
                        {flashcards?.items?.map(batch => (
                            <div key={batch.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90">{batch.title || t('artefact.tab_flashcards')}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('artefact.cards_count', { count: batch.items.length })}</p>
                            </div>
                        ))}
                        {flashcards?.items?.length === 0 && <p className="text-xs text-gray-400">{t('artefact.empty_flashcards')}</p>}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('artefact.history_quiz')}</p>
                    <div className="space-y-2">
                        {quizzes?.items?.map(quiz => (
                            <div key={quiz.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90">{quiz.title || 'Quiz'}</p>
                                {/*<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{quiz.questions.length} question(s)</p>*/}
                            </div>
                        ))}
                        {quizzes?.items?.length === 0 && <p className="text-xs text-gray-400">{t('artefact.empty_quiz')}</p>}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('artefact.history_podcast')}</p>
                    <div className="space-y-2">
                        {podcasts?.items?.map(podcast => (
                            <div key={podcast.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-white/[0.03]">
                                <p className="font-medium text-gray-800 dark:text-white/90">{podcast.title || 'Podcast'}</p>
                                <p className="mt-1 line-clamp-3 text-xs text-gray-500 dark:text-gray-400">{renderMarkdown(podcast.transcript || '')}</p>
                            </div>
                        ))} 
                        {podcasts?.items?.length === 0 && <p className="text-xs text-gray-400">{t('artefact.empty_podcast')}</p>}
                    </div>
                </div> 
            </div>
        </div>
    );
};

export default ArtefactGenerator;
