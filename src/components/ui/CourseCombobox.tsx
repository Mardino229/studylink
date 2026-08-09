import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetCourses } from '../../utils/exam';
import { courseCode, courseName } from '../../types/exams';
import type { Course } from '../../types/exams';

function label(c: Course, lang: string) {
    const code = courseCode(c, lang);
    const name = courseName(c, lang);
    return { code, name };
}

export default function CourseCombobox({
    value,
    onChange,
    placeholder = 'Tous les cours',
    compact = false,
    facultyId,
}: {
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    compact?: boolean;
    facultyId?: string;
}) {
    const { i18n } = useTranslation();
    const lang = i18n.language ?? 'fr';

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        if (!value) setSelectedCourse(null);
    }, [value]);

    const { data: courses = [], isFetching } = useGetCourses(
        { search: debouncedQuery || undefined, faculty_id: facultyId, limit: 20 },
        { enabled: open },
    );

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const select = (c: Course) => { onChange(c.id); setSelectedCourse(c); setOpen(false); setQuery(''); };
    const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setSelectedCourse(null); setQuery(''); setOpen(false); };

    const displayText = selectedCourse
        ? (() => { const { code, name } = label(selectedCourse, lang); return `${code}  ${name}`; })()
        : null;

    const dropdownContent = (size: 'sm' | 'md') => {
        const textCls = size === 'sm' ? 'text-xs' : 'text-sm';
        const padCls = size === 'sm' ? 'px-3 py-2' : 'px-3 py-2.5';
        if (isFetching) {
            return (
                <div className={`flex items-center gap-2 ${padCls} ${textCls} text-gray-400`}>
                    <Loader2 size={12} className="animate-spin" />Chargement…
                </div>
            );
        }
        if (!debouncedQuery) {
            return <p className={`${padCls} ${textCls} text-gray-400`}>Tapez pour rechercher un cours…</p>;
        }
        if (courses.length === 0) {
            return <p className={`${padCls} ${textCls} text-gray-400`}>Aucun résultat</p>;
        }
        return courses.map(c => {
            const { code, name: cname } = label(c, lang);
            return (
                <button
                    key={c.id}
                    onClick={() => select(c)}
                    className={`w-full ${padCls} text-left ${textCls} transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${value === c.id ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}
                >
                    <span className="font-mono text-blue-500 dark:text-blue-400">{code}</span>
                    {'  '}{cname}
                </button>
            );
        });
    };

    if (compact) {
        return (
            <div ref={containerRef} className="relative">
                <div
                    className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${open ? 'border-blue-500 bg-white dark:bg-gray-900' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
                    onClick={() => { setOpen(o => !o); if (!open) setQuery(''); }}
                >
                    {open ? (
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Rechercher un cours…"
                            className="w-36 bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                        />
                    ) : (
                        <span className={`w-36 truncate ${displayText ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {displayText ?? placeholder}
                        </span>
                    )}
                    {displayText && !open
                        ? <button onClick={clear} className="ml-auto shrink-0 text-gray-400 hover:text-gray-600"><X size={11} /></button>
                        : <ChevronDown size={11} className="ml-auto shrink-0 text-gray-400" />
                    }
                </div>
                {open && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                        <button onClick={() => select({ id: '', code_fr: '', name_fr: '' } as Course)} className="hidden" />
                        <button onClick={() => { onChange(''); setSelectedCourse(null); setOpen(false); }} className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{placeholder}</button>
                        {dropdownContent('sm')}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative h-10">
            <div
                className={`flex h-full cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm transition-colors ${open ? 'border-blue-500 bg-white dark:bg-gray-800' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                onClick={() => { setOpen(o => !o); if (!open) setQuery(''); }}
            >
                {open ? (
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Rechercher un cours…"
                        className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                    />
                ) : (
                    <span className={`flex-1 truncate ${displayText ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                        {displayText ?? placeholder}
                    </span>
                )}
                {displayText && !open
                    ? <button onClick={clear} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>
                    : <ChevronDown size={14} className="shrink-0 text-gray-400" />
                }
            </div>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[260px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button onClick={() => { onChange(''); setSelectedCourse(null); setOpen(false); }} className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{placeholder}</button>
                    {dropdownContent('md')}
                </div>
            )}
        </div>
    );
}
