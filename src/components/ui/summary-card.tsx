import { FileText, Pencil, Trash2, Calendar, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SummaryCardProps {
    title: string;
    date?: string;
    type?: string;
    isUpdating?: boolean;
    onClick?: () => void;
    onRename?: (newTitle: string) => void;
    onDelete?: () => void;
}

export function SummaryCard({ title, date = "Just now", type = "Summary", isUpdating = false, onClick, onRename, onDelete }: SummaryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (editedTitle.trim()) {
            onRename?.(editedTitle);
            setIsEditing(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedTitle(title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setEditedTitle(title);
            setIsEditing(false);
        }
    };

    return (
        <div
            className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
            onClick={onClick}
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <FileText size={20} />
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Supprimer"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div>
                {isUpdating ? (
                    <div className="mb-1 flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent dark:border-brand-400" />
                        <span>Mise à jour...</span>
                    </div>
                ) : isEditing ? (
                    <div className="mb-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                            ref={inputRef}
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                        />
                        <button onClick={handleSave} className="text-green-600 hover:text-green-700">
                            <Check size={16} />
                        </button>
                        <button onClick={handleCancel} className="text-red-600 hover:text-red-700">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="group/title mb-1 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="text-gray-400 hover:text-brand-600"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {date}
                    </span>
                    <span>•</span>
                    <span>{type}</span>
                </div>
            </div>
        </div>
    );
}
