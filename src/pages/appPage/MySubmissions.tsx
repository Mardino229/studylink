import React, { useState } from 'react';
import {
    AlertCircle, BookOpen, CheckCircle2, Clock,
    FileText, RefreshCw, Trash2, Upload, XCircle,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { Modal } from '../../components/ui/modal/index.tsx';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
    useGetMySubmissions, useResubmitExam, useDeleteMyExamSubmission,
    useGetMySolutionSubmissions, useResubmitSolution, useDeleteMySolutionSubmission,
    useGetMissingSolutions, useSubmitSolution,
} from '../../utils/exam';
import type { ExamItem, SolutionSubmission, SubmissionStatus } from '../../types/exams';

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
    validated: {
        label: 'Validée',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    pending: {
        label: 'En attente',
        icon: Clock,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
    const { label, icon: Icon, className } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
            <Icon size={11} />
            {label}
        </span>
    );
}

type Tab = 'exams' | 'solutions' | 'contribute';

export default function MySubmissions() {
    const [tab, setTab] = useState<Tab>('exams');

    const { data: myExams = [], isLoading: loadingExams } = useGetMySubmissions();
    const { data: mySolutions = [], isLoading: loadingSolutions } = useGetMySolutionSubmissions();
    const { data: missingSolutions = [], isLoading: loadingMissing } = useGetMissingSolutions();

    const resubmitExam = useResubmitExam();
    const resubmitSolution = useResubmitSolution();
    const submitSolution = useSubmitSolution();
    const deleteExamSubmission = useDeleteMyExamSubmission();
    const deleteSolSubmission = useDeleteMySolutionSubmission();

    // Resubmit exam modal
    const [resubmitExamId, setResubmitExamId] = useState<string | null>(null);
    const [newExamFile, setNewExamFile] = useState<File | null>(null);

    // Resubmit solution modal
    const [resubmitSolId, setResubmitSolId] = useState<string | null>(null);
    const [newSolFile, setNewSolFile] = useState<File | null>(null);

    // Delete confirms
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
    const [deleteSolId, setDeleteSolId] = useState<string | null>(null);

    // Submit solution for missing exam
    const [submitSolExamId, setSubmitSolExamId] = useState<string | null>(null);
    const [submitSolExamName, setSubmitSolExamName] = useState('');
    const [submitSolFile, setSubmitSolFile] = useState<File | null>(null);

    const TABS: { key: Tab; label: string; count?: number }[] = [
        { key: 'exams', label: 'Epreuves', count: myExams.length },
        { key: 'solutions', label: 'Corrigés', count: mySolutions.length },
        { key: 'contribute', label: 'Contribuer' },
    ];

    return (
        <>
            <PageMeta title="Mes soumissions" description="Suivre l'état de vos épreuves et corrigés soumis" />
            <PageBreadcrumb pageTitle="Mes soumissions" />

            {/* Coins info banner */}
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Gagnez des coins 🪙</span> — chaque épreuve ou corrigé validé par l'équipe vous rapporte <strong>0,5 coin</strong>.
                    Convertissez <strong>5 coins → 1 jeton</strong> depuis votre{' '}
                    <a href="/coins" className="underline underline-offset-2">wallet</a>.
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit dark:border-gray-800 dark:bg-gray-900">
                {TABS.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            tab === key
                                ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {label}
                        {count !== undefined && count > 0 && (
                            <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Mes épreuves ── */}
            {tab === 'exams' && (
                <SubmissionList
                    isLoading={loadingExams}
                    empty={{ icon: FileText, text: "Vous n'avez pas encore soumis d'épreuve." }}
                >
                    {myExams.map(exam => (
                        <ExamSubmissionCard
                            key={exam.id}
                            exam={exam}
                            onResubmit={() => setResubmitExamId(exam.id)}
                            onDelete={() => setDeleteExamId(exam.id)}
                        />
                    ))}
                </SubmissionList>
            )}

            {/* ── Mes corrigés ── */}
            {tab === 'solutions' && (
                <SubmissionList
                    isLoading={loadingSolutions}
                    empty={{ icon: Upload, text: "Vous n'avez pas encore soumis de corrigé." }}
                >
                    {mySolutions.map(sol => (
                        <SolutionSubmissionCard
                            key={sol.id}
                            submission={sol}
                            onResubmit={() => setResubmitSolId(sol.id)}
                            onDelete={() => setDeleteSolId(sol.id)}
                        />
                    ))}
                </SubmissionList>
            )}

            {/* ── Contribuer (épreuves sans corrigé) ── */}
            {tab === 'contribute' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ces épreuves n'ont pas encore de corrigé. Soumettez le vôtre pour gagner <strong>0,5 coin</strong> si il est validé.
                    </p>
                    <SubmissionList
                        isLoading={loadingMissing}
                        empty={{ icon: CheckCircle2, text: 'Toutes les épreuves ont déjà un corrigé — revenez plus tard !' }}
                    >
                        {missingSolutions.map(exam => (
                            <MissingSolutionCard
                                key={exam.id}
                                exam={exam}
                                onSubmit={() => {
                                    setSubmitSolExamId(exam.id);
                                    setSubmitSolExamName(exam.name);
                                }}
                            />
                        ))}
                    </SubmissionList>
                </div>
            )}

            {/* ── Modal : Re-submit exam ── */}
            <Modal isOpen={!!resubmitExamId} onClose={() => { setResubmitExamId(null); setNewExamFile(null); }} className="max-w-md p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Re-soumettre l'épreuve</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Vous pouvez uploader un nouveau fichier corrigé (optionnel si seules les métadonnées changent).
                </p>
                <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.ppt"
                    onChange={(e) => setNewExamFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        onClick={() => { setResubmitExamId(null); setNewExamFile(null); }}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            if (!resubmitExamId) return;
                            resubmitExam.mutate(
                                { examId: resubmitExamId, exam_file: newExamFile ?? undefined },
                                { onSuccess: () => { setResubmitExamId(null); setNewExamFile(null); } }
                            );
                        }}
                        disabled={resubmitExam.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={14} />
                        {resubmitExam.isPending ? 'Envoi…' : 'Re-soumettre'}
                    </button>
                </div>
            </Modal>

            {/* ── Modal : Re-submit solution ── */}
            <Modal isOpen={!!resubmitSolId} onClose={() => { setResubmitSolId(null); setNewSolFile(null); }} className="max-w-md p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Re-soumettre le corrigé</h3>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNewSolFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button onClick={() => { setResubmitSolId(null); setNewSolFile(null); }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            if (!resubmitSolId || !newSolFile) return;
                            resubmitSolution.mutate(
                                { submissionId: resubmitSolId, solution_file: newSolFile },
                                { onSuccess: () => { setResubmitSolId(null); setNewSolFile(null); } }
                            );
                        }}
                        disabled={!newSolFile || resubmitSolution.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={14} />
                        {resubmitSolution.isPending ? 'Envoi…' : 'Re-soumettre'}
                    </button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteExamId}
                title="Supprimer la soumission"
                message="Cette épreuve sera retirée définitivement. Cette action est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                onConfirm={() => {
                    if (!deleteExamId) return;
                    deleteExamSubmission.mutate(deleteExamId, { onSuccess: () => setDeleteExamId(null) });
                }}
                onCancel={() => setDeleteExamId(null)}
            />

            <ConfirmModal
                isOpen={!!deleteSolId}
                title="Supprimer la soumission"
                message="Ce corrigé sera retiré définitivement. Cette action est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                onConfirm={() => {
                    if (!deleteSolId) return;
                    deleteSolSubmission.mutate(deleteSolId, { onSuccess: () => setDeleteSolId(null) });
                }}
                onCancel={() => setDeleteSolId(null)}
            />

            {/* ── Modal : Submit solution for missing ── */}
            <Modal isOpen={!!submitSolExamId} onClose={() => { setSubmitSolExamId(null); setSubmitSolFile(null); }} className="max-w-md p-6">
                <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Soumettre un corrigé</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 truncate">{submitSolExamName}</p>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSubmitSolFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button onClick={() => { setSubmitSolExamId(null); setSubmitSolFile(null); }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                        Annuler
                    </button>
                    <button
                        onClick={() => {
                            if (!submitSolExamId || !submitSolFile) return;
                            submitSolution.mutate(
                                { examId: submitSolExamId, solution_file: submitSolFile },
                                { onSuccess: () => { setSubmitSolExamId(null); setSubmitSolFile(null); } }
                            );
                        }}
                        disabled={!submitSolFile || submitSolution.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Upload size={14} />
                        {submitSolution.isPending ? 'Envoi…' : 'Soumettre'}
                    </button>
                </div>
            </Modal>
        </>
    );
}

// ─── Sub-components ────────────────────────────────────────

function SubmissionList({ isLoading, empty, children }: {
    isLoading: boolean;
    empty: { icon: typeof FileText; text: string };
    children: React.ReactNode;
}) {
    const Empty = empty.icon;
    const items = React.Children.toArray(children);
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                ))}
            </div>
        );
    }
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <Empty size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{empty.text}</p>
            </div>
        );
    }
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function ExamSubmissionCard({ exam, onResubmit, onDelete }: { exam: ExamItem; onResubmit: () => void; onDelete: () => void }) {
    const canDelete = exam.submission_status === 'pending' || exam.submission_status === 'rejected';
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 lg:shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex items-start justify-between gap-2">
                <h3 className="flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">{exam.name}</h3>
                <StatusBadge status={exam.submission_status} />
            </div>
            {exam.academic_year && (
                <span className="self-start rounded-full w-auto block bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {exam.academic_year}
                </span>
            )}
            {exam.course && (
                <span className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {exam.course.name} ({exam.course.code})
                </span>
            )}
            {exam.submission_status === 'rejected' && exam.admin_note && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>{exam.admin_note}</span>
                </div>
            )}
            {canDelete && (
                <div className="mt-auto flex gap-2">
                    {exam.submission_status === 'rejected' && (
                        <button
                            onClick={onResubmit}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                            <RefreshCw size={12} />
                            Re-soumettre
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
                    >
                        <Trash2 size={12} />
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}

function SolutionSubmissionCard({ submission, onResubmit, onDelete }: { submission: SolutionSubmission; onResubmit: () => void; onDelete: () => void }) {
    const canDelete = submission.submission_status === 'pending' || submission.submission_status === 'rejected';
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 lg:shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Corrigé pour</p>
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">
                        {submission.exam?.name ?? 'Épreuve inconnue'}
                    </h3>
                </div>
                <StatusBadge status={submission.submission_status} />
            </div>
            {submission.exam?.academic_year && (
                <span className="self-start rounded-full w-auto block bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {submission.exam.academic_year}
                </span>
            )}
            {submission.exam?.course && (
                <span className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {submission.exam.course.name} ({submission.exam.course.code})
                </span>
            )}
            {submission.submission_status === 'rejected' && submission.admin_note && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>{submission.admin_note}</span>
                </div>
            )}
            {canDelete && (
                <div className="mt-auto flex gap-2">
                    {submission.submission_status === 'rejected' && (
                        <button
                            onClick={onResubmit}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                            <RefreshCw size={12} />
                            Re-soumettre
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
                    >
                        <Trash2 size={12} />
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}

function MissingSolutionCard({ exam, onSubmit }: { exam: ExamItem; onSubmit: () => void }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-5 lg:shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
            <div>
                <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">{exam.name}</h3>
            </div>
            {exam.academic_year && (
                <span className="self-start rounded-full w-auto block bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {exam.academic_year}
                </span>
            )}
            {exam.course && (
                <span className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {exam.course.name} ({exam.course.code})
                </span>
            )}
            <button
                onClick={onSubmit}
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
                <Upload size={12} />
                Soumettre un corrigé
            </button>
        </div>
    );
}
