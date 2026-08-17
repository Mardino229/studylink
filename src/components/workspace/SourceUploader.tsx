import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadSource, useGetSources, useDeleteSource, useAddYoutubeSource } from '../../utils/workspace';
import { FileIcon, ImageIcon, UploadCloudIcon, CheckCircleIcon, LoaderIcon, Trash2, Link2, XCircleIcon } from 'lucide-react';

const YoutubeIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
    </svg>
);

import ConfirmModal from '../../components/ui/ConfirmModal';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { baseUrl } from '../../utils/api.ts';
import i18n from '../../i18n/index.ts';
import { useQueryClient } from '@tanstack/react-query';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const isImageType = (fileType: string) => IMAGE_EXTENSIONS.includes(fileType.toLowerCase());

const ACCEPTED_TYPES = '.pdf,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*';

interface StreamInfo {
    progress: number;
    message: string;
    status: string;
    filename: string;
}

interface SourceUploaderProps {
    notebookId: string;
}

function isValidYoutubeUrl(url: string): boolean {
    return /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//.test(url);
}

function extractYoutubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

const SourceUploader: React.FC<SourceUploaderProps> = ({ notebookId }) => {
    const { t } = useTranslation('workspace');
    const queryClient = useQueryClient();
    const { data: sources, refetch: refetchSources } = useGetSources(notebookId, { perPage: 100 });
    const uploadMutation = useUploadSource();
    const deleteMutation = useDeleteSource();
    const youtubeM = useAddYoutubeSource();

    const [mode, setMode] = useState<'file' | 'youtube'>('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [urlError, setUrlError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const [streamingSources, setStreamingSources] = useState<Record<string, StreamInfo>>({});

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

    const listenToSourceProgress = (sourceId: string, filename: string) => {
        setStreamingSources(prev => ({
            ...prev,
            [sourceId]: { progress: 0, message: t('sources.uploading'), status: 'pending', filename },
        }));

        void fetchEventSource(`${baseUrl}/notebooks/${notebookId}/sources/${sourceId}/stream`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'text/event-stream', 'Accept-Language': i18n.language.startsWith('fr') ? 'fr' : 'en' },
            onmessage(event) {
                if (!event.data) return;
                try {
                    const data = JSON.parse(event.data);
                    setStreamingSources(prev => ({
                        ...prev,
                        [sourceId]: {
                            progress: data.progress ?? prev[sourceId]?.progress ?? 0,
                            message: data.message ?? '',
                            status: data.status ?? 'processing',
                            filename: prev[sourceId]?.filename ?? filename,
                        },
                    }));
                    if (data.progress === 100 || data.status === 'completed') {
                        void refetchSources();
                        queryClient.invalidateQueries({ queryKey: ['themes', notebookId] });
                        setTimeout(() => {
                            setStreamingSources(prev => {
                                const next = { ...prev };
                                delete next[sourceId];
                                return next;
                            });
                        }, 800);
                    }
                    if (data.status === 'error') {
                        setTimeout(() => {
                            setStreamingSources(prev => {
                                const next = { ...prev };
                                delete next[sourceId];
                                return next;
                            });
                        }, 6000);
                    }
                } catch {
                    // ignore malformed payloads
                }
            },
            onerror(error) {
                console.error('SSE Error', error);
                setStreamingSources(prev => ({
                    ...prev,
                    [sourceId]: {
                        ...prev[sourceId],
                        status: 'error',
                        message: t('sources.stream_error'),
                        filename: prev[sourceId]?.filename ?? filename,
                    },
                }));
                throw error;
            },
        });
    };

    const handleFiles = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;
        try {
            const newSources = await uploadMutation.mutateAsync({ notebookId, files: fileArray });
            for (const source of newSources) {
                listenToSourceProgress(source.id, source.filename);
            }
        } catch (err) {
            console.error('Upload failed', err);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleYoutubeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUrlError('');
        if (!isValidYoutubeUrl(youtubeUrl)) {
            setUrlError(t('sources.url_invalid'));
            return;
        }
        try {
            const newSource = await youtubeM.mutateAsync({ notebookId, url: youtubeUrl.trim() });
            setYoutubeUrl('');
            listenToSourceProgress(newSource.id, newSource.filename);
        } catch {
            // error handled in hook
        }
    };

    const handleDeleteSource = (sourceId: string) => {
        setSourceToDelete(sourceId);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        setConfirmOpen(false);
        if (!sourceToDelete) return;
        try {
            await deleteMutation.mutateAsync({ notebookId, sourceId: sourceToDelete });
        } catch (err) {
            console.error('Delete source failed', err);
        } finally {
            setSourceToDelete(null);
        }
    };

    const dismissStreaming = (id: string) => {
        setStreamingSources(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const getUnsupportedMessage = (msg: string) =>
        /unsupported file type/i.test(msg) ? t('sources.unsupported_type') : msg;

    return (
        <div className="rounded-2xl bg-white dark:bg-transparent">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{t('sources.title')}</h3>
            </div>

            <div className="space-y-4 sm:p-6">
                {/* Mode switcher */}
                <div className="flex gap-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setMode('file')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                            mode === 'file'
                                ? 'bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        <UploadCloudIcon size={15} /> {t('sources.file_mode')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('youtube')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                            mode === 'youtube'
                                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        <YoutubeIcon size={15} /> YouTube
                    </button>
                </div>

                {mode === 'file' ? (
                    <label
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
                            isDragging
                                ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10'
                                : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.02]'
                        }`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <UploadCloudIcon className={`mb-2 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} size={32} />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {isDragging ? t('sources.drop_here') : t('sources.drag_to_import')}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                            {t('sources.file_types_hint')}
                        </span>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            accept={ACCEPTED_TYPES}
                            onChange={handleFileChange}
                        />
                    </label>
                ) : (
                    <form onSubmit={handleYoutubeSubmit} className="space-y-3">
                        <div className="rounded-2xl border-2 border-dashed border-red-200 p-2 dark:border-red-500/30">
                            <div className="mb-3 flex items-center gap-2">
                                <YoutubeIcon size={18} className="shrink-0 text-red-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('sources.youtube_link_label')}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                                <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-white/[0.03]">
                                    <Link2 size={14} className="shrink-0 text-gray-400" />
                                    <input
                                        type="url"
                                        value={youtubeUrl}
                                        onChange={e => {
                                            setYoutubeUrl(e.target.value);
                                            setUrlError('');
                                        }}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="flex-1 bg-transparent py-2.5 text-sm text-gray-800 outline-none placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={youtubeM.isPending || !youtubeUrl}
                                    className="flex shrink-0 items-center justify-center item-ends rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                                >
                                    {youtubeM.isPending ? <LoaderIcon size={15} className="animate-spin" /> : t('sources.add')}
                                </button>
                            </div>
                            {urlError && <p className="mt-2 text-xs text-red-500">{urlError}</p>}
                            <p className="mt-2 text-xs text-gray-400">{t('sources.youtube_hint')}</p>
                        </div>
                    </form>
                )}

                {/* Processing banners — one per file */}
                {Object.entries(streamingSources).map(([id, info]) => {
                    const isError = info.status === 'error';
                    if (info.progress === 100) return null;
                    return (
                        <div
                            key={id}
                            className={`rounded-2xl border p-4 ${
                                isError
                                    ? 'border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
                                    : 'border-sky-100 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10'
                            }`}
                        >
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className={`flex items-center gap-2 font-medium ${isError ? 'text-red-700 dark:text-red-300' : 'text-sky-800 dark:text-sky-200'}`}>
                                    {isError
                                        ? <XCircleIcon size={14} />
                                        : <LoaderIcon size={14} className="animate-spin" />
                                    }
                                    <span className="max-w-[180px] truncate">{info.filename}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    {!isError && (
                                        <span className={`font-bold ${isError ? 'text-red-600 dark:text-red-400' : 'text-sky-600 dark:text-sky-300'}`}>
                                            {info.progress}%
                                        </span>
                                    )}
                                    {isError && (
                                        <button
                                            type="button"
                                            onClick={() => dismissStreaming(id)}
                                            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
                                            aria-label={t('list.close')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            {!isError && (
                                <div className="mb-2 h-1.5 w-full rounded-full bg-sky-200 dark:bg-sky-500/20">
                                    <div
                                        className="h-1.5 rounded-full bg-sky-600 dark:bg-sky-300 transition-all duration-300"
                                        style={{ width: `${info.progress}%` }}
                                    />
                                </div>
                            )}
                            {/*<p className={`truncate text-xs ${isError ? 'text-red-600 dark:text-red-400' : 'text-sky-700 dark:text-sky-200'}`}>
                                {isError ? getUnsupportedMessage(info.message) : info.message}
                            </p>*/}
                        </div>
                    );
                })}

                {/* Source list */}
                <div className="space-y-3">
                    {sources?.items?.map(source => {
                        const isYoutube = source.file_type === 'youtube';
                        const isImage = isImageType(source.file_type);
                        const videoId = isYoutube ? extractYoutubeId(source.filename) : null;
                        return (
                            <div
                                key={source.id}
                                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                            >
                                {isYoutube ? (
                                    videoId ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                            alt=""
                                            className="h-10 w-14 shrink-0 rounded-lg object-cover bg-gray-200"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/10">
                                            <YoutubeIcon size={18} className="text-red-500" />
                                        </div>
                                    )
                                ) : isImage ? (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/10">
                                        <ImageIcon size={18} className="text-purple-500" />
                                    </div>
                                ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <FileIcon size={18} className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                                        {isYoutube
                                            ? source.filename.replace(/^https?:\/\/(www\.)?/, '')
                                            : source.filename}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isYoutube ? 'YouTube' : isImage ? 'Image' : source.file_type.toUpperCase()}
                                    </p>
                                </div>
                                <CheckCircleIcon className="shrink-0 text-green-500" size={18} />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSource(source.id)}
                                    disabled={deleteMutation.isPending}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                                    title={t('sources.delete_source')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                    {sources?.items?.length === 0 && Object.keys(streamingSources).length === 0 && (
                        <p className="py-4 text-center text-xs text-gray-400">
                            {t('sources.no_sources')}
                        </p>
                    )}
                </div>

                <ConfirmModal
                    isOpen={confirmOpen}
                    title={t('sources.delete_confirm_title')}
                    message={t('sources.delete_confirm_msg')}
                    confirmLabel={t('sources.delete_confirm_btn')}
                    cancelLabel={t('sources.cancel')}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </div>
    );
};

export default SourceUploader;
