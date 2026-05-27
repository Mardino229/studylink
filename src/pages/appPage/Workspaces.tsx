import React, { useState } from 'react';
import { useGetFolders, useGetNotebooks, useCreateFolder, useCreateNotebook } from '../../utils/workspace';
import { FolderIcon, BookIcon, PlusIcon, MoreVerticalIcon, ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from '../../components/common/ComponentCard.tsx';

const Workspaces: React.FC = () => {
    const { data: folders, isLoading: isLoadingFolders } = useGetFolders({ perPage: 100 });
    const { data: notebooks, isLoading: isLoadingNotebooks } = useGetNotebooks(undefined, { perPage: 100 });

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newNotebookName, setNewNotebookName] = useState('');
    
    const createFolderMutation = useCreateFolder();
    const createNotebookMutation = useCreateNotebook();

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await createFolderMutation.mutateAsync({ name: newFolderName, description: '' });
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    const handleCreateNotebook = async () => {
        if (!newNotebookName.trim()) return;
        await createNotebookMutation.mutateAsync({ name: newNotebookName, description: '', folder_id: null });
        setNewNotebookName('');
        setIsCreatingNotebook(false);
    };

    return (
        <>
            <PageMeta title="Workspaces" description="Gérez vos espaces de travail interactifs" />
            <PageBreadcrumb pageTitle="Workspaces" />
            <div className="relative overflow-hidden dark:bg-background min-h-dvh rounded-none">
            <div className="p-2 sm:p-6 space-y-8">

            
            {/* Dossiers Section */}

            <div className="px-4 py-4 sm:pl-6 sm:pr-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dossiers</h3>
                    <button 
                        onClick={() => setIsCreatingFolder(true)}
                        className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                    >
                        <PlusIcon size={18} /> Nouveau Dossier
                    </button>
                </div>
            </div>
            <ComponentCard title="Liste des dossiers">
                <div className="border-gray-100 dark:border-gray-800">
                    {isCreatingFolder && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <input 
                                className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                placeholder="Nom du dossier..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={handleCreateFolder} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none dark:focus:ring-brand-800 transition-colors">Créer</button>
                                <button onClick={() => setIsCreatingFolder(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-brand-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                        {folders?.items?.map(folder => (
                            <div key={folder.id} className="group rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                                <div className="flex justify-between mb-6">
                                    <div className="dark:bg-gray-800 group-hover:scale-110 transition-transform">
                                        <FolderIcon className="text-yellow-500" size={36} fill="currentColor" />
                                    </div>
                                    <div className="relative inline-block">
                                        <button className="dropdown-toggle text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                            <MoreVerticalIcon size={20} />
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
                </div>
            </ComponentCard>



            {/* Notebooks Section */}
            <div className="">
                <div className="px-4 py-4 sm:pl-6 sm:pr-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Espaces de travail (Notebooks)</h3>
                        <button 
                            onClick={() => setIsCreatingNotebook(true)}
                            className="inline-flex justify-end items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                        >
                            <PlusIcon size={18} /> Nouveau Notebook
                        </button>
                    </div>
                </div>
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    {isCreatingNotebook && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <input 
                                className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                                placeholder="Nom du notebook..."
                                value={newNotebookName}
                                onChange={(e) => setNewNotebookName(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={handleCreateNotebook} className="text-white bg-brand-500 hover:bg-brand-600 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none dark:focus:ring-brand-800 transition-colors">Créer</button>
                                <button onClick={() => setIsCreatingNotebook(false)} className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-brand-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">Annuler</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                        {notebooks?.items?.map(notebook => (
                            <Link to={`/workspaces/notebook/${notebook.id}`} key={notebook.id} className="block group">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] xl:py-[27px] hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all h-full">
                                    <div className="flex justify-between mb-6">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                            <BookIcon className="text-brand-500" size={28} />
                                        </div>
                                        <div className="relative inline-block">
                                            <button className="dropdown-toggle text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={(e) => e.preventDefault()}>
                                                <MoreVerticalIcon size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90 truncate">{notebook.name}</h4>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                                            Espace de travail
                                        </span>
                                        <ChevronRightIcon className="text-gray-400 group-hover:text-brand-500 transition-colors" size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {notebooks?.items?.length === 0 && !isLoadingNotebooks && (
                            <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                Aucun notebook créé pour le moment.
                            </div>
                        )}
                        {isLoadingNotebooks && (
                            <div className="col-span-full py-8 text-center text-brand-500 text-sm animate-pulse">
                                Chargement des notebooks...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
        </>
    );
};

export default Workspaces;
