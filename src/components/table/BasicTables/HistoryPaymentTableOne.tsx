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
import { useGetPayments } from "../../../utils/payment.ts";
import {Loader} from "lucide-react";

interface HistoryPaymentTableOneProps {
  searchTerm?: string;
  itemsPerPage?: number;
}

export default function HistoryPaymentTableOne({ 
  searchTerm = "", 
  itemsPerPage = 10 
}: HistoryPaymentTableOneProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Récupérer les paiements via l'API
  const { isLoading, isError, data: payments } = useGetPayments();

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    if (!searchTerm) return payments;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return payments.filter((payment) =>
      payment.id.toLowerCase().includes(lowerSearchTerm) ||
      payment.plan.toLowerCase().includes(lowerSearchTerm) ||
      payment.method.toLowerCase().includes(lowerSearchTerm) ||
      payment.status.toLowerCase().includes(lowerSearchTerm)
    );
  }, [payments, searchTerm]);

  // Paginate filtered payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className={payments && payments.length !== 0 ? "" : "h-[calc(100vh-28rem)] flex items-center justify-center"}>
          {isLoading ? (
            <Loader className="h-64" />
          ) : isError ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              Erreur lors du chargement des paiements
            </p>
          ) : !payments || payments.length === 0 ? (
            <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
              Aucun paiement enregistré
            </p>
          ) : (
            <>
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
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
                      ID
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
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Méthode
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.date}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-mono text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {payment.id}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {payment.plan}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {payment.amount}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <Badge
                            size="sm"
                            color={payment.status === "Payé" ? "success" : "warning"}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {payment.method}
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
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
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
