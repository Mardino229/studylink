import React, { useState } from 'react';
import {
    BookOpen, CheckCircle, Clock, FileText, Plus,
    Trash2, Upload, XCircle,
} from 'lucide-react';
import {
    useGetCourses, useGetExams,
    useUploadExam, useUploadSolution,
    useValidateExam, useDeleteExam,
    useCreateCourse, useDeleteCourse,
} from '../../utils/exam';
import type { ExamItem, ExamSession, ExamType } from '../../types/exams';
import { Modal } from '../../components/ui/modal/index.tsx';
import ConfirmModal from '../../components/ui/ConfirmModal';

const SESSION_LABELS: Record<ExamSession, string> = { fall: 'Automne', winter: 'Hiver', summer: 'Été' };
const TYPE_LABELS: Record<ExamType, string> = { midterm: 'Intra', final: 'Final', quiz: 'Quiz', other: 'Autre' };

type Tab = 'exams' | 'courses';

export default function AdminExamLibrary() {
    const [tab, setTab] = useState<Tab>('exams');

    // ─── Mutations ───────────────────────────────────────────
    const uploadExam = useUploadExam();
    const uploadSolution = useUploadSolution();
    const validateExam = useValidateExam();
    const deleteExam = useDeleteExam();
    const createCourse = useCreateCourse();
    const deleteCourse = useDeleteCourse();

    // ─── Data ────────────────────────────────────────────────
    const { data: exams = [], isLoading: isLoadingExams } = useGetExams({ limit: 200 });
    const { data: courses = [], isLoading: isLoadingCourses } = useGetCourses();

    // ─── Upload exam modal ───────────────────────────────────
    const [examModal, setExamModal] = useState(false);
    const [examForm, setExamForm] = useState({
        name: '', course_id: '', academic_year: '', session: '' as ExamSession | '',
        exam_type: '' as ExamType | '', is_solution_paid: true,
    });
    const [examFile, setExamFile] = useState<File | null>(null);

    const handleUploadExam = () => {
        if (!examForm.name.trim() || !examFile) return;
        uploadExam.mutate(
            {
                name: examForm.name.trim(),
                exam_file: examFile,
                course_id: examForm.course_id || undefined,
                academic_year: examForm.academic_year ? Number(examForm.academic_year) : undefined,
                session: (examForm.session || undefined) as ExamSession | undefined,
                exam_type: (examForm.exam_type || undefined) as ExamType | undefined,
                is_solution_paid: examForm.is_solution_paid,
            },
            {
                onSuccess: () => {
                    setExamModal(false);
                    setExamForm({ name: '', course_id: '', academic_year: '', session: '', exam_type: '', is_solution_paid: true });
                    setExamFile(null);
                },
            }
        );
    };

    // ─── Upload solution ─────────────────────────────────────
    const [solutionExamId, setSolutionExamId] = useState<string | null>(null);
    const [solutionFile, setSolutionFile] = useState<File | null>(null);

    const handleUploadSolution = () => {
        if (!solutionExamId || !solutionFile) return;
        uploadSolution.mutate(
            { examId: solutionExamId, solution_file: solutionFile },
            {
                onSuccess: () => {
                    setSolutionExamId(null);
                    setSolutionFile(null);
                },
            }
        );
    };

    // ─── Delete exam confirm ─────────────────────────────────
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

    // ─── Create course modal ─────────────────────────────────
    const [courseModal, setCourseModal] = useState(false);
    const [courseForm, setCourseForm] = useState({ code: '', name: '' });

    const handleCreateCourse = () => {
        if (!courseForm.code.trim() || !courseForm.name.trim()) return;
        createCourse.mutate(
            { code: courseForm.code.trim(), name: courseForm.name.trim() },
            { onSuccess: () => { setCourseModal(false); setCourseForm({ code: '', name: '' }); } }
        );
    };

    // ─── Delete course confirm ───────────────────────────────
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bibliothèque d'épreuves</h1>
                <div>
                    {tab === 'exams' && (
                        <button
                            onClick={() => setExamModal(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                        >
                            <Plus size={16} />
                            Nouvelle épreuve
                        </button>
                    )}
                    {tab === 'courses' && (
                        <button
                            onClick={() => setCourseModal(true)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                        >
                            <Plus size={16} />
                            Nouveau cours
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit dark:border-gray-800 dark:bg-gray-900">
                {(['exams', 'courses'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            tab === t
                                ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {t === 'exams' ? 'Épreuves' : 'Cours'}
                    </button>
                ))}
            </div>

            {/* ── Exams tab ── */}
            {tab === 'exams' && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {isLoadingExams ? (
                        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FileText size={32} className="mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Aucune épreuve pour l'instant.</p>
                        </div>
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
                                            onUploadSolution={() => setSolutionExamId(exam.id)}
                                            onDelete={() => setDeleteExamId(exam.id)}
                                            isValidating={validateExam.isPending}
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
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <BookOpen size={32} className="mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Aucun cours pour l'instant.</p>
                        </div>
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
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                {course.code}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">{course.name}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setDeleteCourseId(course.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                                >
                                                    <Trash2 size={13} />
                                                    Supprimer
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
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={examForm.name}
                            onChange={(e) => setExamForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="Ex: Examen final hiver 2024"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Cours</label>
                            <select
                                value={examForm.course_id}
                                onChange={(e) => setExamForm(p => ({ ...p, course_id: e.target.value }))}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">— Aucun —</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Année</label>
                            <input
                                type="number"
                                value={examForm.academic_year}
                                onChange={(e) => setExamForm(p => ({ ...p, academic_year: e.target.value }))}
                                placeholder="2024"
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Session</label>
                            <select
                                value={examForm.session}
                                onChange={(e) => setExamForm(p => ({ ...p, session: e.target.value as ExamSession | '' }))}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">— Aucune —</option>
                                <option value="fall">Automne</option>
                                <option value="winter">Hiver</option>
                                <option value="summer">Été</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
                            <select
                                value={examForm.exam_type}
                                onChange={(e) => setExamForm(p => ({ ...p, exam_type: e.target.value as ExamType | '' }))}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">— Aucun —</option>
                                <option value="midterm">Intra</option>
                                <option value="final">Final</option>
                                <option value="quiz">Quiz</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                            type="checkbox"
                            checked={examForm.is_solution_paid}
                            onChange={(e) => setExamForm(p => ({ ...p, is_solution_paid: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        Corrigé payant (abonnement requis)
                    </label>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Fichier épreuve <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.docx,.pptx,.ppt"
                            onChange={(e) => setExamFile(e.target.files?.[0] ?? null)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <button
                            onClick={() => setExamModal(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUploadExam}
                            disabled={!examForm.name.trim() || !examFile || uploadExam.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploadExam.isPending ? 'Upload…' : 'Uploader'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Modal : Upload solution ── */}
            <Modal isOpen={!!solutionExamId} onClose={() => { setSolutionExamId(null); setSolutionFile(null); }} className="max-w-md p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Uploader le corrigé</h3>
                <div className="space-y-4">
                    <input
                        type="file"
                        accept=".pdf,.docx,.pptx,.ppt"
                        onChange={(e) => setSolutionFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            onClick={() => { setSolutionExamId(null); setSolutionFile(null); }}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUploadSolution}
                            disabled={!solutionFile || uploadSolution.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Upload size={14} />
                            {uploadSolution.isPending ? 'Upload…' : 'Uploader'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Modal : Create course ── */}
            <Modal isOpen={courseModal} onClose={() => setCourseModal(false)} className="max-w-sm p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Nouveau cours</h3>
                <div className="space-y-3">
                    <input
                        value={courseForm.code}
                        onChange={(e) => setCourseForm(p => ({ ...p, code: e.target.value }))}
                        placeholder="Code — ex: CSI2120"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                        value={courseForm.name}
                        onChange={(e) => setCourseForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Nom — ex: Paradigmes de programmation"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                        <button
                            onClick={() => setCourseModal(false)}
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleCreateCourse}
                            disabled={!courseForm.code.trim() || !courseForm.name.trim() || createCourse.isPending}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createCourse.isPending ? 'Création…' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Confirm : Delete exam ── */}
            <ConfirmModal
                isOpen={!!deleteExamId}
                title="Supprimer l'épreuve"
                message="Cette épreuve et ses fichiers seront supprimés définitivement."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                onConfirm={() => { if (deleteExamId) { deleteExam.mutate(deleteExamId); setDeleteExamId(null); } }}
                onCancel={() => setDeleteExamId(null)}
            />

            {/* ── Confirm : Delete course ── */}
            <ConfirmModal
                isOpen={!!deleteCourseId}
                title="Supprimer le cours"
                message="Ce cours sera supprimé. Les épreuves associées ne seront pas supprimées."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                onConfirm={() => { if (deleteCourseId) { deleteCourse.mutate(deleteCourseId); setDeleteCourseId(null); } }}
                onCancel={() => setDeleteCourseId(null)}
            />
        </div>
    );
}

function ExamRow({
    exam,
    onValidate,
    onUploadSolution,
    onDelete,
    isValidating,
}: {
    exam: ExamItem;
    onValidate: () => void;
    onUploadSolution: () => void;
    onDelete: () => void;
    isValidating: boolean;
}) {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white">{exam.name}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{exam.id.slice(0, 8)}…</p>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {exam.course ? (
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{exam.course.code}</span>
                ) : (
                    <span className="text-gray-400">—</span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
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
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {TYPE_LABELS[exam.exam_type]}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                {exam.is_validated ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle size={11} />
                        Publié
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock size={11} />
                        En attente
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                {exam.solution_file_url ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <CheckCircle size={11} />
                        {exam.is_solution_paid ? 'Payant' : 'Gratuit'}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <XCircle size={11} />
                        Absent
                    </span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    {!exam.is_validated && (
                        <button
                            onClick={onValidate}
                            disabled={isValidating}
                            title="Valider et publier"
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50"
                        >
                            Valider
                        </button>
                    )}
                    <button
                        onClick={onUploadSolution}
                        title={exam.solution_file_url ? 'Remplacer le corrigé' : 'Uploader le corrigé'}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <Upload size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Supprimer"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
