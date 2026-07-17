import { useState } from 'react';
import {
    AlertCircle, BookOpen, CheckCircle, CheckCircle2, Clock,
    Eye, FileText, Filter, Plus, Trash2, Upload, X, XCircle,
} from 'lucide-react';
import CourseCombobox from '../../components/ui/CourseCombobox';
import { useNavigate } from 'react-router-dom';
import {
    useGetCourses, useGetExams,
    useUploadExam, useUploadSolution,
    useValidateExam, useRejectExam, useDeleteExam,
    useCreateCourse, useDeleteCourse,
    useGetPendingExams, useGetPendingSolutions,
    useValidateSolution, useRejectSolution,
} from '../../utils/exam';
import type { ExamItem, SolutionSubmission, ExamSession, ExamType, SubmissionStatus } from '../../types/exams';
import { Modal } from '../../components/ui/modal/index.tsx';
import ConfirmModal from '../../components/ui/ConfirmModal';
import PageBreadcrumb from '../../components/common/PageBreadCrumb.tsx';
import PageMeta from '../../components/common/PageMeta.tsx';

const SESSION_LABELS: Record<ExamSession, string> = { fall: 'Automne', winter: 'Hiver', summer: 'Printemps/Été' };
const TYPE_LABELS: Record<ExamType, string> = { midterm: 'Intra', final: 'Final', quiz: 'Quiz', other: 'Autre' };

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
    validated: { label: 'Publié', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Refusé', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

type Tab = 'exams' | 'pending_exams' | 'pending_solutions' | 'courses';

export default function AdminExamLibrary() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('exams');

    const uploadExam = useUploadExam();
    const uploadSolution = useUploadSolution();
    const validateExam = useValidateExam();
    const rejectExam = useRejectExam();
    const deleteExam = useDeleteExam();
    const createCourse = useCreateCourse();
    const deleteCourse = useDeleteCourse();
    const validateSolution = useValidateSolution();
    const rejectSolution = useRejectSolution();

    const [examFilters, setExamFilters] = useState<{
        course_id: string; session: string; exam_type: string;
        submission_status: string; academic_year: string;
    }>({ course_id: '', session: '', exam_type: '', submission_status: '', academic_year: '' });

    const activeFilters = {
        ...(examFilters.course_id ? { course_id: examFilters.course_id } : {}),
        ...(examFilters.session ? { session: examFilters.session as ExamSession } : {}),
        ...(examFilters.exam_type ? { exam_type: examFilters.exam_type as ExamType } : {}),
        ...(examFilters.submission_status ? { submission_status: examFilters.submission_status as SubmissionStatus } : {}),
        ...(examFilters.academic_year ? { academic_year: Number(examFilters.academic_year) } : {}),
        limit: 200,
    };
    const hasActiveFilter = Object.keys(activeFilters).length > 1;

    const { data: exams = [], isLoading: isLoadingExams } = useGetExams(activeFilters);
    const { data: courses = [], isLoading: isLoadingCourses } = useGetCourses();
    const { data: pendingExams = [], isLoading: isLoadingPendingExams } = useGetPendingExams();
    const { data: pendingSolutions = [], isLoading: isLoadingPendingSols } = useGetPendingSolutions();

    // Upload exam modal
    const [examModal, setExamModal] = useState(false);
    const [examForm, setExamForm] = useState({
        name: '', course_id: '', academic_year: '', session: '' as ExamSession | '',
        exam_type: '' as ExamType | '', is_solution_paid: true,
    });
    const [examFile, setExamFile] = useState<File | null>(null);

    // Upload solution modal
    const [solutionExamId, setSolutionExamId] = useState<string | null>(null);
    const [solutionFile, setSolutionFile] = useState<File | null>(null);

    // Reject modal (exam)
    const [rejectExamId, setRejectExamId] = useState<string | null>(null);
    const [rejectExamNote, setRejectExamNote] = useState('');

    // Reject modal (solution)
    const [rejectSolId, setRejectSolId] = useState<string | null>(null);
    const [rejectSolNote, setRejectSolNote] = useState('');

    // Delete confirms
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

    // Create course modal
    const [courseModal, setCourseModal] = useState(false);
    const [courseForm, setCourseForm] = useState({ code: '', name: '' });

    const previewExam = (exam: ExamItem) => {
        const params = new URLSearchParams({
            title: exam.name,
            endpoint: `/exam-library/${exam.id}/download`,
        });
        navigate(`/exam-library/solution/${exam.id}?${params}`);
    };

    const previewSolution = (sol: SolutionSubmission) => {
        const params = new URLSearchParams({
            title: `Corrigé   ${sol.exam?.name ?? ''}`,
            endpoint: `/exam-library/solutions/${sol.id}/file`,
        });
        navigate(`/exam-library/solution/${sol.exam?.id ?? sol.id}?${params}`);
    };

    const handleUploadExam = () => {
        if (!examForm.name.trim() || !examFile) return;
        uploadExam.mutate(
            {
                name: examForm.name.trim(), exam_file: examFile,
                course_id: examForm.course_id || undefined,
                academic_year: examForm.academic_year ? Number(examForm.academic_year) : undefined,
                session: (examForm.session || undefined) as ExamSession | undefined,
                exam_type: (examForm.exam_type || undefined) as ExamType | undefined,
                is_solution_paid: examForm.is_solution_paid,
            },
            { onSuccess: () => { setExamModal(false); setExamForm({ name: '', course_id: '', academic_year: '', session: '', exam_type: '', is_solution_paid: true }); setExamFile(null); } }
        );
    };

    const handleUploadSolution = () => {
        if (!solutionExamId || !solutionFile) return;
        uploadSolution.mutate(
            { examId: solutionExamId, solution_file: solutionFile },
            { onSuccess: () => { setSolutionExamId(null); setSolutionFile(null); } }
        );
    };

    const handleCreateCourse = () => {
        if (!courseForm.code.trim() || !courseForm.name.trim()) return;
        createCourse.mutate(
            { code: courseForm.code.trim(), name: courseForm.name.trim() },
            { onSuccess: () => { setCourseModal(false); setCourseForm({ code: '', name: '' }); } }
        );
    };

    const TABS: { key: Tab; label: string; badge?: number }[] = [
        { key: 'exams', label: 'Épreuves' },
        { key: 'pending_exams', label: 'File épreuves', badge: pendingExams.length },
        { key: 'pending_solutions', label: 'File corrigés', badge: pendingSolutions.length },
        { key: 'courses', label: 'Cours' },
    ];

    return (
        <div className="space-y-5">

            <PageMeta title="Admin   Bibliothèque d'épreuves" description="Gestion de la bibliothèque d'épreuves" />
            <PageBreadcrumb pageTitle="Bibliothèque d'épreuves" />
            <div className="flex justify-end">
                {tab === 'exams' && (
                    <button onClick={() => setExamModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto">
                        <Plus size={16} />Nouvelle épreuve
                    </button>
                )}
                {tab === 'courses' && (
                    <button onClick={() => setCourseModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto">
                        <Plus size={16} />Nouveau cours 
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit dark:border-gray-800 dark:bg-gray-900">
                {TABS.map(({ key, label, badge }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            tab === key
                                ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {label}
                        {badge !== undefined && badge > 0 && (
                            <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Exams tab ── */}
            {tab === 'exams' && (
                <div className="space-y-3">
                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Filter size={13} />Filtres
                    </div>
                    <CourseCombobox
                        compact
                        value={examFilters.course_id}
                        onChange={(id) => setExamFilters(p => ({ ...p, course_id: id }))}
                        courses={courses}
                    />
                    <select
                        value={examFilters.session}
                        onChange={(e) => setExamFilters(p => ({ ...p, session: e.target.value }))}
                        className={filterSelectCls}
                    >
                        <option value="">Toutes sessions</option>
                        <option value="fall">Automne</option>
                        <option value="winter">Hiver</option>
                        <option value="summer">Printemps/Été</option>
                    </select>
                    <select
                        value={examFilters.exam_type}
                        onChange={(e) => setExamFilters(p => ({ ...p, exam_type: e.target.value }))}
                        className={filterSelectCls}
                    >
                        <option value="">Tous types</option>
                        <option value="midterm">Intra</option>
                        <option value="final">Final</option>
                        <option value="quiz">Quiz</option>
                        <option value="other">Autre</option>
                    </select>
                    <select
                        value={examFilters.submission_status}
                        onChange={(e) => setExamFilters(p => ({ ...p, submission_status: e.target.value }))}
                        className={filterSelectCls}
                    >
                        <option value="">Tous statuts</option>
                        <option value="validated">Publié</option>
                        <option value="pending">En attente</option>
                        <option value="rejected">Refusé</option>
                    </select>
                    <input
                        type="number"
                        value={examFilters.academic_year}
                        onChange={(e) => setExamFilters(p => ({ ...p, academic_year: e.target.value }))}
                        placeholder="Année"
                        className={filterSelectCls + ' w-24'}
                    />
                    {hasActiveFilter && (
                        <button
                            onClick={() => setExamFilters({ course_id: '', session: '', exam_type: '', submission_status: '', academic_year: '' })}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                            <X size={12} />Réinitialiser
                        </button>
                    )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {isLoadingExams ? (
                        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
                    ) : exams.length === 0 ? (
                        <EmptyTable icon={FileText} text="Aucune épreuve pour l'instant." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Épreuve</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Cours</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Détails</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Statut</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Corrigé</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {exams.map(exam => (
                                        <ExamRow
                                            key={exam.id}
                                            exam={exam}
                                            onValidate={() => validateExam.mutate(exam.id)}
                                            onReject={() => { setRejectExamId(exam.id); setRejectExamNote(''); }}
                                            onUploadSolution={() => setSolutionExamId(exam.id)}
                                            onDelete={() => setDeleteExamId(exam.id)}
                                            onPreview={() => previewExam(exam)}
                                            isValidating={validateExam.isPending}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* ── Pending exams tab ── */}
            {tab === 'pending_exams' && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {isLoadingPendingExams ? (
                        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
                    ) : pendingExams.length === 0 ? (
                        <EmptyTable icon={CheckCircle2} text="Aucune épreuve en attente de validation." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Épreuve</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Cours</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Détails</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {pendingExams.map(exam => (
                                        <PendingExamRow
                                            key={exam.id}
                                            exam={exam}
                                            onValidate={() => validateExam.mutate(exam.id)}
                                            onReject={() => { setRejectExamId(exam.id); setRejectExamNote(''); }}
                                            onPreview={() => previewExam(exam)}
                                            isValidating={validateExam.isPending}
                                            isRejecting={rejectExam.isPending}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Pending solutions tab ── */}
            {tab === 'pending_solutions' && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {isLoadingPendingSols ? (
                        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
                    ) : pendingSolutions.length === 0 ? (
                        <EmptyTable icon={CheckCircle2} text="Aucun corrigé en attente de validation." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Corrigé pour</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Soumis le</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {pendingSolutions.map(sol => (
                                        <PendingSolutionRow
                                            key={sol.id}
                                            submission={sol}
                                            onValidate={() => validateSolution.mutate(sol.id)}
                                            onReject={() => { setRejectSolId(sol.id); setRejectSolNote(''); }}
                                            onPreview={() => previewSolution(sol)}
                                            isValidating={validateSolution.isPending}
                                            isRejecting={rejectSolution.isPending}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Courses tab ── */}
            {tab === 'courses' && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {isLoadingCourses ? (
                        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
                    ) : courses.length === 0 ? (
                        <EmptyTable icon={BookOpen} text="Aucun cours pour l'instant." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[400px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Nom</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {courses.map(course => (
                                        <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{course.code}</td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">{course.name}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => setDeleteCourseId(course.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20">
                                                    <Trash2 size={13} />Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal : Upload exam ── */}
            <Modal isOpen={examModal} onClose={() => setExamModal(false)} className="max-w-lg p-6">
                <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">Uploader une épreuve</h3>
                <div className="space-y-4">
                    <input value={examForm.name} onChange={(e) => setExamForm(p => ({ ...p, name: e.target.value }))} placeholder="Nom de l'épreuve *" className={inputCls} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <select value={examForm.course_id} onChange={(e) => setExamForm(p => ({ ...p, course_id: e.target.value }))} className={selectCls}>
                            <option value="">  Cours  </option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.code}   {c.name}</option>)}
                        </select>
                        <input type="number" value={examForm.academic_year} onChange={(e) => setExamForm(p => ({ ...p, academic_year: e.target.value }))} placeholder="Année" className={inputCls} />
                        <select value={examForm.session} onChange={(e) => setExamForm(p => ({ ...p, session: e.target.value as ExamSession | '' }))} className={selectCls}>
                            <option value="">  Session  </option>
                            <option value="fall">Automne</option><option value="winter">Hiver</option><option value="summer">Printemps/Été</option>
                        </select>
                        <select value={examForm.exam_type} onChange={(e) => setExamForm(p => ({ ...p, exam_type: e.target.value as ExamType | '' }))} className={selectCls}>
                            <option value="">  Type  </option>
                            <option value="midterm">Intra</option><option value="final">Final</option><option value="quiz">Quiz</option><option value="other">Autre</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input type="checkbox" checked={examForm.is_solution_paid} onChange={(e) => setExamForm(p => ({ ...p, is_solution_paid: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                        Corrigé payant (2 jetons)
                    </label>
                    <input type="file" accept=".pdf,.docx,.pptx,.ppt" onChange={(e) => setExamFile(e.target.files?.[0] ?? null)} className={fileCls} />
                    <ModalButtons onCancel={() => setExamModal(false)} onConfirm={handleUploadExam} loading={uploadExam.isPending} disabled={!examForm.name.trim() || !examFile} label="Uploader" />
                </div>
            </Modal>

            {/* ── Modal : Upload solution ── */}
            <Modal isOpen={!!solutionExamId} onClose={() => { setSolutionExamId(null); setSolutionFile(null); }} className="max-w-md p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Uploader le corrigé</h3>
                <input type="file" accept=".pdf,.docx,.pptx,.ppt" onChange={(e) => setSolutionFile(e.target.files?.[0] ?? null)} className={fileCls} />
                <div className="mt-4">
                    <ModalButtons onCancel={() => { setSolutionExamId(null); setSolutionFile(null); }} onConfirm={handleUploadSolution} loading={uploadSolution.isPending} disabled={!solutionFile} label="Uploader" />
                </div>
            </Modal>

            {/* ── Modal : Reject exam ── */}
            <Modal isOpen={!!rejectExamId} onClose={() => setRejectExamId(null)} className="max-w-md p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Refuser l'épreuve</h3>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Expliquez la raison du refus   l'utilisateur pourra la corriger et re-soumettre.</p>
                <textarea
                    value={rejectExamNote}
                    onChange={(e) => setRejectExamNote(e.target.value)}
                    placeholder="Raison du refus…"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
                <div className="mt-4">
                    <ModalButtons
                        onCancel={() => setRejectExamId(null)}
                        onConfirm={() => {
                            if (!rejectExamId) return;
                            rejectExam.mutate({ examId: rejectExamId, admin_note: rejectExamNote }, { onSuccess: () => setRejectExamId(null) });
                        }}
                        loading={rejectExam.isPending}
                        disabled={!rejectExamNote.trim()}
                        label="Refuser"
                        danger
                    />
                </div>
            </Modal>

            {/* ── Modal : Reject solution ── */}
            <Modal isOpen={!!rejectSolId} onClose={() => setRejectSolId(null)} className="max-w-md p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Refuser le corrigé</h3>
                <textarea
                    value={rejectSolNote}
                    onChange={(e) => setRejectSolNote(e.target.value)}
                    placeholder="Raison du refus…"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-400 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
                <div className="mt-4">
                    <ModalButtons
                        onCancel={() => setRejectSolId(null)}
                        onConfirm={() => {
                            if (!rejectSolId) return;
                            rejectSolution.mutate({ submissionId: rejectSolId, admin_note: rejectSolNote }, { onSuccess: () => setRejectSolId(null) });
                        }}
                        loading={rejectSolution.isPending}
                        disabled={!rejectSolNote.trim()}
                        label="Refuser"
                        danger
                    />
                </div>
            </Modal>

            {/* ── Modal : Create course ── */}
            <Modal isOpen={courseModal} onClose={() => setCourseModal(false)} className="max-w-sm p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Nouveau cours</h3>
                <div className="space-y-3">
                    <input value={courseForm.code} onChange={(e) => setCourseForm(p => ({ ...p, code: e.target.value }))} placeholder="Code   ex: CSI2120" className={inputCls} />
                    <input value={courseForm.name} onChange={(e) => setCourseForm(p => ({ ...p, name: e.target.value }))} placeholder="Nom du cours" className={inputCls} />
                    <ModalButtons onCancel={() => setCourseModal(false)} onConfirm={handleCreateCourse} loading={createCourse.isPending} disabled={!courseForm.code.trim() || !courseForm.name.trim()} label="Créer" />
                </div>
            </Modal>

            <ConfirmModal isOpen={!!deleteExamId} title="Supprimer l'épreuve" message="Cette épreuve et ses fichiers seront supprimés définitivement." confirmLabel="Supprimer" cancelLabel="Annuler"
                onConfirm={() => { if (deleteExamId) { deleteExam.mutate(deleteExamId); setDeleteExamId(null); } }} onCancel={() => setDeleteExamId(null)} />
            <ConfirmModal isOpen={!!deleteCourseId} title="Supprimer le cours" message="Ce cours sera supprimé. Les épreuves associées ne seront pas supprimées." confirmLabel="Supprimer" cancelLabel="Annuler"
                onConfirm={() => { if (deleteCourseId) { deleteCourse.mutate(deleteCourseId); setDeleteCourseId(null); } }} onCancel={() => setDeleteCourseId(null)} />

        </div>
    );
}

// ─── Shared style strings ──────────────────────────────────
const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
const filterSelectCls = "rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
const selectCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
const fileCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white";

function ModalButtons({ onCancel, onConfirm, loading, disabled, label, danger = false }: {
    onCancel: () => void; onConfirm: () => void;
    loading: boolean; disabled: boolean; label: string; danger?: boolean;
}) {
    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                Annuler
            </button>
            <button
                onClick={onConfirm}
                disabled={disabled || loading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                    danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {loading ? `${label}…` : label}
            </button>
        </div>
    );
}

function EmptyTable({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon size={32} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">{text}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
    const { label, className, icon: Icon } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
            <Icon size={11} />{label}
        </span>
    );
}

function ExamRow({ exam, onValidate, onReject, onUploadSolution, onDelete, onPreview, isValidating }: {
    exam: ExamItem;
    onValidate: () => void; onReject: () => void;
    onUploadSolution: () => void; onDelete: () => void;
    onPreview: () => void; isValidating: boolean;
}) {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white">{exam.name}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{exam.id.slice(0, 8)}…</p>
            </td>
            <td className="px-4 py-3">
                {exam.course ? <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{exam.course.code}</span> : <span className="text-gray-400"> </span>}
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {exam.academic_year && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{exam.academic_year}</span>}
                    {exam.session && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{SESSION_LABELS[exam.session]}</span>}
                    {exam.exam_type && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{TYPE_LABELS[exam.exam_type]}</span>}
                </div>
            </td>
            <td className="px-4 py-3 text-center"><StatusBadge status={exam.submission_status} /></td>
            <td className="px-4 py-3 text-center">
                {exam.solution_file_url ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <CheckCircle size={11} />{exam.is_solution_paid ? 'Payant' : 'Gratuit'}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <XCircle size={11} />Absent
                    </span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    {exam.submission_status === 'pending' && (
                        <>
                            <button onClick={onValidate} disabled={isValidating} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50">Valider</button>
                            <button onClick={onReject} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20">Refuser</button>
                        </>
                    )}
                    <button onClick={onPreview} title="Aperçu du fichier" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400">
                        <Eye size={14} />
                    </button>
                    <button onClick={onUploadSolution} title={exam.solution_file_url ? 'Remplacer le corrigé' : 'Uploader le corrigé'} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                        <Upload size={14} />
                    </button>
                    <button onClick={onDelete} title="Supprimer" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20">
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function PendingExamRow({ exam, onValidate, onReject, onPreview, isValidating, isRejecting }: {
    exam: ExamItem; onValidate: () => void; onReject: () => void; onPreview: () => void;
    isValidating: boolean; isRejecting: boolean;
}) {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white">{exam.name}</p>
                {exam.admin_note && (
                    <div className="mt-1 flex items-start gap-1 text-xs text-red-500">
                        <AlertCircle size={11} className="mt-0.5 shrink-0" />
                        <span>{exam.admin_note}</span>
                    </div>
                )}
            </td>
            <td className="px-4 py-3">
                {exam.course ? <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{exam.course.code}</span> : <span className="text-gray-400"> </span>}
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {exam.academic_year && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{exam.academic_year}</span>}
                    {exam.session && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{SESSION_LABELS[exam.session]}</span>}
                    {exam.exam_type && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{TYPE_LABELS[exam.exam_type]}</span>}
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onPreview} title="Aperçu" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <Eye size={13} />Aperçu
                    </button>
                    <button onClick={onValidate} disabled={isValidating} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50">
                        ✓ Valider
                    </button>
                    <button onClick={onReject} disabled={isRejecting} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                        ✕ Refuser
                    </button>
                </div>
            </td>
        </tr>
    );
}

function PendingSolutionRow({ submission, onValidate, onReject, onPreview, isValidating, isRejecting }: {
    submission: SolutionSubmission; onValidate: () => void; onReject: () => void; onPreview: () => void;
    isValidating: boolean; isRejecting: boolean;
}) {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white">{submission.exam?.name ?? 'Épreuve inconnue'}</p>
                {submission.exam?.course && (
                    <span className="mt-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">{submission.exam.course.code}</span>
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {new Date(submission.submitted_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onPreview} title="Aperçu" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <Eye size={13} />Aperçu
                    </button>
                    <button onClick={onValidate} disabled={isValidating} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50">
                        ✓ Valider
                    </button>
                    <button onClick={onReject} disabled={isRejecting} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                        ✕ Refuser
                    </button>
                </div>
            </td>
        </tr>
    );
}

