import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Trash2, Clock, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '../../../icons/index.ts';
import MindmapRenderer from '../MindmapRenderer';
import type { ArtefactMindmap, PaginatedResponse } from '../../../types/workspace';

interface MindmapTabProps {
    mindmaps?: PaginatedResponse<ArtefactMindmap>;
    isLoadingMindmaps: boolean;
    isGenerating: boolean;
    openGenerationModal: (type: 'mindmap') => void;
    handleDelete: (message: string, onDelete: () => Promise<unknown>) => void;
    deleteMindmap: { mutateAsync: (args: { notebookId: string; mindmapId: string }) => Promise<unknown> };
    notebookId: string;
    formatDate: (date?: string) => string;
    pendingSelectId?: string | null;
}

export const MindmapTab: React.FC<MindmapTabProps> = ({
    mindmaps,
    isLoadingMindmaps,
    isGenerating,
    openGenerationModal,
    handleDelete,
    deleteMindmap,
    notebookId,
    formatDate,
    pendingSelectId,
}) => {
    const { t } = useTranslation('workspace');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

    const list = mindmaps?.items ?? [];
    const selected = list.find(m => m.id === selectedId) ?? list[0] ?? null;

    useEffect(() => {
        if (pendingSelectId) setSelectedId(pendingSelectId);
    }, [pendingSelectId]);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <GitBranch size={16} className="text-brand-500" />
                    {t('tabs.mindmaps.history_title')}
                </h4>
                <button
                    onClick={() => openGenerationModal('mindmap')}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-600 disabled:opacity-50"
                >
                    <PlusIcon size={12} />
                    {t('tabs.mindmaps.create_short')}
                </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {list.map(m => {
                    const isActive = selected?.id === m.id;
                    return (
                        <div
                            key={m.id}
                            className={`group relative rounded-xl border p-3 transition-all ${
                                isActive
                                    ? 'border-brand-500/30 bg-brand-50/50 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10'
                                    : 'border-border bg-background hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                onClick={() => { setSelectedId(m.id); setSidebarOpen(false); }}
                                className="w-full pr-8 text-left"
                            >
                                <p className="truncate text-sm font-semibold text-foreground">{m.title || t('tabs.mindmaps.default_title')}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-foreground/50">
                                    <Clock size={12} />
                                    <span>{formatDate(m.created_at)}</span>
                                </div>
                            </button>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDelete(t('tabs.mindmaps.confirm_delete'), async () => {
                                        await deleteMindmap.mutateAsync({ notebookId, mindmapId: m.id });
                                        if (selectedId === m.id) setSelectedId(null);
                                    });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-950/20"
                                title={t('tabs.mindmaps.delete_title')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
                {list.length === 0 && !isLoadingMindmaps && (
                    <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        {t('tabs.mindmaps.no_mindmaps')}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full">
            <div className="relative flex h-full w-full gap-4 overflow-hidden p-1 sm:p-4">
                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <div className="fixed top-16 inset-0 z-50 xl:hidden">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 top-0 z-10 flex w-[280px] flex-col p-4"
                            >
                                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                                    <SidebarContent />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Desktop sidebar */}
                <AnimatePresence initial={false}>
                    {desktopSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="hidden shrink-0 overflow-hidden rounded-2xl border-t border-r border-border bg-card xl:flex xl:flex-col"
                        >
                            <SidebarContent />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl px-2">
                    {/* Toolbar */}
                    <div className="flex shrink-0 items-center justify-between px-2 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDesktopSidebarOpen(v => !v)}
                                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground/70 transition-all hover:bg-foreground/5 xl:inline-flex"
                                title={desktopSidebarOpen ? t('tabs.mindmaps.close_history') : t('tabs.mindmaps.open_history')}
                            >
                                <svg className={`h-4 w-4 transition-transform ${desktopSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground/70 transition-all hover:bg-foreground/5 xl:hidden"
                            >
                                <Menu size={18} />
                            </button>
                            <h3 className="max-w-[200px] truncate text-sm font-bold text-foreground sm:max-w-xs">
                                {selected?.title || t('tabs.mindmaps.detail_default')}
                            </h3>
                        </div>
                        {selected && (
                            <button
                                onClick={() => handleDelete(t('tabs.mindmaps.confirm_delete'), async () => {
                                    await deleteMindmap.mutateAsync({ notebookId, mindmapId: selected.id });
                                    setSelectedId(null);
                                })}
                                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-100 hover:text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40"
                            >
                                <Trash2 size={12} />
                                <span className="hidden sm:block">{t('tabs.mindmaps.delete_btn')}</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden p-2">
                        {selected ? (
                            <MindmapRenderer root={selected.root} />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-500 dark:border-brand-900/50 dark:bg-brand-950/30">
                                    <GitBranch size={28} />
                                </div>
                                <h4 className="text-base font-bold text-foreground">{t('tabs.mindmaps.empty')}</h4>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('tabs.mindmaps.empty_hint')}</p>
                                <button
                                    onClick={() => openGenerationModal('mindmap')}
                                    disabled={isGenerating}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600"
                                >
                                    <PlusIcon size={16} />
                                    {t('tabs.mindmaps.create_btn')}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MindmapTab;

