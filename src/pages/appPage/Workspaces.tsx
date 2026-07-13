import React, { useState, useEffect } from 'react';
import { 
    useGetFolders, 
    useGetNotebooks, 
    useCreateFolder, 
    useCreateNotebook,
    useGetUnassignedNotebooks,
    useGetFolderNotebooks,
    useUpdateNotebook,
    useDeleteFolder,
    useDeleteNotebook
} from '../../utils/workspace';
import { 
    FolderIcon, 
    BookIcon, 
    PlusIcon, 
    ChevronRightIcon,
    FolderTreeIcon,
    LayoutGridIcon,
    ArrowLeftIcon,
    FolderInputIcon,
    Trash2Icon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from '../../components/common/ComponentCard.tsx';

// --- Move Notebook Modal Component ---
interface MoveNotebookModalProps {
    isOpen: boolean;
    onClose: () => void;
    notebook: { id: string; name: string; folder_id: string | null } | null;
    folders: any[];
    onMove: (folderId: string | null) => Promise<void>;
}

const MoveNotebookModal: React.FC<MoveNotebookModalProps> = ({
    isOpen,
    onClose,
    notebook,
    folders,
    onMove
}) => {
    if (!isOpen || !notebook) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-scaleUp">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Classer dans un dossier
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Sélectionnez le dossier de destination pour : <strong className="text-gray-800 dark:text-gray-200">"{notebook.name}"</strong>
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {/* Option: ROOT / No folder */}
                    <button
                        onClick={async () => {
                            await onMove(null);
                            onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                            notebook.folder_id === null
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 font-medium'
                                : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <BookIcon size={18} />
                            Racine (Aucun dossier)
                        </span>
                        {notebook.folder_id === null && (
                            <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full font-medium">Actuel</span>
                        )}
                    </button>

                    {/* Folders list */}
                    {folders.map((folder) => {
                        const isCurrent = notebook.folder_id === folder.id;
                        return (
                            <button
                                key={folder.id}
                                onClick={async () => {
                                    await onMove(folder.id);
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                                    isCurrent
                                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-500 font-medium'
                                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <span className="flex items-center gap-2 truncate pr-2">
                                    <FolderIcon size={18} className="text-yellow-500" fill="currentColor" />
                                    <span className="truncate">{folder.name}</span>
                                </span>
                                {isCurrent && (
                                    <span className="text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full font-medium">Actuel</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Custom Delete Confirmation Modal Component ---
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    onConfirm
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-scaleUp">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl">
                        <Trash2Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    {description}
                </p>

                <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="py-2.5 px-5 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={async () => {
                            setIsSubmitting(true);
                            try {
                                await onConfirm();
                            } finally {
                                setIsSubmitting(false);
                                onClose();
                            }
                        }}
                        disabled={isSubmitting}
                        className="py-2.5 px-5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 rounded-2xl shadow-sm hover:shadow transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Workspaces Component ---
const Workspaces: React.FC = () => {
    const [viewMode, setViewMode] = useState<'folders' | 'simple'>('simple');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    // Notebook organization modal states
    const [selectedNotebookToMove, setSelectedNotebookToMove] = useState<{ id: string; name: string; folder_id: string | null } | null>(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    // Custom deletion modal states
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'folder' | 'notebook' } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { data: folders, isLoading: isLoadingFolders, refetch: refetchFolders } = useGetFolders({ perPage: 100 });
    const { data: allNotebooks, isLoading: isLoadingAllNotebooks, refetch: refetchAllNotebooks } = useGetNotebooks(undefined, { perPage: 100 });
    const { data: unassignedNotebooks, isLoading: isLoadingUnassignedNotebooks, refetch: refetchUnassignedNotebooks } = useGetUnassignedNotebooks({ perPage: 100 });
    const { data: folderNotebooks, isLoading: isLoadingFolderNotebooks, refetch: refetchFolderNotebooks } = useGetFolderNotebooks(selectedFolderId, { perPage: 100 });

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newNotebookName, setNewNotebookName] = useState('');
    
    const createFolderMutation = useCreateFolder();
    const createNotebookMutation = useCreateNotebook();
    const updateNotebookMutation = useUpdateNotebook();
    const deleteFolderMutation = useDeleteFolder();
    const deleteNotebookMutation = useDeleteNotebook();

    const activeFolder = folders?.items?.find(f => f.id === selectedFolderId);
    const activeFolderName = activeFolder?.name ?? 'Dossier';

    // Refetch folder-specific notebooks when folder selection changes
    useEffect(() => {
        if (selectedFolderId) {
            void refetchFolderNotebooks();
        }
    }, [selectedFolderId, refetchFolderNotebooks]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await createFolderMutation.mutateAsync({ name: newFolderName, description: '' });
        setNewFolderName('');
        setIsCreatingFolder(false);
        void refetchFolders();
    };

    const handleCreateNotebook = async () => {
        if (!newNotebookName.trim()) return;
        const targetFolderId = viewMode === 'folders' ? selectedFolderId : null;
        await createNotebookMutation.mutateAsync({ 
            name: newNotebookName, 
            description: '', 
            folder_id: targetFolderId 
        });
        setNewNotebookName('');
        setIsCreatingNotebook(false);
        
        // Refresh lists
        void refetchAllNotebooks();
        void refetchUnassignedNotebooks();
        if (targetFolderId) {
            void refetchFolderNotebooks();
        }
    };

    const handleMoveNotebook = async (folderId: string | null) => {
        if (!selectedNotebookToMove) return;
        await updateNotebookMutation.mutateAsync({
            id: selectedNotebookToMove.id,
            data: { folder_id: folderId }
        });
        
        // Refresh list queries
        void refetchAllNotebooks();
        void refetchUnassignedNotebooks();
        void refetchFolderNotebooks();
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === 'folder') {
            await deleteFolderMutation.mutateAsync(deleteTarget.id);
            void refetchFolders();
            void refetchUnassignedNotebooks();
        } else {
            await deleteNotebookMutation.mutateAsync(deleteTarget.id);
            void refetchAllNotebooks();
            void refetchUnassignedNotebooks();
            void refetchFolderNotebooks();
        }
    };

    return (
        <>
            <PageMeta title="Workspaces" description="Gérez vos espaces de travail interactifs" />
            <PageBreadcrumb pageTitle="Workspaces" />
            <div className="relative overflow-hidden dark:bg-background min-h-dvh rounded-none">
                <div className="p-2 sm:p-6 space-y-6">
                    
                    {/* View Switcher Segmented Control */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/[0.04] p-1 rounded-xl">
                            <button
                                    onClick={() => setViewMode('simple')}
                                    className={`flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                                        viewMode === 'simple'
                                            ? 'bg-white dark:bg-gray-800 text-brand-500 shadow-xs'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <LayoutGridIcon size={16} />
                                    Simple (Tous)
                            </button>
                            <button
                                onClick={() => { setViewMode('folders'); setSelectedFolderId(null); }}
                                className={`flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                                    viewMode === 'folders'
                                        ? 'bg-white dark:bg-gray-800 text-brand-500 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <FolderTreeIcon size={16} />
                                Par Dossier
                            </button>
                        </div>
                    </div>

                    {/* Mode: Folders */}
                    {viewMode === 'folders' && (
                        <>
                            {selectedFolderId === null ? (
                                /* Main Folders Screen */
                                <div className="space-y-8 animate-fadeIn">
                                    {/* Dossiers Section */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dossiers</h3>
                                            <button 
                                                onClick={() => setIsCreatingFolder(true)}
                                                className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                                            >
                                                <PlusIcon size={18} /> Nouveau Dossier
                                            </button>
                                        </div>

                                        <ComponentCard title="Vos Dossiers">
                                            {isCreatingFolder && (
                                                <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                                                    <input 
                                                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                                        placeholder="Nom du dossier..."
                                                        value={newFolderName}
                                                        onChange={(e) => setNewFolderName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleCreateFolder} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none transition-colors">Créer</button>
                                                        <button onClick={() => setIsCreatingFolder(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                                                {folders?.items?.map(folder => (
                                                    <div 
                                                        key={folder.id} 
                                                        onClick={() => setSelectedFolderId(folder.id)}
                                                        className="group rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer animate-fadeIn"
                                                    >
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="dark:bg-gray-800 group-hover:scale-110 transition-transform">
                                                                <FolderIcon className="text-yellow-500" size={36} fill="currentColor" />
                                                            </div>
                                                            <div className="relative inline-block" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                <button 
                                                                    onClick={() => {
                                                                        setDeleteTarget({ id: folder.id, name: folder.name, type: 'folder' });
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                    className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                    title="Supprimer le dossier"
                                                                >
                                                                    <Trash2Icon size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90 truncate">{folder.name}</h4>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                                {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : 'Aujourd\'hui'}
                                                            </span>
                                                            <ChevronRightIcon className="text-gray-400 group-hover:text-brand-500 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                ))}
                                                {folders?.items?.length === 0 && !isLoadingFolders && (
                                                    <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                        Aucun dossier créé pour le moment.
                                                    </div>
                                                )}
                                                {isLoadingFolders && (
                                                    <div className="col-span-full py-8 text-center text-brand-500 text-sm animate-pulse">
                                                        Chargement des dossiers...
                                                    </div>
                                                )}
                                            </div>
                                        </ComponentCard>
                                    </div>

                                    {/* Notebooks Hors Dossier Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Notebooks sans dossier</h3>
                                            <button 
                                                onClick={() => setIsCreatingNotebook(true)}
                                                className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                                            >
                                                <PlusIcon size={18} /> Nouveau Notebook
                                            </button>
                                        </div>

                                        <ComponentCard title="Espaces de travail isolés">
                                            {isCreatingNotebook && (
                                                <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                                                    <input 
                                                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                                        placeholder="Nom du notebook..."
                                                        value={newNotebookName}
                                                        onChange={(e) => setNewNotebookName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleCreateNotebook} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none transition-colors">Créer</button>
                                                        <button onClick={() => setIsCreatingNotebook(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                                                {unassignedNotebooks?.items?.map(notebook => (
                                                    <div key={notebook.id} className="relative block group animate-fadeIn">
                                                        <Link to={`/workspaces/notebook/${notebook.id}`} className="block h-full">
                                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all h-full flex flex-col justify-between">
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                                        <BookIcon className="text-brand-500" size={28} />
                                                                    </div>
                                                                    <div className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setSelectedNotebookToMove({ id: notebook.id, name: notebook.name, folder_id: notebook.folder_id });
                                                                                setIsMoveModalOpen(true);
                                                                            }}
                                                                            className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Classer dans un dossier"
                                                                        >
                                                                            <FolderInputIcon size={18} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setDeleteTarget({ id: notebook.id, name: notebook.name, type: 'notebook' });
                                                                                setIsDeleteModalOpen(true);
                                                                            }}
                                                                            className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                            title="Supprimer le notebook"
                                                                        >
                                                                            <Trash2Icon size={18} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90 truncate">{notebook.name}</h4>
                                                                    <div className="flex items-center justify-between mt-4">
                                                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                                            Espace de travail
                                                                        </span>
                                                                        <ChevronRightIcon className="text-gray-400 group-hover:text-brand-500 transition-colors" size={16} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ))}
                                                {unassignedNotebooks?.items?.length === 0 && !isLoadingUnassignedNotebooks && (
                                                    <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                        Aucun notebook à la racine.
                                                    </div>
                                                )}
                                                {isLoadingUnassignedNotebooks && (
                                                    <div className="col-span-full py-8 text-center text-brand-500 text-sm animate-pulse">
                                                        Chargement des notebooks...
                                                    </div>
                                                )}
                                            </div>
                                        </ComponentCard>
                                    </div>
                                </div>
                            ) : (
                                /* Inside Selected Folder Screen */
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setSelectedFolderId(null)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-background text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
                                                title="Retour aux dossiers"
                                            >
                                                <ArrowLeftIcon size={18} />
                                            </button>
                                            <div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                    <span>Dossiers</span>
                                                    <ChevronRightIcon size={12} />
                                                    <span className="truncate max-w-[100px]">{activeFolderName}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 truncate flex items-center gap-2 mt-0.5">
                                                    <FolderIcon size={20} className="text-yellow-500" fill="currentColor" />
                                                    {activeFolderName}
                                                </h3>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setIsCreatingNotebook(true)}
                                            className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                                        >
                                            <PlusIcon size={18} /> Nouveau Notebook
                                        </button>
                                    </div>

                                    <ComponentCard title={`Espaces de travail dans : ${activeFolderName}`}>
                                        {isCreatingNotebook && (
                                            <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                                                <input 
                                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                                    placeholder="Nom du notebook..."
                                                    value={newNotebookName}
                                                    onChange={(e) => setNewNotebookName(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={handleCreateNotebook} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none transition-colors">Créer</button>
                                                    <button onClick={() => setIsCreatingNotebook(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                                            {folderNotebooks?.items?.map(notebook => (
                                                <div key={notebook.id} className="relative block group animate-fadeIn">
                                                    <Link to={`/workspaces/notebook/${notebook.id}`} className="block h-full">
                                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all h-full flex flex-col justify-between">
                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                                    <BookIcon className="text-brand-500" size={28} />
                                                                </div>
                                                                <div className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedNotebookToMove({ id: notebook.id, name: notebook.name, folder_id: notebook.folder_id });
                                                                            setIsMoveModalOpen(true);
                                                                        }}
                                                                        className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                        title="Déplacer dans un autre dossier"
                                                                    >
                                                                        <FolderInputIcon size={18} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setDeleteTarget({ id: notebook.id, name: notebook.name, type: 'notebook' });
                                                                            setIsDeleteModalOpen(true);
                                                                        }}
                                                                        className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                        title="Supprimer le notebook"
                                                                    >
                                                                        <Trash2Icon size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90 truncate">{notebook.name}</h4>
                                                                <div className="flex items-center justify-between mt-4">
                                                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                                        Espace de travail
                                                                    </span>
                                                                    <ChevronRightIcon className="text-gray-400 group-hover:text-brand-500 transition-colors" size={16} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                            {folderNotebooks?.items?.length === 0 && !isLoadingFolderNotebooks && (
                                                <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                    Aucun notebook dans ce dossier.
                                                </div>
                                            )}
                                            {isLoadingFolderNotebooks && (
                                                <div className="col-span-full py-8 text-center text-brand-500 text-sm animate-pulse">
                                                    Chargement des notebooks...
                                                </div>
                                            )}
                                        </div>
                                    </ComponentCard>
                                </div>
                            )}
                        </>
                    )}

                    {/* Mode: Simple */}
                    {viewMode === 'simple' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Tous vos Notebooks</h3>
                                <button 
                                    onClick={() => setIsCreatingNotebook(true)}
                                    className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                                >
                                    <PlusIcon size={18} /> Nouveau Notebook
                                </button>
                            </div>

                            <ComponentCard title="Liste complète des espaces de travail">
                                {isCreatingNotebook && (
                                    <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
                                        <input 
                                            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                            placeholder="Nom du notebook..."
                                            value={newNotebookName}
                                            onChange={(e) => setNewNotebookName(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={handleCreateNotebook} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none transition-colors">Créer</button>
                                            <button onClick={() => setIsCreatingNotebook(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                                    {allNotebooks?.items?.map(notebook => (
                                        <div key={notebook.id} className="relative block group animate-fadeIn">
                                            <Link to={`/workspaces/notebook/${notebook.id}`} className="block h-full">
                                                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all h-full flex flex-col justify-between">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                            <BookIcon className="text-brand-500" size={28} />
                                                        </div>
                                                        <div className="flex items-center gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedNotebookToMove({ id: notebook.id, name: notebook.name, folder_id: notebook.folder_id });
                                                                    setIsMoveModalOpen(true);
                                                                }}
                                                                className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                title="Classer dans un dossier"
                                                            >
                                                                <FolderInputIcon size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setDeleteTarget({ id: notebook.id, name: notebook.name, type: 'notebook' });
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                                className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                                                                title="Supprimer le notebook"
                                                            >
                                                                <Trash2Icon size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90 truncate">{notebook.name}</h4>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                                Espace de travail
                                                            </span>
                                                            <ChevronRightIcon className="text-gray-400 group-hover:text-brand-500 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                    {allNotebooks?.items?.length === 0 && !isLoadingAllNotebooks && (
                                        <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            Aucun notebook disponible.
                                        </div>
                                    )}
                                    {isLoadingAllNotebooks && (
                                        <div className="col-span-full py-8 text-center text-brand-500 text-sm animate-pulse">
                                            Chargement des notebooks...
                                        </div>
                                    )}
                                </div>
                            </ComponentCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Move Notebook Modal */}
            <MoveNotebookModal
                isOpen={isMoveModalOpen}
                onClose={() => {
                    setIsMoveModalOpen(false);
                    setSelectedNotebookToMove(null);
                }}
                notebook={selectedNotebookToMove}
                folders={folders?.items || []}
                onMove={handleMoveNotebook}
            />

            {/* Premium Custom Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTarget(null);
                }}
                title={deleteTarget?.type === 'folder' ? 'Supprimer le dossier' : 'Supprimer le notebook'}
                description={
                    deleteTarget?.type === 'folder' 
                        ? `Êtes-vous sûr de vouloir supprimer définitivement le dossier "${deleteTarget.name}" ? Les notebooks qu'il contient ne seront pas supprimés et retourneront automatiquement à la racine.`
                        : `Êtes-vous sûr de vouloir supprimer définitivement le notebook "${deleteTarget?.name}" ? Cette action est irréversible et détruira toutes les flashcards, résumés, quiz et podcasts associés.`
                }
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default Workspaces;
