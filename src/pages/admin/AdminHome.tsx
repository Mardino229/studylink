import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { Users, CreditCard, Activity, ArrowRight, Loader2 } from "lucide-react";
import { useGetAdminDashboard } from "../../utils/admin.ts";

export default function AdminHome() {
  const { data, isLoading, isError } = useGetAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageMeta title="Admin" description="Panneau d'administration" />
        <PageBreadcrumb pageTitle="Tableau de bord" />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageMeta title="Admin" description="Panneau d'administration" />
        <PageBreadcrumb pageTitle="Tableau de bord" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">Erreur lors du chargement des données du tableau de bord.</p>
        </div>
      </div>
    );
  }

  const activitySeries = data.charts?.activity || [{ name: "Activité", data: [] }];
  const activityOptions: ApexOptions = {
    chart: { type: "line", sparkline: { enabled: true } },
    stroke: { width: 2, curve: "smooth" },
    colors: ["#3b82f6"],
    tooltip: { enabled: true },
  };

  const revenueSeries = data.charts?.revenue || [{ name: "Revenus", data: [] }];
  const revenueOptions: ApexOptions = {
    chart: { type: "area", sparkline: { enabled: true } },
    stroke: { width: 2, curve: "smooth" },
    fill: { opacity: 0.2 },
    colors: ["#10b981"],
    tooltip: { enabled: true },
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin" description="Panneau d'administration" />
      <PageBreadcrumb pageTitle="Tableau de bord" />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users className="size-6" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-theme-xs">Utilisateurs</p>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{data.kpis?.totalUsers || 0}</h4>
          </div>
          <div className="mt-4 h-16">
            <Chart options={activityOptions} series={activitySeries} type="line" height="100%" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <CreditCard className="size-6" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-theme-xs">Abonnements actifs</p>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{data.kpis?.activeSubscriptions || 0}</h4>
          </div>
          <div className="mt-4 h-16">
            <Chart options={activityOptions} series={activitySeries} type="line" height="100%" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Activity className="size-6" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-theme-xs">Revenus mensuels</p>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{data.kpis?.monthlyRevenue?.toLocaleString() || 0} €</h4>
          </div>
          <div className="mt-4 h-16">
            <Chart options={revenueOptions} series={revenueSeries} type="area" height="100%" />
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ComponentCard title="Utilisateurs récents" desc="Dernières inscriptions sur la plateforme">
            {data.recentUsers && data.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {data.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-medium">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.firstName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="uppercase">{user.firstName?.charAt(0) || ""}{user.lastName?.charAt(0) || ""}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée pour le moment.</p>
              </div>
            )}
          </ComponentCard>

          <ComponentCard title="Dernières transactions" desc="Historique des paiements récents">
            {data.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {tx.user?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{tx.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.amount} €</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {tx.status === 'completed' ? 'Complété' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée pour le moment.</p>
              </div>
            )}
          </ComponentCard>
        </div>

        <div className="space-y-6">
          <ComponentCard title="Activité système">
            <div className="mb-6">
              <Chart options={activityOptions} series={activitySeries} type="line" height={100} />
            </div>
            {data.systemActivity && data.systemActivity.length > 0 ? (
              <div className="space-y-4">
                {data.systemActivity.map((activity) => {
                  let bgColorClass = 'bg-brand-500';
                  if (activity.color === 'emerald') bgColorClass = 'bg-emerald-500';
                  if (activity.color === 'amber') bgColorClass = 'bg-amber-500';
                  if (activity.color === 'red') bgColorClass = 'bg-red-500';
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${bgColorClass}`} />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.message}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente.</p>
            )}
          </ComponentCard>

          <ComponentCard title="Accès rapides">
            <div className="grid grid-cols-1 gap-3">
              <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gérer les utilisateurs</span>
                <ArrowRight className="size-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/subscriptions" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Abonnements</span>
                <ArrowRight className="size-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/announcements" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annonces</span>
                <ArrowRight className="size-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
