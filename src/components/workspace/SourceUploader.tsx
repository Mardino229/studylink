import React, { useState } from 'react';
import { useUploadSource, useGetSources, useDeleteSource } from '../../utils/workspace';
import { FileIcon, UploadCloudIcon, CheckCircleIcon, LoaderIcon, Trash2 } from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { baseUrl } from '../../utils/api.ts';

interface SourceUploaderProps {
    notebookId: string;
}

const SourceUploader: React.FC<SourceUploaderProps> = ({ notebookId }) => {
    const { data: sources, refetch: refetchSources } = useGetSources(notebookId, { perPage: 100 });
    const uploadMutation = useUploadSource();
    const deleteMutation = useDeleteSource();
    
    // Track streaming sources
    const [streamingSources, setStreamingSources] = useState<{ [id: string]: { progress: number, message: string, status: string } }>({});
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                const newSource = await uploadMutation.mutateAsync({ notebookId, file });
                // Start listening to SSE
                listenToSourceProgress(newSource.id);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
    };

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

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
            console.error("Delete source failed", err);
        } finally {
            setSourceToDelete(null);
        }
    };

    const listenToSourceProgress = (sourceId: string) => {
        void fetchEventSource(`${baseUrl}/notebooks/${notebookId}/sources/${sourceId}/stream`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'text/event-stream',
            },
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
                    }
                } catch {
                    // Ignore malformed stream payloads.
                }
            },
            onerror(error) {
                console.error("SSE Error", error);
                throw error;
            },
        });
    };

    return (
        <div className="rounded-2xl bg-white">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Sources documentaires</h3>
            </div>
            
            <div className="space-y-4 p- sm:p-6">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.02]">
                    <UploadCloudIcon className="mb-2 text-gray-400" size={32} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cliquez pour uploader (PDF, TXT)</span>
                    <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                </label>

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
                                <div className="h-1.5 rounded-full bg-sky-600 dark:bg-sky-300" style={{ width: `${info.progress}%` }} />
                            </div>
                            <p className="truncate text-xs text-sky-700 dark:text-sky-200">{info.message}</p>
                        </div>
                    );
                })}

                <div className="space-y-3">
                    {sources?.items?.map(source => (
                        <div key={source.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                            <FileIcon className="text-gray-500 dark:text-gray-400" size={20} />
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{source.filename}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{source.file_type.toUpperCase()}</p>
                            </div>
                            <CheckCircleIcon className="text-green-500" size={18} />
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
                    ))}
                    {sources?.items?.length === 0 && Object.keys(streamingSources).length === 0 && (
                        <p className="py-4 text-center text-xs text-gray-400">Aucune source uploadée pour ce notebook.</p>
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
