import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button.tsx";
import { Eye, CheckCircle2, RotateCcw } from "lucide-react";
import type { SupportTicket, TicketStatus } from "../../../utils/support";

const TYPE_LABELS: Record<string, string> = {
    report_issue: "Bug",
    feature_request: "Fonctionnalité",
    get_help: "Aide",
    feedback: "Avis",
};

const STATUS_BADGE: Record<TicketStatus, { color: "warning" | "info" | "success"; label: string }> = {
    new: { color: "warning", label: "Nouveau" },
    seen: { color: "info", label: "Vu" },
    handled: { color: "success", label: "Traité" },
};

interface FeedbacksTableProps {
    tickets: SupportTicket[];
    searchTerm?: string;
    typeFilter?: string;
    statusFilter?: string;
    itemsPerPage?: number;
    onUpdateStatus: (id: string, status: TicketStatus) => void;
    isUpdating?: boolean;
}

export default function FeedbacksTable({
    tickets,
    searchTerm = "",
    typeFilter = "all",
    statusFilter = "all",
    itemsPerPage = 10,
    onUpdateStatus,
    isUpdating = false,
}: FeedbacksTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        return tickets.filter((t) => {
            const q = searchTerm.trim().toLowerCase();
            const matchQ = !q || t.email.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
            const matchType = typeFilter === "all" || t.type === typeFilter;
            const matchStatus = statusFilter === "all" || t.status === statusFilter;
            return matchQ && matchType && matchStatus;
        });
    }, [tickets, searchTerm, typeFilter, statusFilter]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                {tickets.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun ticket reçu pour l'instant.</p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Utilisateur</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Message</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Statut</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {paginated.map((t) => {
                                    const badge = STATUS_BADGE[t.status];
                                    const initials = t.email.slice(0, 2).toUpperCase();
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {t.user_id ? initials : "?"}
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                                                        {t.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    {TYPE_LABELS[t.type] ?? t.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{t.message}</p>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge size="sm" color={badge.color}>{badge.label}</Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(t.created_at).toLocaleDateString("fr-CA")}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-end">
                                                <div className="flex justify-end gap-2">
                                                    {t.status === 'new' && (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => onUpdateStatus(t.id, 'seen')}
                                                            title="Marquer comme vu"
                                                            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                                                        >
                                                            <Eye className="size-5" />
                                                        </button>
                                                    )}
                                                    {t.status !== 'handled' && (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => onUpdateStatus(t.id, 'handled')}
                                                            title="Marquer comme traité"
                                                            className="text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="size-5" />
                                                        </button>
                                                    )}
                                                    {t.status === 'handled' && (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => onUpdateStatus(t.id, 'new')}
                                                            title="Rouvrir"
                                                            className="text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="size-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            Aucun ticket trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        Précédent
                                    </Button>
                                    <Button size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
