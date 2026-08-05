import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Zap } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useGetCourses, useGetExams } from '../../utils/exam';
import { useBilling } from '../../context/BillingContext';
import type { ExamItem, ExamSession, ExamType } from '../../types/exams';
import { Modal } from '../../components/ui/modal/index.tsx';
import ExamCard from './exam-library/ExamCard';
import ExamFiltersPanel from './exam-library/ExamFiltersPanel';
import SubmitExamModal from './exam-library/SubmitExamModal';

export default function ExamLibrary() {
    const { t } = useTranslation('exams');
    const navigate = useNavigate();
    const { isPro, isUltra, tokenBalance } = useBilling();

    const [courseId, setCourseId] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [session, setSession] = useState<ExamSession | ''>('');
    const [examType, setExamType] = useState<ExamType | ''>('');
    const [appliedFilters, setAppliedFilters] = useState<{
        courseId: string; academicYear: string;
        session: ExamSession | ''; examType: ExamType | '';
    }>({ courseId: '', academicYear: '', session: '', examType: '' });

    const [confirmViewExam, setConfirmViewExam] = useState<ExamItem | null>(null);
    const [confirmExam, setConfirmExam] = useState<ExamItem | null>(null);
    const [submitOpen, setSubmitOpen] = useState(false);

    const { data: courses = [] } = useGetCourses();
    const { data: exams = [], isLoading } = useGetExams({
        submission_status: 'validated',
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
    const hasActiveFilters = !!(appliedFilters.courseId || appliedFilters.academicYear || appliedFilters.session || appliedFilters.examType);

    const viewExam = (exam: ExamItem) => {
        const params = new URLSearchParams({ title: exam.name, endpoint: `/exam-library/${exam.id}/download`, cost: '1' });
        if (exam.has_exam_access) navigate(`/exam-library/solution/${exam.id}?${params}`);
        else setConfirmViewExam(exam);
    };

    const viewSolution = (exam: ExamItem) => {
        if (exam.has_solution_access) {
            navigate(`/exam-library/solution/${exam.id}?title=${encodeURIComponent(exam.name)}`);
        } else {
            setConfirmExam(exam);
        }
    };

    return (
        <>
            <PageMeta title={t('library.page_title')} description={t('library.page_title')} />
            <PageBreadcrumb pageTitle={t('library.page_title')} />

            <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('library.contribute_desc')}
                    </p>
                    <button
                        onClick={() => setSubmitOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus size={15} />
                        <span className="sm:hidden">{t('library.submit_short')}</span>
                        <span className="hidden sm:inline">{t('library.submit_btn')}</span>
                    </button>
                </div>

                <ExamFiltersPanel
                    courseId={courseId} setCourseId={setCourseId}
                    academicYear={academicYear} setAcademicYear={setAcademicYear}
                    session={session} setSession={setSession}
                    examType={examType} setExamType={setExamType}
                    hasActiveFilters={hasActiveFilters}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    courses={courses}
                />

                {!isLoading && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {t('library.exam_count', { count: exams.length })}
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
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{t('library.empty')}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('library.empty_desc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {exams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                isPro={isPro || isUltra}
                                tokenBalance={tokenBalance}
                                isSolutionUnlocked={exam.has_solution_access}
                                isExamUnlocked={exam.has_exam_access}
                                onViewExam={() => viewExam(exam)}
                                onViewSolution={() => viewSolution(exam)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Confirm exam view (1 token) ── */}
            <Modal isOpen={!!confirmViewExam} onClose={() => setConfirmViewExam(null)} className="max-w-sm p-6">
                {confirmViewExam && (
                    <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
                            <Zap size={22} className="text-violet-500" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{t('library.view_exam')}</h3>
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">{confirmViewExam.name}</p>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                            <Trans
                                i18nKey="library.confirm_exam_access"
                                ns="exams"
                                components={{
                                    token: <span className="font-semibold text-violet-600 dark:text-violet-400" />,
                                    str: <strong />,
                                }}
                            />
                        </p>
                        <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('library.your_balance')}</span>
                            <span className={`text-sm font-semibold ${tokenBalance >= 1 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                {t('library.balance_tokens', { count: tokenBalance })}
                                {tokenBalance < 1 && ` ${t('library.balance_insufficient')}`}
                            </span>
                        </div>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button onClick={() => setConfirmViewExam(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                                {t('library.cancel')}
                            </button>
                            <button
                                disabled={tokenBalance < 1}
                                onClick={() => {
                                    const params = new URLSearchParams({ title: confirmViewExam.name, endpoint: `/exam-library/${confirmViewExam.id}/download`, cost: '1' });
                                    navigate(`/exam-library/solution/${confirmViewExam.id}?${params}`);
                                    setConfirmViewExam(null);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Zap size={15} />{t('library.confirm_exam_btn')}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* ── Confirm solution unlock (2 tokens) ── */}
            <Modal isOpen={!!confirmExam} onClose={() => setConfirmExam(null)} className="max-w-sm p-6">
                {confirmExam && (
                    <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                            <Zap size={22} className="text-amber-500" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{t('library.unlock_solution')}</h3>
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">{confirmExam.name}</p>
                        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                            <Trans
                                i18nKey="library.confirm_sol_access"
                                ns="exams"
                                components={{
                                    token: <span className="font-semibold text-amber-600 dark:text-amber-400" />,
                                    str: <strong />,
                                }}
                            />
                        </p>
                        <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{t('library.your_balance')}</span>
                            <span className={`text-sm font-semibold ${tokenBalance >= 2 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                                {t('library.balance_tokens', { count: tokenBalance })}
                                {tokenBalance < 2 && ` ${t('library.balance_insufficient')}`}
                            </span>
                        </div>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button onClick={() => setConfirmExam(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                                {t('library.cancel')}
                            </button>
                            <button
                                disabled={tokenBalance < 2}
                                onClick={() => {
                                    navigate(`/exam-library/solution/${confirmExam.id}?title=${encodeURIComponent(confirmExam.name)}`);
                                    setConfirmExam(null);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Zap size={15} />{t('library.confirm_sol_btn')}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            <SubmitExamModal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} courses={courses} />
        </>
    );
}
