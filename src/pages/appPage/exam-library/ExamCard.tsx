import { AlertCircle, BookOpen, CheckCircle2, Eye, Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExamItem, ExamSession, ExamType } from '../../../types/exams';
import { courseCode, courseName } from '../../../types/exams';

export const SESSION_LABELS: Record<ExamSession, string> = {
    fall: 'Automne', winter: 'Hiver', summer: 'Printemps/Été',
};
export const TYPE_LABELS: Record<ExamType, string> = {
    'Mi-session': 'Mi-session', 'Final': 'Final', 'Quiz': 'Quiz',
    'Devoir': 'Devoir', 'Pratique': 'Pratique', 'DGD': 'DGD', 'Autre': 'Autre',
};
export const TYPE_COLORS: Record<ExamType, string> = {
    'Mi-session': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Final':      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Quiz':       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Devoir':     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Pratique':   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'DGD':        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Autre':      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const SESSION_KEYS: Record<ExamSession, 'library.filters.fall' | 'library.filters.winter' | 'library.filters.spring_summer'> = {
    fall: 'library.filters.fall',
    winter: 'library.filters.winter',
    summer: 'library.filters.spring_summer',
};
const TYPE_KEYS: Record<ExamType, 'library.filters.mi_session' | 'library.filters.final' | 'library.filters.quiz' | 'library.filters.devoir' | 'library.filters.pratique' | 'library.filters.dgd' | 'library.filters.autre'> = {
    'Mi-session': 'library.filters.mi_session',
    'Final':      'library.filters.final',
    'Quiz':       'library.filters.quiz',
    'Devoir':     'library.filters.devoir',
    'Pratique':   'library.filters.pratique',
    'DGD':        'library.filters.dgd',
    'Autre':      'library.filters.autre',
};

export default function ExamCard({ exam, isPro, isUltra, tokenBalance, isSolutionUnlocked, isExamUnlocked, onViewExam, onViewSolution }: {
    exam: ExamItem; isPro: boolean; isUltra: boolean; tokenBalance: number; isSolutionUnlocked: boolean; isExamUnlocked: boolean;
    onViewExam: () => void; onViewSolution: () => void;
}) {
    const { t, i18n } = useTranslation('exams');
    const lang = i18n.language ?? 'fr';

    const hasExamFile = !!exam.exam_file_url;
    const hasSolution = !!exam.solution_file_url;

    const examFreeAccess = !exam.is_exam_paid || isPro || isExamUnlocked;
    const solutionFreeAccess = !exam.is_solution_paid || isPro || isSolutionUnlocked;
    const canAccessWithTokens = tokenBalance >= 2;

    const examTitle = !hasExamFile
        ? t('card.exam_missing_tooltip')
        : examFreeAccess
        ? t('card.exam_free')
        : t('card.exam_paid');

    const solutionTitle = !hasSolution
        ? t('card.no_solution')
        : !exam.is_solution_paid
        ? t('card.solution_free')
        : isPro
        ? t('card.solution_pro')
        : isSolutionUnlocked
        ? t('card.solution_bought')
        : canAccessWithTokens
        ? t('card.solution_paid')
        : t('card.solution_insufficient');

    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 lg:shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80">
            <div className="mb-3 flex items-start justify-between gap-2">
                {exam.course ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <BookOpen size={11} />{courseCode(exam.course, lang)}
                    </div>
                ) : <div />}
                {isPro ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Sparkles size={10} />{t('card.pro_badge')}
                    </span>
                ): isUltra ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Sparkles size={10} />{t('card.ultra_badge')}
                    </span>
                ) : isSolutionUnlocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 size={10} />{t('card.already_bought')}
                    </span>
                )}
            </div>

            <h3 className="mb-1 flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">{exam.name}</h3>
            {exam.course && <p className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">{courseName(exam.course, lang)}</p>}

            <div className="mb-4 flex flex-wrap gap-1.5">
                {exam.academic_year && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{exam.academic_year}</span>
                )}
                {exam.session && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t(SESSION_KEYS[exam.session])}</span>
                )}
                {exam.exam_type && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[exam.exam_type]}`}>{t(TYPE_KEYS[exam.exam_type])}</span>
                )}
                {/*{hasExamFile && exam.is_exam_paid && !isPro && !isExamUnlocked && (
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">🪙 1 jeton</span>
                )}
                {hasSolution && exam.is_solution_paid && !isPro && !isSolutionUnlocked && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">🪙 2 jetons</span>
                )}*/}
            </div>

            <div className="mt-auto flex gap-2">
                {hasExamFile ? (
                    <button
                        onClick={onViewExam}
                        title={examTitle}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                            examFreeAccess
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {examFreeAccess ? <Eye size={12} /> : <Lock size={12} />}
                        {t('card.exam_label')}
                    </button>
                ) : (
                    <button
                        disabled
                        title={examTitle}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-600"
                    >
                        <AlertCircle size={12} />
                        {t('card.exam_missing_label')}
                    </button>
                )}
                <button
                    onClick={onViewSolution}
                    disabled={!hasSolution}
                    title={solutionTitle}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                        solutionFreeAccess
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {solutionFreeAccess ? <Eye size={12} /> : <Lock size={12} />}
                    {t('card.solution_label')}
                </button>
            </div>
        </div>
    );
}
