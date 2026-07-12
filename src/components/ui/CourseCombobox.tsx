import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Course } from '../../types/exams';

export default function CourseCombobox({
    value,
    onChange,
    courses,
    placeholder = 'Tous les cours',
    compact = false,
}: {
    value: string;
    onChange: (id: string) => void;
    courses: Course[];
    placeholder?: string;
    compact?: boolean;
}) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = courses.find(c => c.id === value) ?? null;

    const filtered = query.trim() === ''
        ? courses
        : courses.filter(c =>
            c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase())
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

    const select = (id: string) => { onChange(id); setOpen(false); setQuery(''); };
    const clear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false); };

    if (compact) {
        return (
            <div ref={containerRef} className="relative">
                <div
                    className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${open ? 'border-blue-500 bg-white dark:bg-gray-900' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
                    onClick={() => { setOpen(o => !o); setQuery(''); }}
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
                        <span className={`w-36 truncate ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {selected ? `${selected.code} — ${selected.name}` : placeholder}
                        </span>
                    )}
                    {selected && !open
                        ? <button onClick={clear} className="ml-auto shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={11} /></button>
                        : <ChevronDown size={11} className="ml-auto shrink-0 text-gray-400" />
                    }
                </div>
                {open && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
                        <button
                            onClick={() => select('')}
                            className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >{placeholder}</button>
                        {filtered.length === 0
                            ? <p className="px-3 py-2 text-xs text-gray-400">Aucun résultat</p>
                            : filtered.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => select(c.id)}
                                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${value === c.id ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}
                                >
                                    <span className="font-mono text-blue-500 dark:text-blue-400">{c.code}</span>
                                    {' — '}{c.name}
                                </button>
                            ))
                        }
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative h-10">
            <div
                className={`flex h-full cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm transition-colors ${open ? 'border-blue-500 bg-white dark:bg-gray-800' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                onClick={() => { setOpen(o => !o); setQuery(''); }}
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
                    <span className={`flex-1 truncate ${selected ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                        {selected ? `${selected.code} — ${selected.name}` : placeholder}
                    </span>
                )}
                {selected && !open
                    ? <button onClick={clear} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={14} /></button>
                    : <ChevronDown size={14} className="shrink-0 text-gray-400" />
                }
            </div>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[240px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button
                        onClick={() => select('')}
                        className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${!value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >{placeholder}</button>
                    {filtered.length === 0
                        ? <p className="px-3 py-2.5 text-sm text-gray-400">Aucun résultat</p>
                        : filtered.map(c => (
                            <button
                                key={c.id}
                                onClick={() => select(c.id)}
                                className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${value === c.id ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}
                            >
                                <span className="font-mono text-blue-500 dark:text-blue-400">{c.code}</span>
                                {' — '}{c.name}
                            </button>
                        ))
                    }
                </div>
            )}
        </div>
    );
}
