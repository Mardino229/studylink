import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Select from "../../components/form/Select.tsx";
import AdminPaymentsTable from "../../components/table/AdminTables/AdminPaymentsTable.tsx";
import { useGetAdminTransactions, useGetTransactionStats } from "../../utils/subscription.ts";
import { Loader2 } from "lucide-react";

export default function Payments() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [byPage, setByPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const skip = (currentPage - 1) * byPage;

  // Real data from API
  const { data: stats, isLoading: isLoadingStats } = useGetTransactionStats();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetAdminTransactions(byPage, skip, status);

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "completed", label: "Payé" },
    { value: "failed", label: "Échec" },
    { value: "pending", label: "En attente" },
    { value: "refunded", label: "Remboursé" },
  ];

  const pageOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageSizeChange = (val: string) => {
    setByPage(parseInt(val));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Paiements" description="Suivi des paiements" />
      <PageBreadcrumb pageTitle="Paiements" />

      {isLoadingStats ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin size-8 text-blue-500" />
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total encaissé</div>
            <div className="mt-2 text-3xl font-semibold text-gray-800 dark:text-white/90">
              {parseFloat(stats?.total_revenue || "0").toFixed(2)} €
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">Paiements réussis</div>
            <div className="mt-2 text-3xl font-semibold text-gray-800 dark:text-white/90">
              {stats?.completed_count || 0}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">Échecs</div>
            <div className="mt-2 text-3xl font-semibold text-gray-800 dark:text-white/90">
              {stats?.failed_count || 0}
            </div>
          </div>
        </section>
      )}

      <ComponentCard title="Historique des paiements">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={pageOptions}
              defaultValue={byPage.toString()}
              placeholder="Entrée par page"
              onChange={handlePageSizeChange}
              className="w-32"
            />
            <Select
              options={statusOptions}
              defaultValue={status}
              placeholder="Filtrer par statut"
              onChange={handleStatusChange}
              className="w-48"
            />
          </div>

          <div className="relative">
            <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
              <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par utilisateur..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
          </div>
        </div>

        <AdminPaymentsTable
          transactions={transactionsData?.items || []}
          total={transactionsData?.total || 0}
          isLoading={isLoadingTransactions}
          searchTerm={q}
          itemsPerPage={byPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </ComponentCard>
    </div>
  );
}
