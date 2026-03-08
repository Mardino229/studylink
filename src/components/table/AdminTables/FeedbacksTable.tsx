import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useState, useMemo } from "react";
import Button from "../../ui/button/Button.tsx";
import { type AdminFeedback, idToUser } from "../../../pages/admin/adminMock";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface FeedbacksTableProps {
    searchTerm?: string;
    statusFilter?: string;
    itemsPerPage?: number;
    feedbacks: AdminFeedback[];
    onSetStatus: (id: string, next: AdminFeedback["status"]) => void;
}

export default function FeedbacksTable({
    searchTerm = "",
    statusFilter = "all",
    itemsPerPage = 10,
    feedbacks,
    onSetStatus,
}: FeedbacksTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const initials = (fullName: string) => fullName.split(" ").map(n => n[0] || "").join("").slice(0, 2).toUpperCase();

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter((f) => {
            const qmatch = searchTerm.trim().length === 0 || idToUser(f.userId).toLowerCase().includes(searchTerm.toLowerCase()) || f.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const st = statusFilter === "all" || f.status === statusFilter;
            return qmatch && st;
        });
    }, [feedbacks, searchTerm, statusFilter]);

    const paginatedFeedbacks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredFeedbacks.slice(startIndex, endIndex);
    }, [filteredFeedbacks, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={feedbacks.length !== 0 ? "" : "h-64 flex items-center justify-center"}>
                    {feedbacks.length === 0 ? (
                        <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
                            Aucun feedback reçu
                        </p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Utilisateur
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Sujet
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Statut
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Date
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {paginatedFeedbacks.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center text-xs font-semibold">
                                                        {initials(idToUser(f.userId))}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {idToUser(f.userId)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">{f.subject}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{f.message}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <Badge
                                                    size="sm"
                                                    color={f.status === "resolved" ? "success" : "warning"}
                                                >
                                                    {f.status === "resolved" ? "Résolu" : "Ouvert"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {f.createdAt}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-end">
                                                <div className="flex justify-end gap-2">
                                                    {f.status !== "resolved" ? (
                                                        <button
                                                            onClick={() => onSetStatus(f.id, "resolved")}
                                                            className="text-gray-500 hover:text-success-500 dark:text-gray-400 dark:hover:text-success-400"
                                                            title="Marquer comme résolu"
                                                        >
                                                            <CheckCircle2 className="size-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => onSetStatus(f.id, "open")}
                                                            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                                                            title="Rouvrir"
                                                        >
                                                            <RotateCcw className="size-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredFeedbacks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                                Aucun feedback trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Page {currentPage} sur {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
