import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

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
      <PageBreadcrumb pageTitle="Admin" />

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Utilisateurs</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">—</div>
          <div className="mt-3"><Chart options={activityOptions} series={activitySeries} type="line" height={60} /></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Abonnements actifs</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">—</div>
          <div className="mt-3"><Chart options={activityOptions} series={activitySeries} type="line" height={60} /></div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="text-sm text-foreground/70">Revenus</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">—</div>
          <div className="mt-3"><Chart options={revenueOptions} series={revenueSeries} type="area" height={60} /></div>
        </div>
      </section>

      {/* Content sections */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Users overview */}
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Utilisateurs récents</h2>
              <Link to="#" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
            </div>
            <div className="text-sm text-foreground/70">Aucune donnée pour le moment.</div>
          </div>

          {/* Subscriptions */}
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Abonnements</h2>
              <Link to="#" className="text-sm text-blue-600 hover:underline">Gérer</Link>
            </div>
            <div className="text-sm text-foreground/70">Aucune donnée pour le moment.</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Activity */}
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Activité</h2>
            <div className="mb-3">
              <Chart options={activityOptions} series={activitySeries} type="line" height={120} />
            </div>
            <ul className="space-y-3 text-sm">
              <li className="text-foreground/70">Aucune activité récente.</li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Liens rapides</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link to="/home" className="px-3 py-2 rounded border border-border hover:bg-background">Retour utilisateur</Link>
              <Link to="/settings/subscription" className="px-3 py-2 rounded border border-border hover:bg-background">Abonnements</Link>
              <Link to="/settings/announcements" className="px-3 py-2 rounded border border-border hover:bg-background">Annonces</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
