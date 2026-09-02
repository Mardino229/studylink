import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/modal/index.tsx';
import CourseCombobox from '../../../components/ui/CourseCombobox';
import { useUploadExam } from '../../../utils/exam';
import type { ExamSession, ExamType } from '../../../types/exams';

const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors";
const selectCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors";
const fileCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors";

const needsTypeNumber = (exam_type: ExamType | '' | undefined) =>
    !!exam_type && exam_type !== 'Final';
const EXAM_TYPES = ['Mi-session', 'Final', 'Quiz', 'Devoir', 'Pratique', 'DGD', 'Autre'] as const;

const examSubmitSchema = z.object({
    course_id: z.string().min(1, 'Course is required'),
    language: z.enum(['fr', 'en'], { message: 'Language is required' }),
    academic_year: z.string().optional(),
    session: z.enum(['fall', 'winter', 'summer', '']).optional(),
    exam_type: z.enum(EXAM_TYPES, { message: 'Exam type is required' }), 
    type_number: z.string().optional(),
    section: z.string().optional(),
    exam_file: z.instanceof(File).nullable().optional(),
    solution_file: z.instanceof(File).nullable().optional(),
}).refine(data => data.exam_file || data.solution_file, {
    message: 'You must submit at least one file (exam or solution).',
    path: ['exam_file'],
}).refine(data => {
    if (needsTypeNumber(data.exam_type as ExamType)) {
        return !!data.type_number && data.type_number.trim() !== '';
    }
    return true;
}, {
    message: 'Number is required for this exam type',
    path: ['type_number'],
});

type ExamSubmitFormData = z.infer<typeof examSubmitSchema>;

export default function SubmitExamModal({ isOpen, onClose }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation('exams');
    const uploadExam = useUploadExam();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ExamSubmitFormData>({
        resolver: zodResolver(examSubmitSchema),
        defaultValues: {
            course_id: '',
            academic_year: '',
            session: '',
            language: '' as any,
            exam_type: '' as any,
            type_number: '',
            section: '',
            exam_file: null,
            solution_file: null,
        },
    });

    const watchExamType = watch('exam_type') as ExamType | '' | undefined;

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = (data: ExamSubmitFormData) => {
        uploadExam.mutate(
            {
                exam_file: data.exam_file ?? undefined,
                solution_file: data.solution_file ?? undefined,
                course_id: data.course_id || undefined,
                academic_year: data.academic_year ? Number(data.academic_year) : undefined,
                session: (data.session || undefined) as ExamSession | undefined,
                exam_type: (data.exam_type || undefined) as ExamType | undefined,
                type_number: data.type_number ? Number(data.type_number) : undefined,
                language: data.language as 'fr' | 'en',
                section: data.section?.trim() || undefined,
                is_solution_paid: true,
            },
            {
                onSuccess: () => {
                    handleClose();
                },
            }
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('submit_modal.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('submit_modal.subtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Controller
                            name="course_id"
                            control={control}
                            render={({ field }) => (
                                <CourseCombobox
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('submit_modal.course_placeholder')}
                                />
                            )}
                        />
                        {errors.course_id && (
                            <p className="mt-1 text-xs text-red-500">{errors.course_id.message}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="number"
                            {...register('academic_year')}
                            placeholder={t('submit_modal.year_placeholder')}
                            className={`${inputCls} ${errors.academic_year ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {errors.academic_year && (
                            <p className="mt-1 text-xs text-red-500">{errors.academic_year.message}</p>
                        )}
                    </div>

                    <div>
                        <select
                            {...register('session')}
                            className={`${selectCls} ${errors.session ? 'border-red-500 focus:border-red-500' : ''}`}
                        >
                            <option value="">{t('submit_modal.session_placeholder')}</option>
                            <option value="fall">{t('submit_modal.session_fall')}</option>
                            <option value="winter">{t('submit_modal.session_winter')}</option>
                            <option value="summer">{t('submit_modal.session_spring')}</option>
                        </select>
                        {errors.session && (
                            <p className="mt-1 text-xs text-red-500">{errors.session.message}</p>
                        )}
                    </div>

                    <div>
                        <select
                            {...register('language')}
                            className={`${selectCls} ${errors.language ? 'border-red-500 focus:border-red-500' : ''}`}
                        >
                            <option value="">{t('submit_modal.language_label')} *</option>
                            <option value="fr">{t('submit_modal.language_french')}</option>
                            <option value="en">{t('submit_modal.language_english')}</option>
                        </select>
                        {errors.language && (
                            <p className="mt-1 text-xs text-red-500">{errors.language.message}</p>
                        )}
                    </div>

                    <div>
                        <select
                            {...register('exam_type', {
                                onChange: () => setValue('type_number', ''),
                            })}
                            className={`${selectCls} ${errors.exam_type ? 'border-red-500 focus:border-red-500' : ''}`}
                        >
                            <option value="">{t('submit_modal.type_placeholder')} *</option>
                            <option value="Mi-session">{t('submit_modal.type_mi_session')}</option>
                            <option value="Final">{t('submit_modal.type_final')}</option>
                            <option value="Quiz">{t('submit_modal.type_quiz')}</option>
                            <option value="Devoir">{t('submit_modal.type_devoir')}</option>
                            <option value="Pratique">{t('submit_modal.type_pratique')}</option>
                            <option value="DGD">{t('submit_modal.type_dgd')}</option>
                            <option value="Autre">{t('submit_modal.type_other')}</option>
                        </select>
                        {errors.exam_type && (
                            <p className="mt-1 text-xs text-red-500">{errors.exam_type.message}</p>
                        )}
                    </div>

                    {needsTypeNumber(watchExamType) && (
                        <div>
                            <input
                                type="number"
                                {...register('type_number')}
                                placeholder={t('submit_modal.type_number_placeholder', { type: watchExamType })}
                                min={1}
                                max={20}
                                className={`${inputCls} ${errors.type_number ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.type_number && (
                                <p className="mt-1 text-xs text-red-500">{errors.type_number.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <input
                            {...register('section')}
                            placeholder={t('submit_modal.section_placeholder')}
                            className={`${inputCls} ${errors.section ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {errors.section && (
                            <p className="mt-1 text-xs text-red-500">{errors.section.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('submit_modal.exam_file_label')}
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setValue('exam_file', file, { shouldValidate: true });
                        }}
                        className={`${fileCls} ${errors.exam_file ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('submit_modal.solution_file_label')}
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setValue('solution_file', file, { shouldValidate: true });
                        }}
                        className={`${fileCls} ${errors.solution_file ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                </div>

                {errors.exam_file && (
                    <p className="text-xs text-red-500">{errors.exam_file.message}</p>
                )}

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
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        {t('submit_modal.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={uploadExam.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploadExam.isPending ? t('submit_modal.submitting') : t('submit_modal.submit_btn')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
