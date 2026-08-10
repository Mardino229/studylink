import { useState } from 'react';
import { Upload } from 'lucide-react';
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
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Soumettre une épreuve ou un corrigé</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chaque fichier validé vous rapporte 0,5 coin.</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CourseCombobox
                        value={form.course_id}
                        onChange={(id) => setForm(p => ({ ...p, course_id: id }))}
                        placeholder="  Cours  "
                    />
                    <input
                        type="number"
                        value={form.academic_year}
                        onChange={(e) => setForm(p => ({ ...p, academic_year: e.target.value }))}
                        placeholder="Année"
                        className={inputCls}
                    />
                    <select value={form.session} onChange={(e) => setForm(p => ({ ...p, session: e.target.value as ExamSession | '' }))} className={selectCls}>
                        <option value="">  Session  </option>
                        <option value="fall">Automne</option>
                        <option value="winter">Hiver</option>
                        <option value="summer">Printemps/Été</option>
                    </select>
                    <select value={form.exam_type} onChange={(e) => setForm(p => ({ ...p, exam_type: e.target.value as ExamType | '', type_number: '' }))} className={selectCls}>
                        <option value="">  Type  </option>
                        <option value="Mi-session">Mi-session</option>
                        <option value="Final">Final</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Devoir">Devoir</option>
                        <option value="Pratique">Pratique</option>
                        <option value="DGD">DGD</option>
                        <option value="Autre">Autre</option>
                    </select>
                    {needsTypeNumber(form.exam_type) && (
                        <input
                            type="number"
                            value={form.type_number}
                            onChange={(e) => setForm(p => ({ ...p, type_number: e.target.value }))}
                            placeholder={`N° de ${form.exam_type} *`}
                            min={1} max={20}
                            className={inputCls}
                        />
                    )}
                    <input
                        value={form.section}
                        onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))}
                        placeholder="Section (ex: A) — optionnel"
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Fichier épreuve </label>
                    <input type="file" accept=".pdf,image/*" onChange={(e) => setExamFile(e.target.files?.[0] ?? null)} className={fileCls} />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Corrigé (+0,5 coin supplémentaire si validé)</label>
                    <input type="file" accept=".pdf,image/*" onChange={(e) => setSolutionFile(e.target.files?.[0] ?? null)} className={fileCls} />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vous devez soumettre une épreuve ou un corrigé, ou les deux à la fois.
                </p>

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isDisabled}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploadExam.isPending ? 'Envoi…' : 'Soumettre'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
