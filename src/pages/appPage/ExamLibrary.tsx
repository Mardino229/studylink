import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, CheckCircle2, Download, Eye, FileText,
    Lock, Search, Sparkles,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useGetCourses, useGetExams, useGetUnlockedSolutions } from '../../utils/exam';
import { useAxiosPrivate } from '../../hoooks/useAxiosPrivate';
import { useBilling } from '../../context/BillingContext';
import type { ExamItem, ExamSession, ExamType } from '../../types/exams';

const SESSION_LABELS: Record<ExamSession, string> = {
    fall: 'Automne',
    winter: 'Hiver',
    summer: 'Printemps/Été', 
};
const TYPE_LABELS: Record<ExamType, string> = {
    midterm: 'Intra',
    final: 'Final',
    quiz: 'Quiz',
    other: 'Autre',
};
const TYPE_COLORS: Record<ExamType, string> = {
    midterm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    final: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    quiz: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function ExamLibrary() {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { isPro, tokenBalance } = useBilling();

    const [courseId, setCourseId] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [session, setSession] = useState<ExamSession | ''>('');
    const [examType, setExamType] = useState<ExamType | ''>('');

    const [appliedFilters, setAppliedFilters] = useState<{
        courseId: string;
        academicYear: string;
        session: ExamSession | '';
        examType: ExamType | '';
    }>({ courseId: '', academicYear: '', session: '', examType: '' });

    const [downloading, setDownloading] = useState<string | null>(null);

    const { data: unlockedIds = [] } = useGetUnlockedSolutions();
    const unlockedExams = new Set(unlockedIds);

    const { data: courses = [] } = useGetCourses();
    const { data: exams = [], isLoading } = useGetExams({
        is_validated: true,
        course_id: appliedFilters.courseId || undefined,
        academic_year: appliedFilters.academicYear ? Number(appliedFilters.academicYear) : undefined,
        session: (appliedFilters.session || undefined) as ExamSession | undefined,
        exam_type: (appliedFilters.examType || undefined) as ExamType | undefined,
        limit: 100,
    });

    const handleSearch = () => setAppliedFilters({ courseId, academicYear, session, examType });
    const handleReset = () => {
        setCourseId(''); setAcademicYear(''); setSession(''); setExamType('');
        setAppliedFilters({ courseId: '', academicYear: '', session: '', examType: '' });
    };
    const hasActiveFilters = appliedFilters.courseId || appliedFilters.academicYear || appliedFilters.session || appliedFilters.examType;

    const downloadExam = async (examId: string, name: string) => {
        setDownloading(examId);
        try {
            const response = await axiosPrivate.get(`/exam-library/${examId}/download`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${name}.pdf`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    toast.error('Accès refusé', { description: "Cette épreuve n'est pas encore disponible." });
                } else if (error.response?.status === 404) {
                    toast.error('Épreuve introuvable');
                } else {
                    toast.error('Erreur lors du téléchargement');
                }
            }
        } finally {
            setDownloading(null);
        }
    };

    const viewSolution = (exam: ExamItem) => {
        navigate(`/exam-library/solution/${exam.id}?title=${encodeURIComponent(exam.name)}`);
    };

    return (
        <>
            <PageMeta title="Bibliothèque d'épreuves" description="Parcourir et télécharger les épreuves et corrigés" />
            <PageBreadcrumb pageTitle="Bibliothèque d'épreuves" />

            <div className="space-y-5 pt-4">
                {/* Filters */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white lg:col-span-2"
                        >
                            <option value="">Tous les cours</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Année (ex: 2024)"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                        <select
                            value={session}
                            onChange={(e) => setSession(e.target.value as ExamSession | '')}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Toutes les sessions</option>
                            <option value="fall">Automne</option>
                            <option value="winter">Hiver</option>
                            <option value="summer">Printemps/Été</option>
                        </select>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value as ExamType | '')}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Tous les types</option>
                            <option value="midterm">Intra</option>
                            <option value="final">Final</option>
                            <option value="quiz">Quiz</option>
                            <option value="other">Autre</option>
                        </select>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        {hasActiveFilters && (
                            <button
                                onClick={handleReset}
                                className="h-10 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 sm:w-auto"
                            >
                                Réinitialiser
                            </button>
                        )}
                        <button
                            onClick={handleSearch}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                        >
                            <Search size={15} />
                            Rechercher
                        </button>
                    </div>
                </div>

                {!isLoading && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {exams.length} épreuve{exams.length !== 1 ? 's' : ''}
                    </p>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                        ))}
                    </div>
                ) : exams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                            <FileText size={28} className="text-gray-400" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">Aucune épreuve trouvée</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Modifiez vos filtres ou revenez plus tard.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {exams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                isPro={isPro}
                                tokenBalance={tokenBalance}
                                isUnlocked={unlockedExams.has(exam.id)}
                                downloading={downloading === exam.id}
                                onDownloadExam={() => downloadExam(exam.id, exam.name)}
                                onViewSolution={() => viewSolution(exam)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function ExamCard({
    exam,
    isPro,
    tokenBalance,
    isUnlocked,
    downloading,
    onDownloadExam,
    onViewSolution,
}: {
    exam: ExamItem;
    isPro: boolean;
    tokenBalance: number;
    isUnlocked: boolean;
    downloading: boolean;
    onDownloadExam: () => void;
    onViewSolution: () => void;
}) {
    const hasSolution = !!exam.solution_file_url;
    const solutionFree = !exam.is_solution_paid;
    const canAccessFree = solutionFree || isPro || isUnlocked;
    const canAccessWithTokens = tokenBalance >= 2;

    const solutionTitle = !hasSolution
        ? 'Aucun corrigé disponible'
        : solutionFree
        ? 'Voir le corrigé (gratuit)'
        : isPro
        ? 'Voir le corrigé (inclus Pro)'
        : isUnlocked
        ? 'Voir le corrigé (déjà acheté)'
        : canAccessWithTokens
        ? 'Voir le corrigé (🪙 2 jetons)'
        : 'Solde insuffisant — 2 jetons requis';

    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80">
            <div className="mb-3 flex items-start justify-between gap-2">
                {exam.course ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <BookOpen size={11} />
                        {exam.course.code}
                    </div>
                ) : (
                    <div />
                )}

                {isUnlocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 size={10} />
                        Déjà acheté
                    </span>
                )}
                {!isUnlocked && isPro && hasSolution && exam.is_solution_paid && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Sparkles size={10} />
                        Pro
                    </span>
                )}
            </div>

            <h3 className="mb-1 flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                {exam.name}
            </h3>

            {exam.course && (
                <p className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">{exam.course.name}</p>
            )}

            <div className="mb-4 flex flex-wrap gap-1.5">
                {exam.academic_year && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {exam.academic_year}
                    </span>
                )}
                {exam.session && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {SESSION_LABELS[exam.session]}
                    </span>
                )}
                {exam.exam_type && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[exam.exam_type]}`}>
                        {TYPE_LABELS[exam.exam_type]}
                    </span>
                )}
                {hasSolution && exam.is_solution_paid && !isPro && !isUnlocked && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        🪙 2 jetons
                    </span>
                )}
            </div>

            <div className="mt-auto flex gap-2">
                <button
                    onClick={onDownloadExam}
                    disabled={downloading}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    title="Télécharger l'épreuve"
                >
                    <Download size={12} />
                    {downloading ? '…' : 'Épreuve'}
                </button>

                <button
                    onClick={onViewSolution}
                    disabled={!hasSolution}
                    title={solutionTitle}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                        canAccessFree
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {canAccessFree
                        ? <Eye size={12} />
                        : hasSolution
                        ? <Lock size={12} />
                        : <Lock size={12} />
                    }
                    Corrigé
                </button>
            </div>
        </div>
    );
}
