import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { mockPayments, mockSubscriptions } from "./adminMock";
import { TrendingUp, BarChart3 } from "lucide-react";

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
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] } },
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
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    plotOptions: { bar: { columnWidth: "40%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    colors: ["#3b82f6"],
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Admin - Rapports" description="Statistiques et rapports" />
      <PageBreadcrumb pageTitle="Rapports" />

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            <h2 className="text-xl font-semibold gradient-text">Revenus</h2>
          </div>
          <select value={period} onChange={(e)=>setPeriod(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-white/5 backdrop-blur-sm text-sm">
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
          </select>
        </div>
        <Chart options={revenueOptions} series={revenueSeries} type="area" height={280} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-blue-500" />
          <h2 className="text-xl font-semibold gradient-text">Nouveaux abonnements</h2>
        </div>
        <Chart options={subsOptions} series={subsSeries} type="bar" height={280} />
      </div>
    </div>
  );
}
