import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { Users, CreditCard, Activity, ArrowRight } from "lucide-react";

export default function AdminHome() {
  // Mock charts data
  const activitySeries = [{ name: "Activité", data: [3, 5, 2, 8, 6, 9, 7, 10, 8, 12, 9, 11] }];
  const activityOptions: ApexOptions = {
    chart: { type: "line", sparkline: { enabled: true } },
    stroke: { width: 2, curve: "smooth" },
    colors: ["#3b82f6"],
    tooltip: { enabled: true },
  };

  const revenueSeries = [{ name: "Revenus", data: [120, 150, 170, 160, 210, 230, 250, 240, 280, 300, 320, 350] }];
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
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">1,254</h4>
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
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">842</h4>
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
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">12,850 €</h4>
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
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée pour le moment.</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Dernières transactions" desc="Historique des paiements récents">
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée pour le moment.</p>
            </div>
          </ComponentCard>
        </div>

        <div className="space-y-6">
          <ComponentCard title="Activité système">
            <div className="mb-6">
              <Chart options={activityOptions} series={activitySeries} type="line" height={100} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance terminée à 04:00</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Nouveau plan créé : Premium Plus</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Sauvegarde automatique réussie</p>
              </div>
            </div>
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
