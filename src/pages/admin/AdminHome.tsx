import { useState } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Select from "../../components/form/Select.tsx";
import { Users, CreditCard, Activity, ArrowRight, Loader2, Zap, BadgeCheck, TrendingUp, Eye, MousePointer, UserCheck, Percent, Share2 } from "lucide-react";
import { useGetAdminDashboard } from "../../utils/admin.ts";
import { useVisitorReport } from "../../utils/reports.ts";

export default function AdminHome() {
  const [visitorDays, setVisitorDays] = useState<number>(28);
  const { data, isLoading, isError } = useGetAdminDashboard();
  const { data: visitorData, isLoading: loadingVisitors } = useVisitorReport(visitorDays);

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

  const revenueSeries = data.charts?.revenue?.length
    ? data.charts.revenue
    : [{ name: "Revenus total", data: [] }];
  const revenueOptions: ApexOptions = {
    chart: { type: "area", sparkline: { enabled: true } },
    stroke: { width: 2, curve: "smooth" },
    fill: { opacity: 0.15 },
    colors: ["#3b82f6", "#f59e0b", "#10b981"],
    tooltip: { enabled: true },
  };


  const visitorDaysOptions = [
    { value: "7", label: "7 derniers jours" },
    { value: "28", label: "28 derniers jours" },
    { value: "90", label: "90 derniers jours" },
  ];

  const dailyDates = visitorData?.daily?.map(d => {
    if (d.date && d.date.length === 8) {
      return `${d.date.slice(6, 8)}/${d.date.slice(4, 6)}`;
    }
    return d.date;
  }) ?? [];

  const dailyActiveUsers = visitorData?.daily?.map(d => d.active_users) ?? [];
  const dailySessions    = visitorData?.daily?.map(d => d.sessions) ?? [];

  const visitorChartSeries = [
    { name: "Utilisateurs actifs", data: dailyActiveUsers },
    { name: "Sessions", data: dailySessions },
  ];

  const visitorChartOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    xaxis: { categories: dailyDates, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 90, 100] } },
    colors: ["#3b82f6", "#8b5cf6"],
    tooltip: { theme: "light" },
  };

  const sourcesTotal = visitorData?.sources?.reduce((acc, s) => acc + s.users, 0) || 1;

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

      {/* KPIs   revenus détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <BadgeCheck className="size-5" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus abonnements (mois)</p>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {data.kpis?.monthlySubscriptionRevenue?.toLocaleString() ?? ' '} $
          </h4>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Zap className="size-5" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus jetons (mois)</p>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {data.kpis?.monthlyTokenRevenue?.toLocaleString() ?? ' '} $
          </h4>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <TrendingUp className="size-5" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jetons consommés (total)</p>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {data.kpis?.totalTokensSpent?.toLocaleString() ?? ' '}
          </h4>
        </div>
      </div>

      {/* ── Statistiques des visiteurs (GA4) ── */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Eye className="size-5 text-blue-500" />
              Statistiques des visiteurs (GA4)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Données de trafic Google Analytics 4
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              options={visitorDaysOptions}
              defaultValue={String(visitorDays)}
              onChange={(val) => setVisitorDays(Number(val))}
              className="w-48"
            />
          </div>
        </div>

        {loadingVisitors ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : visitorData ? (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Utilisateurs actifs</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Users className="size-4" />
                  </div>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
                  {visitorData.active_users?.toLocaleString() ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sessions</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <MousePointer className="size-4" />
                  </div>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
                  {visitorData.sessions?.toLocaleString() ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Nouveaux utilisateurs</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <UserCheck className="size-4" />
                  </div>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
                  {visitorData.new_users?.toLocaleString() ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Taux d'engagement</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Percent className="size-4" />
                  </div>
                </div>
                <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
                  {((visitorData.engagement_rate ?? 0) * 100).toFixed(1)} %
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Daily Evolution */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Évolution quotidienne</h4>
                {dailyDates.length > 0 ? (
                  <Chart options={visitorChartOptions} series={visitorChartSeries} type="area" height={240} />
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-400">Aucune donnée quotidienne</p>
                  </div>
                )}
              </div>

              {/* Traffic Sources */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sources de trafic</h4>
                {visitorData.sources && visitorData.sources.length > 0 ? (
                  <div className="space-y-3">
                    {visitorData.sources.map((s) => {
                      const pct = ((s.users / sourcesTotal) * 100).toFixed(1);
                      return (
                        <div key={s.source} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium capitalize text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate max-w-[140px]">
                              <Share2 className="size-3 text-gray-400 shrink-0" />
                              {s.source}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {s.users} <span className="text-[10px] text-gray-400">({pct} %)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${Math.min(100, Math.max(0, Number(pct)))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-400">Aucune source disponible</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">Impossible de charger les données GA4.</p>
        )}
      </div>


      {/* Token analytics */}
      {data.tokenAnalytics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pack sales */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ventes de packs de jetons</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Pack</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Jetons</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Ventes</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Revenus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.tokenAnalytics.packsSold.map(p => (
                    <tr key={p.packName} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.packName}</td>
                      <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">🪙 {p.tokens}</td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{p.salesCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{p.revenue.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consumption breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Consommation par type</h3>
            <div className="space-y-3">
              {[
                { label: 'Artefacts (résumés, quiz…)', data: data.tokenAnalytics.consumption.artefact, color: 'bg-blue-500' },
                { label: 'Corrigés', data: data.tokenAnalytics.consumption.corrige, color: 'bg-amber-500' },
                { label: 'Chat RAG', data: data.tokenAnalytics.consumption.chat, color: 'bg-violet-500' },
              ].map(({ label, data: d, color }) => {
                const c = data.tokenAnalytics!.consumption;
                const total = ((c.artefact?.tokensSpent ?? 0) + (c.corrige?.tokensSpent ?? 0) + (c.chat?.tokensSpent ?? 0)) || 1;
                const pct = d ? Math.round((d.tokensSpent / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{label}</span>
                      <span className="font-semibold">
                        {d ? `${d.tokensSpent.toLocaleString()} 🪙 · ${d.count} actions · ${pct}%` : ' '}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                        {tx.type === 'token_pack' ? '🪙' : '📋'} {tx.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.amount} {tx.currency?.toUpperCase() ?? '$'}
                      </p>
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
              <Link to="/admin/token-packs" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Packs de jetons</span>
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
