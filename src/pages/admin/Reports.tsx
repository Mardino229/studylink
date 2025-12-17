import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { mockPayments, mockSubscriptions } from "./adminMock";

export default function Reports() {
  const [period, setPeriod] = useState<string>("12m");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueSeries = useMemo(() => {
    const data = new Array(12).fill(0);
    mockPayments.forEach(p => {
      const m = Math.max(0, Math.min(11, new Date(p.date).getMonth()));
      if (p.status === "paid") data[m] += p.amount;
    });
    return [{ name: "Revenus", data }];
  }, []);
  const revenueOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    xaxis: { categories: months },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { opacity: 0.2 },
    colors: ["#10b981"],
  };

  const subsSeries = useMemo(() => {
    const data = new Array(12).fill(0);
    mockSubscriptions.forEach(() => {
      const idx = Math.floor(Math.random()*12);
      data[idx] += 1;
    });
    return [{ name: "Abonnements", data }];
  }, []);
  const subsOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: months },
    plotOptions: { bar: { columnWidth: "40%" } },
    dataLabels: { enabled: false },
    colors: ["#3b82f6"],
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Rapports" description="Statistiques et rapports" />
      <PageBreadcrumb pageTitle="Rapports" />

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Revenus</h2>
          <select value={period} onChange={(e)=>setPeriod(e.target.value)} className="px-3 py-2 rounded border border-border bg-background">
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
          </select>
        </div>
        <Chart options={revenueOptions} series={revenueSeries} type="area" height={280} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Nouveaux abonnements</h2>
        <Chart options={subsOptions} series={subsSeries} type="bar" height={280} />
      </div>
    </div>
  );
}
