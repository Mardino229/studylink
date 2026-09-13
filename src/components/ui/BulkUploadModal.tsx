import { useRef, useState, useCallback } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Upload, X, FileText, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { Modal } from './modal/index.tsx';
import CourseCombobox from './CourseCombobox';
import type { ExamSession, ExamType, ExamItem } from '../../types/exams';

// ─── Types ─────────────────────────────────────────────────

type Step = 'context' | 'files' | 'metadata';

type BulkContext = {
    course_id: string;
    academic_year: string;
    session: ExamSession | '';
};

type RowStatus = 'idle' | 'uploading' | 'success' | 'error';

type BulkRow = {
    id: string;
    examFile: File;
    solutionFile: File | null;
    language: 'fr' | 'en' | '';
    exam_type: ExamType | '';
    type_number: string;
    section: string;
    is_solution_paid: boolean;
    status: RowStatus;
    errorMsg?: string;
};

// ─── Helpers ───────────────────────────────────────────────

const SESSION_OPTIONS: { value: ExamSession; label: string }[] = [
    { value: 'fall', label: 'Automne' },
    { value: 'winter', label: 'Hiver' },
    { value: 'summer', label: 'Printemps / Été' },
];

const SESSION_LABELS: Record<ExamSession, string> = { fall: 'Automne', winter: 'Hiver', summer: 'Printemps/Été' };

const TYPE_OPTIONS: ExamType[] = ['Mi-session', 'Final', 'Quiz', 'Devoir', 'Pratique', 'DGD', 'Autre'];

function needsNumber(t: ExamType | ''): boolean {
    return !!t && t !== 'Final';
}

function isRowValid(row: BulkRow): boolean {
    if (!row.language) return false;
    if (!row.exam_type) return false;
    if (needsNumber(row.exam_type) && !row.type_number) return false;
    return true;
}

function truncate(name: string, max = 24): string {
    return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

// ─── Shared style strings ──────────────────────────────────

const inputCls =
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white';
const selectCls =
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white';

// Compact selects for table cells
const cellSelectCls =
    'w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white';
const cellInputCls =
    'w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white';

// ─── Main component ────────────────────────────────────────

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploadExam: { mutateAsync: (data: {
        exam_file?: File;
        solution_file?: File;
        course_id?: string;
        academic_year?: number;
        session?: string;
        exam_type?: string;
        type_number?: number;
        section?: string;
        is_solution_paid?: boolean;
        language: 'fr' | 'en' | '';
    }) => Promise<ExamItem> };
    validateExam: { mutateAsync: (examId: string) => Promise<ExamItem> };
}

export default function BulkUploadModal({ isOpen, onClose, uploadExam, validateExam }: BulkUploadModalProps) {
    const [step, setStep] = useState<Step>('context');

    // Step 1 — Context
    const [ctx, setCtx] = useState<BulkContext>({ course_id: '', academic_year: '', session: '' });

    // Step 2 — Files
    const [rows, setRows] = useState<BulkRow[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 3 — Global section
    const [globalSection, setGlobalSection] = useState('');

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);

    // ── Reset on close ───────────────────────────────────
    const handleClose = () => {
        if (isUploading) return;
        setStep('context');
        setCtx({ course_id: '', academic_year: '', session: '' });
        setRows([]);
        setGlobalSection('');
        setIsUploading(false);
        setUploadDone(false);
        onClose();
    };

    // ── Step 1 ───────────────────────────────────────────
    const ctxValid = !!ctx.course_id && !!ctx.academic_year && !!ctx.session;

    // ── Step 2 — file handling ────────────────────────────
    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files).filter(
            (f) => f.type === 'application/pdf' || f.type.startsWith('image/'),
        );
        setRows((prev) => [
            ...prev,
            ...arr.map((f) => ({
                id: crypto.randomUUID(),
                examFile: f,
                solutionFile: null,
                language: '' as const,
                exam_type: '' as const,
                type_number: '',
                section: '',
                is_solution_paid: true,
                status: 'idle' as const,
            })),
        ]);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };

    const removeFile = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

    // ── Step 3 — row update helpers ───────────────────────
    const updateRow = <K extends keyof BulkRow>(id: string, key: K, value: BulkRow[K]) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    };

    const setSolutionFile = (id: string, file: File | null) => updateRow(id, 'solutionFile', file);

    // Apply global section to all rows
    const applyGlobalSection = () => {
        if (!globalSection.trim()) return;
        setRows((prev) => prev.map((r) => ({ ...r, section: globalSection.trim() })));
    };

    // ── Validation ────────────────────────────────────────
    const invalidRows = rows.filter((r) => !isRowValid(r));
    const allValid = invalidRows.length === 0 && rows.length > 0;

    // ── Upload ────────────────────────────────────────────
    const handleUpload = async () => {
        if (!allValid || isUploading) return;
        setIsUploading(true);

        // Mark all rows as uploading
        setRows((prev) => prev.map((r) => ({ ...r, status: 'uploading' as const })));

        await Promise.allSettled(
            rows.map(async (row) => {
                try {
                    const exam = await uploadExam.mutateAsync({
                        exam_file: row.examFile,
                        solution_file: row.solutionFile ?? undefined,
                        course_id: ctx.course_id || undefined,
                        academic_year: ctx.academic_year ? Number(ctx.academic_year) : undefined,
                        session: ctx.session as ExamSession,
                        exam_type: row.exam_type as ExamType,
                        type_number: row.type_number ? Number(row.type_number) : undefined,
                        section: (row.section || globalSection).trim() || undefined,
                        language: row.language as 'fr' | 'en',
                        is_solution_paid: row.is_solution_paid,
                    });
                    // Auto-validate since admin is uploading
                    await validateExam.mutateAsync(exam.id);
                    setRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, status: 'success' as const } : r)),
                    );
                } catch (err: unknown) {
                    const msg =
                        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                        'Erreur lors de l\'upload';
                    setRows((prev) =>
                        prev.map((r) =>
                            r.id === row.id ? { ...r, status: 'error' as const, errorMsg: msg } : r,
                        ),
                    );
                }
            }),
        );

        setIsUploading(false);
        setUploadDone(true);
    };

    const successCount = rows.filter((r) => r.status === 'success').length;
    const errorCount = rows.filter((r) => r.status === 'error').length;

    // ── Render ────────────────────────────────────────────
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            showCloseButton={!isUploading}
            className="w-full max-w-5xl p-0 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <Upload size={18} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Import en masse d'épreuves</h2>
                {/* Step indicator */}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                    {(['context', 'files', 'metadata'] as Step[]).map((s, i) => (
                        <span key={s} className="flex items-center gap-1.5">
                            <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                                    step === s
                                        ? 'bg-blue-600 text-white'
                                        : s === 'context' && step !== 'context'
                                        ? 'bg-green-500 text-white'
                                        : s === 'files' && step === 'metadata'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                }`}
                            >
                                {(s === 'context' && step !== 'context') || (s === 'files' && step === 'metadata') ? (
                                    <CheckCircle size={12} />
                                ) : (
                                    i + 1
                                )}
                            </span>
                            <span className={step === s ? 'text-gray-700 dark:text-gray-200 font-medium' : ''}>
                                {s === 'context' ? 'Contexte' : s === 'files' ? 'Fichiers' : 'Métadonnées'}
                            </span>
                            {i < 2 && <ChevronRight size={12} />}
                        </span>
                    ))}
                </div>
            </div>

            <div className="px-6 py-5">
                {/* ── STEP 1 : CONTEXT ── */}
                {step === 'context' && (
                    <div className="mx-auto max-w-md space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ces informations s'appliqueront à toutes les épreuves du batch.
                        </p>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                Cours <span className="text-red-500">*</span>
                            </label>
                            <CourseCombobox
                                value={ctx.course_id}
                                onChange={(id) => setCtx((p) => ({ ...p, course_id: id }))}
                                placeholder="Sélectionner un cours"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Année <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={ctx.academic_year}
                                    onChange={(e) => setCtx((p) => ({ ...p, academic_year: e.target.value }))}
                                    placeholder="ex. 2025"
                                    min={2000}
                                    max={2100}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Session <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={ctx.session}
                                    onChange={(e) => setCtx((p) => ({ ...p, session: e.target.value as ExamSession | '' }))}
                                    className={selectCls}
                                >
                                    <option value="">Choisir…</option>
                                    {SESSION_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setStep('files')}
                                disabled={!ctxValid}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2 : FILES ── */}
                {step === 'files' && (
                    <div className="space-y-4">
                        {/* Context recap */}
                        <ContextBadge ctx={ctx} />

                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-colors ${
                                isDragging
                                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                                <Upload size={22} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Glissez vos épreuves ici
                                </p>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    ou cliquez pour sélectionner — PDF ou image, plusieurs fichiers acceptés
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.target.value = ''; } }}
                            />
                        </div>

                        {/* File list */}
                        {rows.length > 0 && (
                            <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/30">
                                <div className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    <span>{rows.length} fichier{rows.length > 1 ? 's' : ''} sélectionné{rows.length > 1 ? 's' : ''}</span>
                                    <button
                                        onClick={() => setRows([])}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        Tout retirer
                                    </button>
                                </div>
                                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                    {rows.map((row) => (
                                        <div
                                            key={row.id}
                                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300"
                                        >
                                            <FileText size={13} className="shrink-0 text-gray-400" />
                                            <span className="flex-1 truncate">{row.examFile.name}</span>
                                            <button
                                                onClick={() => removeFile(row.id)}
                                                className="shrink-0 text-gray-400 hover:text-red-500"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-2">
                            <button
                                onClick={() => setStep('context')}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                            >
                                <ChevronLeft size={16} /> Retour
                            </button>
                            <button
                                onClick={() => setStep('metadata')}
                                disabled={rows.length === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 3 : METADATA ── */}
                {step === 'metadata' && (
                    <div className="space-y-4">
                        {/* Context recap */}
                        <ContextBadge ctx={ctx} />

                        {/* Global section */}
                        <div className="flex items-center gap-3">
                            <label className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                                Section globale (optionnel) :
                            </label>
                            <input
                                value={globalSection}
                                onChange={(e) => setGlobalSection(e.target.value)}
                                placeholder="ex. A"
                                className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <button
                                onClick={applyGlobalSection}
                                disabled={!globalSection.trim()}
                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Appliquer à toutes
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                                    <tr>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Épreuve</th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Langue <span className="text-red-400">*</span>
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Type <span className="text-red-400">*</span>
                                        </th>
                                        <th className="w-20 px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">N°</th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Section</th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Corrigé</th>
                                        <th className="w-10 px-3 py-2.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {rows.map((row) => {
                                        const invalid = !isRowValid(row);
                                        const isUpl = row.status === 'uploading';
                                        const isOk = row.status === 'success';
                                        const isErr = row.status === 'error';

                                        return (
                                            <tr
                                                key={row.id}
                                                className={`transition-colors ${
                                                    isOk
                                                        ? 'bg-green-50 dark:bg-green-950/10'
                                                        : isErr
                                                        ? 'bg-red-50 dark:bg-red-950/10'
                                                        : invalid && !uploadDone
                                                        ? 'bg-amber-50/60 dark:bg-amber-950/10'
                                                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                {/* Épreuve */}
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-1.5">
                                                        {isUpl && <Loader2 size={12} className="animate-spin text-blue-500 shrink-0" />}
                                                        {isOk && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
                                                        {isErr && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                                                        {!isUpl && !isOk && !isErr && invalid && (
                                                            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                                        )}
                                                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                                            {truncate(row.examFile.name)}
                                                        </span>
                                                    </div>
                                                    {isErr && row.errorMsg && (
                                                        <p className="mt-0.5 text-[10px] text-red-500">{row.errorMsg}</p>
                                                    )}
                                                </td>

                                                {/* Langue */}
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={row.language}
                                                        onChange={(e) => updateRow(row.id, 'language', e.target.value as 'fr' | 'en' | '')}
                                                        disabled={isUpl || isOk}
                                                        className={`${cellSelectCls} ${!row.language && !isOk ? 'border-amber-300 dark:border-amber-700' : ''}`}
                                                    >
                                                        <option value="">—</option>
                                                        <option value="fr">FR</option>
                                                        <option value="en">EN</option>
                                                    </select>
                                                </td>

                                                {/* Type */}
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={row.exam_type}
                                                        onChange={(e) => updateRow(row.id, 'exam_type', e.target.value as ExamType | '')}
                                                        disabled={isUpl || isOk}
                                                        className={`${cellSelectCls} ${!row.exam_type && !isOk ? 'border-amber-300 dark:border-amber-700' : ''}`}
                                                    >
                                                        <option value="">—</option>
                                                        {TYPE_OPTIONS.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* N° */}
                                                <td className="px-3 py-2">
                                                    {needsNumber(row.exam_type) ? (
                                                        <input
                                                            type="number"
                                                            value={row.type_number}
                                                            onChange={(e) => updateRow(row.id, 'type_number', e.target.value)}
                                                            disabled={isUpl || isOk}
                                                            min={1}
                                                            max={20}
                                                            placeholder="N°"
                                                            className={`${cellInputCls} ${needsNumber(row.exam_type) && !row.type_number && !isOk ? 'border-amber-300 dark:border-amber-700' : ''}`}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                    )}
                                                </td>

                                                {/* Section */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        value={row.section}
                                                        onChange={(e) => updateRow(row.id, 'section', e.target.value)}
                                                        disabled={isUpl || isOk}
                                                        placeholder="opt."
                                                        className={cellInputCls}
                                                    />
                                                </td>

                                                {/* Corrigé */}
                                                <td className="px-3 py-2">
                                                    <SolutionCell
                                                        row={row}
                                                        disabled={isUpl || isOk}
                                                        onChange={(f) => setSolutionFile(row.id, f)}
                                                    />
                                                </td>

                                                {/* Delete */}
                                                <td className="px-3 py-2 text-center">
                                                    {!isUpl && !isOk && (
                                                        <button
                                                            onClick={() => removeFile(row.id)}
                                                            className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Validation summary */}
                        {!uploadDone && invalidRows.length > 0 && (
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                                <AlertTriangle size={14} />
                                {invalidRows.length} ligne{invalidRows.length > 1 ? 's' : ''} invalide{invalidRows.length > 1 ? 's' : ''} — langue et type obligatoires ; N° requis si type ≠ Final
                            </div>
                        )}

                        {/* Upload done summary */}
                        {uploadDone && (
                            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium ${
                                errorCount === 0
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            }`}>
                                <CheckCircle size={14} />
                                {successCount} épreuve{successCount > 1 ? 's' : ''} publiée{successCount > 1 ? 's' : ''}
                                {errorCount > 0 && ` · ${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
                            </div>
                        )}

                        {/* Footer buttons */}
                        <div className="flex justify-between pt-1">
                            {!uploadDone ? (
                                <>
                                    <button
                                        onClick={() => setStep('files')}
                                        disabled={isUploading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                                    >
                                        <ChevronLeft size={16} /> Retour
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!allValid || isUploading}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                                    >
                                        {isUploading ? (
                                            <><Loader2 size={15} className="animate-spin" /> Upload en cours…</>
                                        ) : (
                                            <><Upload size={15} /> Importer {rows.length} épreuve{rows.length > 1 ? 's' : ''}</>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                                >
                                    <CheckCircle size={15} /> Fermer
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ─── Sub-components ────────────────────────────────────────

function ContextBadge({ ctx }: { ctx: BulkContext }) {
    // We can't easily get the course name here without fetching, so we show what we have
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 dark:bg-blue-950/20">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Contexte :</span>
            {ctx.academic_year && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                    {ctx.academic_year}
                </span>
            )}
            {ctx.session && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                    {SESSION_LABELS[ctx.session as ExamSession]}
                </span>
            )}
        </div>
    );
}

function SolutionCell({
    row,
    disabled,
    onChange,
}: {
    row: BulkRow;
    disabled: boolean;
    onChange: (f: File | null) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);

    if (row.solutionFile) {
        return (
            <div className="flex items-center gap-1">
                <FileText size={11} className="shrink-0 text-gray-400" />
                <span className="max-w-[90px] truncate text-xs text-gray-600 dark:text-gray-400">
                    {row.solutionFile.name}
                </span>
                {!disabled && (
                    <button onClick={() => onChange(null)} className="shrink-0 text-gray-400 hover:text-red-500">
                        <X size={11} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => ref.current?.click()}
                disabled={disabled}
                className="rounded-lg border border-dashed border-gray-200 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500 disabled:opacity-40 dark:border-gray-700"
            >
                + Corrigé
            </button>
            <input
                ref={ref}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { onChange(f); e.target.value = ''; } }}
            />
        </>
    );
}
