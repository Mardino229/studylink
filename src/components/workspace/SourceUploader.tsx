import React, { useState } from 'react';
import { useUploadSource, useGetSources, useDeleteSource, useAddYoutubeSource } from '../../utils/workspace';
import { FileIcon, UploadCloudIcon, CheckCircleIcon, LoaderIcon, Trash2, Link2 } from 'lucide-react';

const YoutubeIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
    </svg>
);
import ConfirmModal from '../../components/ui/ConfirmModal';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { baseUrl } from '../../utils/api.ts';
import { useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();
    const { data: sources, refetch: refetchSources } = useGetSources(notebookId, { perPage: 100 });
    const uploadMutation = useUploadSource();
    const deleteMutation = useDeleteSource();
    const youtubeM = useAddYoutubeSource();

    const [mode, setMode] = useState<'file' | 'youtube'>('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [urlError, setUrlError] = useState('');

    const [streamingSources, setStreamingSources] = useState<{ [id: string]: { progress: number; message: string; status: string } }>({});

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

    const listenToSourceProgress = (sourceId: string) => {
        void fetchEventSource(`${baseUrl}/notebooks/${notebookId}/sources/${sourceId}/stream`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'text/event-stream' },
            onmessage(event) {
                if (!event.data) return;
                try {
                    const data = JSON.parse(event.data);
                    setStreamingSources(prev => ({
                        ...prev,
                        [sourceId]: {
                            progress: data.progress ?? 0,
                            message: data.message ?? '',
                            status: data.status ?? 'processing',
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
                } catch {
                    // ignore malformed payloads
                }
            },
            onerror(error) {
                console.error('SSE Error', error);
                throw error;
            },
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                const newSource = await uploadMutation.mutateAsync({ notebookId, file });
                listenToSourceProgress(newSource.id);
            } catch (err) {
                console.error('Upload failed', err);
            }
        }
    };

    const handleYoutubeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUrlError('');
        if (!isValidYoutubeUrl(youtubeUrl)) {
            setUrlError('URL invalide. Utilisez un lien youtube.com ou youtu.be.');
            return;
        }
        try {
            const newSource = await youtubeM.mutateAsync({ notebookId, url: youtubeUrl.trim() });
            setYoutubeUrl('');
            listenToSourceProgress(newSource.id);
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

    return (
        <div className="rounded-2xl bg-white dark:bg-transparent">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Sources documentaires</h3>
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
                        <UploadCloudIcon size={15} /> Fichier
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
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-2 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.02]">
                        <UploadCloudIcon className="mb-2 text-gray-400" size={32} />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Cliquez pour importer (PDF, TXT, PPT, PPTX)
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.txt,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            onChange={handleFileChange}
                        />
                    </label>
                ) : (
                    <form onSubmit={handleYoutubeSubmit} className="space-y-3">
                        <div className="rounded-2xl border-2 border-dashed border-red-200 p-2 dark:border-red-500/30">
                            <div className="mb-3 flex items-center gap-2">
                                <YoutubeIcon size={18} className="shrink-0 text-red-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Lien vidéo YouTube
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
                                    {youtubeM.isPending ? <LoaderIcon size={15} className="animate-spin" /> : 'Ajouter'}
                                </button>
                            </div>
                            {urlError && <p className="mt-2 text-xs text-red-500">{urlError}</p>}
                            <p className="mt-2 text-xs text-gray-400">Vidéos publiques uniquement · ~1 h max</p>
                        </div>
                    </form>
                )}

                {/* Processing banners */}
                {Object.entries(streamingSources).map(([id, info]) => {
                    if (info.progress === 100) return null;
                    return (
                        <div key={id} className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 font-medium text-sky-800 dark:text-sky-200">
                                    <LoaderIcon size={14} className="animate-spin" />
                                    Traitement en cours...
                                </span>
                                <span className="font-bold text-sky-600 dark:text-sky-300">{info.progress}%</span>
                            </div>
                            <div className="mb-2 h-1.5 w-full rounded-full bg-sky-200 dark:bg-sky-500/20">
                                <div
                                    className="h-1.5 rounded-full bg-sky-600 dark:bg-sky-300"
                                    style={{ width: `${info.progress}%` }}
                                />
                            </div>
                            <p className="truncate text-xs text-sky-700 dark:text-sky-200">{info.message}</p>
                        </div>
                    );
                })}

                {/* Source list */}
                <div className="space-y-3">
                    {sources?.items?.map(source => {
                        const isYoutube = source.file_type === 'youtube';
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
                                ) : (
                                    <FileIcon className="shrink-0 text-gray-500 dark:text-gray-400" size={20} />
                                )}
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                                        {isYoutube
                                            ? source.filename.replace(/^https?:\/\/(www\.)?/, '')
                                            : source.filename}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isYoutube ? 'YouTube' : source.file_type.toUpperCase()}
                                    </p>
                                </div>
                                <CheckCircleIcon className="shrink-0 text-green-500" size={18} />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSource(source.id)}
                                    disabled={deleteMutation.isPending}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                                    title="Supprimer la source"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}
                    {sources?.items?.length === 0 && Object.keys(streamingSources).length === 0 && (
                        <p className="py-4 text-center text-xs text-gray-400">
                            Aucune source uploadée pour ce notebook.
                        </p>
                    )}
                </div>

                <ConfirmModal
                    isOpen={confirmOpen}
                    title="Supprimer la source"
                    message="Supprimer cette source et ses vecteurs ?"
                    confirmLabel="Supprimer"
                    cancelLabel="Annuler"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </div>
    );
};

export default SourceUploader;
