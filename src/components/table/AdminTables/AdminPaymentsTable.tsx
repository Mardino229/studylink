import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button.tsx";
import type { Transaction } from "../../../utils/type";
import Badge from "../../ui/badge/Badge";
import { Loader2 } from "lucide-react";

interface AdminPaymentsTableProps {
    transactions: Transaction[];
    total: number;
    isLoading: boolean;
    searchTerm?: string;
    itemsPerPage?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function AdminPaymentsTable({
    transactions,
    total,
    isLoading,
    searchTerm = "",
    itemsPerPage = 10,
    currentPage,
    onPageChange,
}: AdminPaymentsTableProps) {
    const totalPages = Math.ceil(total / itemsPerPage);

    // Note: Search filtering is still partial on client-side if API doesn't support specific user search yet
    const filteredTransactions = transactions.filter((t) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (t.user_first_name || "").toLowerCase().includes(q) ||
            (t.user_last_name || "").toLowerCase().includes(q) ||
            (t.user_email || "").toLowerCase().includes(q) ||
            (t.plan_name || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={transactions.length !== 0 || isLoading ? "" : "h-64 flex items-center justify-center"}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin size-10 text-blue-500 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chargement des transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="text-center py-20 font-medium text-gray-800 dark:text-white/90">
                            Aucun paiement enregistré
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
                                            Type
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Plan
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Montant
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Statut
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Date
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredTransactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {t.user_first_name} {t.user_last_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {t.user_email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {t.transaction_type === "subscription" ? "Abonnement" : "Pack de jetons"}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {t.plan_name} ({t.billing_type?  t.billing_type === "monthly" ? "Mensuel" : "Annuel" : "N/A"})
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-800 font-semibold text-theme-sm dark:text-white/90">
                                                {parseFloat(t.amount).toFixed(2)} {t.currency.toUpperCase()}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        t.status === "completed"
                                                            ? "success"
                                                            : t.status === "pending"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                >
                                                    {t.status === "completed"
                                                        ? "Payé"
                                                        : t.status === "pending"
                                                            ? "En attente"
                                                            : t.status === "failed"
                                                                ? "Échec"
                                                                : t.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                {t.payment_date ? new Date(t.payment_date).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
