import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { type Announcement } from "../../../utils/type";
import { Trash2, Pencil, ExternalLink } from "lucide-react";
import Badge from "../../ui/badge/Badge";

interface AnnouncementsTableProps {
    announcements: Announcement[];
    onRemove: (id: string) => void;
    onEdit: (item: Announcement) => void;
}

export default function AnnouncementsTable({
    announcements,
    onRemove,
    onEdit,
}: AnnouncementsTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={announcements.length !== 0 ? "" : "h-64 flex items-center justify-center"}>
                    {announcements.length === 0 ? (
                        <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
                            Aucun élément trouvé
                        </p>
                    ) : (
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Libellé
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Type
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Échéance
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Contenu
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {announcements.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                            <div className="flex flex-col">
                                                <span>{item.title}</span>
                                                {item.url && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-brand-500 flex items-center gap-1 hover:underline"
                                                    >
                                                        Lien <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <Badge
                                                size="sm"
                                                color={item.type === "announcement" ? "primary" : "warning"}
                                            >
                                                {item.type === "announcement" ? "Annonce" : "Sondage"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatDate(item.deadline)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <span className="text-gray-500 text-theme-sm dark:text-gray-400 truncate max-w-[200px] block" title={item.content}>
                                                {item.content}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-end">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="size-5" />
                                                </button>
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="size-5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
