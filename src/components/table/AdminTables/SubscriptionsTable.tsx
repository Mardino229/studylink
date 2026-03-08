import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button.tsx";
import { type Subscription } from "../../../utils/type";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface SubscriptionsTableProps {
    searchTerm?: string;
    itemsPerPage?: number;
    currentPage: number;
    total: number;
    isLoading: boolean;
    subscriptions: Subscription[];
    onPageChange: (page: number) => void;
}

export default function SubscriptionsTable({
    searchTerm = "",
    itemsPerPage = 10,
    currentPage,
    total,
    isLoading,
    subscriptions,
    onPageChange,
}: SubscriptionsTableProps) {
    const totalPages = Math.ceil(total / itemsPerPage);

    // Client-side search (as fallback if API doesn't support complex search)
    const filteredSubscriptions = subscriptions.filter((s) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            s.user_id.toString().includes(q) ||
            (s.user_first_name || "").toLowerCase().includes(q) ||
            (s.user_last_name || "").toLowerCase().includes(q) ||
            (s.user_email || "").toLowerCase().includes(q) ||
            (s.plan_name || "").toLowerCase().includes(q)
        );
    });

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("fr-FR");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <div className={subscriptions.length !== 0 || isLoading ? "" : "h-64 flex items-center justify-center"}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin size-10 text-blue-500 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chargement des abonnements...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <p className="text-center py-20 font-medium text-gray-800 dark:text-white/90">
                            Aucun abonnement enregistré
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
                                            Plan
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Statut
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Dates (Début / Fin)
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {filteredSubscriptions.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 dark:text-white/90">
                                                        {s.user_first_name} {s.user_last_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {s.user_email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <Badge size="sm" color="primary">
                                                        {s.plan_name}
                                                    </Badge>
                                                    <span className="text-xs mt-1 text-gray-500">
                                                        {s.billing_type === "monthly" ? "Mensuel" : "Annuel"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start">
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        s.status === "active"
                                                            ? "success"
                                                            : s.status === "past_due"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                >
                                                    {s.status === "active" ? "Actif" : s.status === "canceled" ? "Annulé" : s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Calendar className="size-3.5" />
                                                        <span>{formatDate(s.start_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <Calendar className="size-4" />
                                                        <span>{formatDate(s.end_date)}</span>
                                                    </div>
                                                </div>
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
