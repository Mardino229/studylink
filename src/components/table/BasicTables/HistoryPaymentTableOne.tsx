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
import { useGetTransactions } from "../../../utils/subscription.ts";
import { Loader } from "lucide-react";
import type { Transaction } from "../../../utils/type.ts";

interface HistoryPaymentTableOneProps {
  searchTerm?: string;
  itemsPerPage?: number;
}

export default function HistoryPaymentTableOne({
  searchTerm = "",
  itemsPerPage = 10
}: HistoryPaymentTableOneProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * itemsPerPage;

  // Récupérer les transactions via l'API (avec pagination backend)
  const { isLoading, isError, data } = useGetTransactions(itemsPerPage, skip);

  const transactions = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Filter transactions based on search term (client-side for now as API doesn't support complex search yet)
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return transactions.filter((t: Transaction) =>
      t.transaction_type.toString().includes(lowerSearchTerm) ||
      (t.plan?.name || "").toLowerCase().includes(lowerSearchTerm) ||
      t.status.toLowerCase().includes(lowerSearchTerm)
    );
  }, [transactions, searchTerm]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className={transactions && transactions.length !== 0 ? "" : "h-64 flex items-center justify-center"}>
          {isLoading ? (
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
          ) : isError ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              Erreur lors du chargement des transactions
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
              Aucune transaction effectuée
            </p>
          ) : (
            <>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {/*<TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      ID
                    </TableCell> */}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Plan
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Montant
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Statut
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id}>
                        {/* <TableCell className="px-4 py-3 font-mono text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          #{t.id}
                        </TableCell> */}
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {t.payment_date ? new Date(t.payment_date).toLocaleDateString() : "En attente"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.transaction_type === "subscription" ? "Abonnement" : "Pack de jetons"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {t.plan?.name || "N/A"} ({t.billing_type ? t.billing_type === "monthly" ? "Mensuel" : "Annuel" : "N/A"})
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {t.amount} {t.currency.toUpperCase()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={t.status === "completed" ? "success" : t.status === "pending" ? "warning" : "error"}
                          >
                            {t.status === "completed" ? "Payé" : t.status === "pending" ? "En attente" : "Échec"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>

              {/* Pagination */}
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
