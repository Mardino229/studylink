import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import {  Hash, Target } from 'lucide-react';
import type { Theme, PaginatedResponse } from '../../../types/workspace';

interface StatItem {
    label: string;
    value: number;
    hint: string;
    icon: LucideIcon;
}

interface OverviewTabProps {
    stats: StatItem[];
    themes?: PaginatedResponse<Theme>;
    isLoadingThemes: boolean;
}

// Palette de couleurs harmonieuses pour les badges thèmes
const themeColors = [
    { bg: 'bg-brand-50 dark:bg-brand-500/10', text: 'text-brand-600 dark:text-brand-400', border: 'border-brand-200/60 dark:border-brand-500/20', dot: 'bg-brand-500' },
    { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200/60 dark:border-violet-500/20', dot: 'bg-violet-500' },
    { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-500/20', dot: 'bg-amber-500' },
    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
    { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-500/20', dot: 'bg-rose-500' },
    { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200/60 dark:border-cyan-500/20', dot: 'bg-cyan-500' },
    { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-500/20', dot: 'bg-orange-500' },
    { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200/60 dark:border-indigo-500/20', dot: 'bg-indigo-500' },
];

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, themes, isLoadingThemes }) => {
    const { t } = useTranslation('workspace');
    const themesList = themes?.items ?? [];

    const getBadgeTone = (index: number) => (index % 4 === 2 ? 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500' : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500');

    return (

        <div className="p-4 sm:p-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`px-6 py-5 ${index % 2 === 0 ? 'border-b border-gray-200 xl:border-r dark:border-gray-800' : 'border-b border-gray-200 dark:border-gray-800'} ${index >= 2 ? 'sm:border-b-0' : ''} ${index === 3 ? 'xl:border-r-0 xl:border-b-0' : ''}`}
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                            <div className="mt-2 flex items-end gap-3">
                                <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">{stat.value}</h4>
                                <div>
                                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${getBadgeTone(index)}`}>
                                        <IconComponent className="h-3.5 w-3.5" />
                                        {stat.hint}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Themes Section */}
            <div>
                <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                        <Target size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">{t('tabs.overview.detected_themes')}</h3>
                        <p className="text-xs text-foreground/50">
                            {isLoadingThemes
                                ? t('tabs.overview.themes_loading')
                                : t('tabs.overview.themes_count', { count: themesList.length })
                            }
                        </p>
                    </div>
                </div>
                {isLoadingThemes ? (
                    <div className="flex flex-wrap gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-9 animate-pulse rounded-full bg-gray-100 dark:bg-white/[0.04]"
                                style={{ width: `${80 + Math.random() * 60}px` }}
                            />
                        ))}
                    </div>
                ) : themesList.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2.5">
                            {themesList.map((theme, index) => {
                                const color = themeColors[index % themeColors.length];
                                return (
                                    <div
                                        key={theme.id}
                                        className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all hover:shadow-sm ${color.bg} ${color.text} ${color.border}`}
                                        title={theme.description || theme.name}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                        <span className="truncate">{theme.name}</span>
                                    </div>
                                );
            })}
                        </div>
                        <p className="text-xs text-foreground/40 italic">
                            {t('tabs.overview.themes_lang_note')}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center dark:border-gray-800 dark:bg-white/[0.02]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/[0.04] dark:text-gray-500 mb-3">
                            <Hash size={22} />
                        </div>
                        <p className="text-sm font-medium text-foreground/70">{t('tabs.overview.no_themes')}</p>
                        <p className="mt-1 text-xs text-foreground/40 max-w-xs">
                            {t('tabs.overview.themes_auto_extract')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewTab;
