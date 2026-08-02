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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('app');

  const { isLoading, isError, data } = useGetTransactions(itemsPerPage, skip);

  const transactions = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return transactions.filter((tx: Transaction) =>
      tx.transaction_type.toString().includes(lowerSearchTerm) ||
      (tx.plan?.name || "").toLowerCase().includes(lowerSearchTerm) ||
      tx.status.toLowerCase().includes(lowerSearchTerm)
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
              {t('payment_table.error')}
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 font-medium text-gray-800 dark:text-white/90">
              {t('payment_table.empty')}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('payment_table.date')}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('payment_table.type')}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('payment_table.plan')}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('payment_table.amount')}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {t('payment_table.status')}
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                        {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString() : t('payment_table.status_pending')}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {tx.transaction_type === "subscription" ? t('payment_table.type_subscription') : t('payment_table.type_token_pack')}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {tx.plan?.name || "N/A"}{" "}
                        {tx.billing_type
                          ? `(${tx.billing_type === "monthly" ? t('payment_table.billing_monthly') : t('payment_table.billing_annual')})`
                          : "(N/A)"}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {tx.amount} {tx.currency.toUpperCase()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "error"}
                        >
                          {tx.status === "completed"
                            ? t('payment_table.status_paid')
                            : tx.status === "pending"
                            ? t('payment_table.status_pending')
                            : t('payment_table.status_failed')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('payment_table.page_of', { current: currentPage, total: totalPages })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      {t('payment_table.prev')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t('payment_table.next')}
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
