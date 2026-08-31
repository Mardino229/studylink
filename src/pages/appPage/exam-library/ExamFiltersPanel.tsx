import { Search } from 'lucide-react';
import CourseCombobox from '../../../components/ui/CourseCombobox';
import type { ExamSession, ExamType } from '../../../types/exams';
import { useTranslation } from 'react-i18next';

const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const selectCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

export default function ExamFiltersPanel({
    courseId, setCourseId,
    academicYear, setAcademicYear,
    session, setSession,
    examType, setExamType,
    typeNumber, setTypeNumber,
    section, setSection,
    language, setLanguage,
    hasActiveFilters, onSearch, onReset,
}: {
    courseId: string; setCourseId: (v: string) => void;
    academicYear: string; setAcademicYear: (v: string) => void;
    session: ExamSession | ''; setSession: (v: ExamSession | '') => void;
    examType: ExamType | ''; setExamType: (v: ExamType | '') => void;
    typeNumber: string; setTypeNumber: (v: string) => void;
    section: string; setSection: (v: string) => void;
    language: 'fr' | 'en' | ''; setLanguage: (v: 'fr' | 'en' | '') => void;
    hasActiveFilters: boolean; onSearch: () => void; onReset: () => void;
}) {
    const { t } = useTranslation('exams'); 
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/80">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                    <CourseCombobox value={courseId} onChange={setCourseId} />
                </div>
                <input
                    type="number"
                    placeholder="Année (ex: 2024)"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className={inputCls}
                />
                <select value={session} onChange={(e) => setSession(e.target.value as ExamSession | '')} className={selectCls}>
                    <option value="">Toutes les sessions</option>
                    <option value="fall">Automne</option>
                    <option value="winter">Hiver</option>
                    <option value="summer">Printemps/Été</option>
                </select>
                <select value={examType} onChange={(e) => setExamType(e.target.value as ExamType | '')} className={selectCls}>
                    <option value="">Tous les types</option>
                    <option value="Mi-session">Mi-session</option>
                    <option value="Final">Final</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Devoir">Devoir</option>
                    <option value="Pratique">Pratique</option>
                    <option value="DGD">DGD</option>
                    <option value="Autre">Autre</option>
                </select>
                <input
                    type="number"
                    placeholder="N° (ex: 1)"
                    value={typeNumber}
                    onChange={(e) => setTypeNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className={inputCls}
                    min={1}
                    max={20}
                />
                <input
                    placeholder="Section (ex: A)"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className={inputCls}
                />
                <select value={language} onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | '')} className={selectCls}>
                    <option value="">Toutes les langues</option>
                    <option value="fr">{t('submit_modal.language_french')}</option>
                    <option value="en">{t('submit_modal.language_english')}</option>
                </select>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="h-10 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 sm:w-auto"
                    >
                        Réinitialiser
                    </button>
                )}
                <button
                    onClick={onSearch}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                >
                    <Search size={15} />Rechercher
                </button>
            </div>
        </div>
    );
}
