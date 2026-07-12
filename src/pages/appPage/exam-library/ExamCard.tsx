import { BookOpen, CheckCircle2, Eye, Lock, Sparkles } from 'lucide-react';
import type { ExamItem, ExamSession, ExamType } from '../../../types/exams';

export const SESSION_LABELS: Record<ExamSession, string> = {
    fall: 'Automne', winter: 'Hiver', summer: 'Printemps/Été',
};
export const TYPE_LABELS: Record<ExamType, string> = {
    midterm: 'Intra', final: 'Final', quiz: 'Quiz', other: 'Autre',
};
export const TYPE_COLORS: Record<ExamType, string> = {
    midterm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    final:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    quiz:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    other:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function ExamCard({ exam, isPro, tokenBalance, isUnlocked, onViewExam, onViewSolution }: {
    exam: ExamItem; isPro: boolean; tokenBalance: number; isUnlocked: boolean;
    onViewExam: () => void; onViewSolution: () => void;
}) {
    const examFreeAccess = !exam.is_exam_paid || isPro;
    const hasSolution = !!exam.solution_file_url;
    const solutionFreeAccess = !exam.is_solution_paid || isPro || isUnlocked;
    const canAccessWithTokens = tokenBalance >= 2;

    const solutionTitle = !hasSolution
        ? 'Aucun corrigé disponible'
        : !exam.is_solution_paid
        ? 'Voir le corrigé (gratuit)'
        : isPro
        ? 'Voir le corrigé (inclus Pro)'
        : isUnlocked
        ? 'Voir le corrigé (déjà acheté)'
        : canAccessWithTokens
        ? 'Voir le corrigé (🪙 2 jetons)'
        : 'Solde insuffisant — 2 jetons requis';

    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 lg:shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80">
            <div className="mb-3 flex items-start justify-between gap-2">
                {exam.course ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <BookOpen size={11} />{exam.course.code}
                    </div>
                ) : <div />}
                {isPro ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Sparkles size={10} />Pro
                    </span>
                ) : isUnlocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 size={10} />Déjà acheté
                    </span>
                )}
            </div>

            <h3 className="mb-1 flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">{exam.name}</h3>
            {exam.course && <p className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">{exam.course.name}</p>}

            <div className="mb-4 flex flex-wrap gap-1.5">
                {exam.academic_year && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{exam.academic_year}</span>
                )}
                {exam.session && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{SESSION_LABELS[exam.session]}</span>
                )}
                {exam.exam_type && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[exam.exam_type]}`}>{TYPE_LABELS[exam.exam_type]}</span>
                )}
                {exam.is_exam_paid && !isPro && (
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">🪙 1 jeton</span>
                )}
                {hasSolution && exam.is_solution_paid && !isPro && !isUnlocked && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">🪙 2 jetons</span>
                )}
            </div>

            <div className="mt-auto flex gap-2">
                <button
                    onClick={onViewExam}
                    title={examFreeAccess ? "Voir l'épreuve" : "Voir l'épreuve (🪙 1 jeton)"}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                        examFreeAccess
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {examFreeAccess ? <Eye size={12} /> : <Lock size={12} />}
                    Épreuve
                </button>
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
                    Corrigé
                </button>
            </div>
        </div>
    );
}
