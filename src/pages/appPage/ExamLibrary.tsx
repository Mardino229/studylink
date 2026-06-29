import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BookOpen, Download, FileText, Lock, Search, Unlock } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useGetCourses, useGetExams } from '../../utils/exam';
import { useAxiosPrivate } from '../../hoooks/useAxiosPrivate';
import type { ExamItem, ExamSession, ExamType } from '../../types/exams';

const SESSION_LABELS: Record<ExamSession, string> = {
    fall: 'Automne',
    winter: 'Hiver',
    summer: 'Été',
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

    const downloadFile = async (examId: string, type: 'exam' | 'solution', name: string) => {
        const key = `${examId}-${type}`;
        setDownloading(key);
        try {
            const url = type === 'exam' ? `/exam-library/${examId}/download` : `/exam-library/${examId}/solution`;
            const response = await axiosPrivate.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${name}.pdf`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 402) {
                    toast.error('Abonnement requis', { description: 'Un abonnement actif est nécessaire pour accéder à ce corrigé.' });
                } else if (error.response?.status === 403) {
                    toast.error('Accès refusé', { description: "Cette épreuve n'est pas encore disponible." });
                } else if (error.response?.status === 404) {
                    toast.error('Corrigé indisponible', { description: "Aucun corrigé n'est disponible pour cette épreuve." });
                } else {
                    toast.error('Erreur lors du téléchargement');
                }
            }
        } finally {
            setDownloading(null);
        }
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
                            <option value="summer">Été</option>
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
                            <ExamCard key={exam.id} exam={exam} downloading={downloading} onDownload={downloadFile} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function ExamCard({
    exam,
    downloading,
    onDownload,
}: {
    exam: ExamItem;
    downloading: string | null;
    onDownload: (id: string, type: 'exam' | 'solution', name: string) => void;
}) {
    const isDownloadingExam = downloading === `${exam.id}-exam`;
    const isDownloadingSolution = downloading === `${exam.id}-solution`;
    const hasSolution = !!exam.solution_file_url;

    return (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900/80">
            {exam.course && (
                <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <BookOpen size={11} />
                    {exam.course.code}
                </div>
            )}

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
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onDownload(exam.id, 'exam', exam.name)}
                    disabled={isDownloadingExam}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                    <Download size={12} />
                    {isDownloadingExam ? '…' : 'Épreuve'}
                </button>
                <button
                    onClick={() => hasSolution && onDownload(exam.id, 'solution', `${exam.name} - Corrigé`)}
                    disabled={isDownloadingSolution || !hasSolution}
                    title={
                        !hasSolution ? 'Aucun corrigé disponible'
                        : exam.is_solution_paid ? 'Corrigé payant — abonnement requis'
                        : 'Télécharger le corrigé'
                    }
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    {exam.is_solution_paid ? <Lock size={12} /> : <Unlock size={12} />}
                    {isDownloadingSolution ? '…' : 'Corrigé'}
                </button>
            </div>
        </div>
    );
}
