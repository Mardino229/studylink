import { useState } from 'react';
import { Upload, FileWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/modal/index.tsx';
import CourseCombobox from '../../../components/ui/CourseCombobox';
import { useUploadExam } from '../../../utils/exam';
import type { ExamSession, ExamType } from '../../../types/exams';

const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const selectCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const fileCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white";

const EMPTY_FORM = {
    course_id: '', academic_year: '',
    session: '' as ExamSession | '', exam_type: '' as ExamType | '',
    type_number: '', section: '', is_solution_paid: true,
};

const needsTypeNumber = (exam_type: ExamType | '') =>
    !!exam_type && exam_type !== 'Final';

export default function SubmitExamModal({ isOpen, onClose }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation('exams');
    const uploadExam = useUploadExam();
    const [form, setForm] = useState(EMPTY_FORM);
    const [examFile, setExamFile] = useState<File | null>(null);
    const [solutionFile, setSolutionFile] = useState<File | null>(null);

    const reset = () => { setForm(EMPTY_FORM); setExamFile(null); setSolutionFile(null); };

    const isDisabled =
        (!examFile && !solutionFile) ||
        (needsTypeNumber(form.exam_type) && !form.type_number) ||
        uploadExam.isPending;

    const handleSubmit = () => {
        if (isDisabled) return;
        uploadExam.mutate(
            {
                exam_file: examFile ?? undefined,
                solution_file: solutionFile ?? undefined,
                course_id: form.course_id || undefined,
                academic_year: form.academic_year ? Number(form.academic_year) : undefined,
                session: (form.session || undefined) as ExamSession | undefined,
                exam_type: (form.exam_type || undefined) as ExamType | undefined,
                type_number: form.type_number ? Number(form.type_number) : undefined,
                section: form.section.trim() || undefined,
                is_solution_paid: form.is_solution_paid,
            },
            { onSuccess: () => { onClose(); reset(); } }
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('submit_modal.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('submit_modal.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CourseCombobox
                        value={form.course_id}
                        onChange={(id) => setForm(p => ({ ...p, course_id: id }))}
                        placeholder={t('submit_modal.course_placeholder')}
                    />
                    <input
                        type="number"
                        value={form.academic_year}
                        onChange={(e) => setForm(p => ({ ...p, academic_year: e.target.value }))}
                        placeholder={t('submit_modal.year_placeholder')}
                        className={inputCls}
                    />
                    <select value={form.session} onChange={(e) => setForm(p => ({ ...p, session: e.target.value as ExamSession | '' }))} className={selectCls}>
                        <option value="">{t('submit_modal.session_placeholder')}</option>
                        <option value="fall">{t('submit_modal.session_fall')}</option>
                        <option value="winter">{t('submit_modal.session_winter')}</option>
                        <option value="summer">{t('submit_modal.session_spring')}</option>
                    </select>
                    <select value={form.exam_type} onChange={(e) => setForm(p => ({ ...p, exam_type: e.target.value as ExamType | '', type_number: '' }))} className={selectCls}>
                        <option value="">{t('submit_modal.type_placeholder')}</option>
                        <option value="Mi-session">{t('submit_modal.type_mi_session')}</option>
                        <option value="Final">{t('submit_modal.type_final')}</option>
                        <option value="Quiz">{t('submit_modal.type_quiz')}</option>
                        <option value="Devoir">{t('submit_modal.type_devoir')}</option>
                        <option value="Pratique">{t('submit_modal.type_pratique')}</option>
                        <option value="DGD">{t('submit_modal.type_dgd')}</option>
                        <option value="Autre">{t('submit_modal.type_other')}</option>
                    </select>
                    {needsTypeNumber(form.exam_type) && (
                        <input
                            type="number"
                            value={form.type_number}
                            onChange={(e) => setForm(p => ({ ...p, type_number: e.target.value }))}
                            placeholder={t('submit_modal.type_number_placeholder', { type: form.exam_type })}
                            min={1} max={20}
                            className={inputCls}
                        />
                    )}
                    <input
                        value={form.section}
                        onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))}
                        placeholder={t('submit_modal.section_placeholder')}
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('submit_modal.exam_file_label')}</label>
                    <input type="file" accept=".pdf" onChange={(e) => setExamFile(e.target.files?.[0] ?? null)} className={fileCls} />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('submit_modal.solution_file_label')}</label>
                    <input type="file" accept=".pdf" onChange={(e) => setSolutionFile(e.target.files?.[0] ?? null)} className={fileCls} />
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/40 dark:bg-amber-900/10">
                    <FileWarning size={14} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                        {t('submit_modal.pdf_only_hint')}{' '}
                        <a
                            href="https://www.ilovepdf.com/jpg_to_pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
                        >
                            {t('submit_modal.pdf_only_link')}
                        </a>
                        .
                    </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('submit_modal.hint')}
                </p>

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">
                        {t('submit_modal.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isDisabled}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploadExam.isPending ? t('submit_modal.submitting') : t('submit_modal.submit_btn')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
