import { useState, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { mockPayments, mockSubscriptions } from "./adminMock";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Select from "../../components/form/Select.tsx";

export default function Reports() {
  const [period, setPeriod] = useState<string>("12m");

  const periodOptions = [
    { value: "3m", label: "3 mois" },
    { value: "6m", label: "6 mois" },
    { value: "12m", label: "12 mois" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
      const idx = Math.floor(Math.random() * 12);
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

      <ComponentCard title="Revenus">
        <div className="flex justify-end mb-4">
          <Select
            options={periodOptions}
            defaultValue={period}
            placeholder="Période"
            onChange={(val) => setPeriod(val)}
            className="w-32"
          />
        </div>
        <Chart options={revenueOptions} series={revenueSeries} type="area" height={280} />
      </ComponentCard>

      <ComponentCard title="Nouveaux abonnements">
        <Chart options={subsOptions} series={subsSeries} type="bar" height={280} />
      </ComponentCard>
    </div>
  );
}
