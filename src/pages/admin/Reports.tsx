import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Select from "../../components/form/Select.tsx";
import { useRevenueReport, useSubscriptionsReport, useReportsSummary } from "../../utils/reports.ts";
import type { Period } from "../../utils/reports.ts";
import { TrendingUp, TrendingDown, Users, CreditCard, Zap, BadgeCheck } from "lucide-react";

// ── KPI tile ────────────────────────────────────────────────────────
function KpiTile({
    label,
    value,
    sub,
    trend,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    sub?: string;
    trend?: "up" | "down" | "neutral";
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={16} />
                </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sub && (
                <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    {trend === "up" && <TrendingUp size={12} className="text-emerald-500" />}
                    {trend === "down" && <TrendingDown size={12} className="text-red-400" />}
                    {sub}
                </p>
            )}
        </div>
    );
}

// ── Skeleton placeholder ─────────────────────────────────────────────
function ChartSkeleton({ height }: { height: number }) {
    return (
        <div
            className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            style={{ height }}
        />
    );
}

// ── Main page ────────────────────────────────────────────────────────
export default function Reports() {
    const [period, setPeriod] = useState<Period>("12m");

    const { data: revenue, isLoading: loadingRevenue } = useRevenueReport(period);
    const { data: subs, isLoading: loadingSubs } = useSubscriptionsReport(period);
    const { data: summary, isLoading: loadingSummary } = useReportsSummary();

    const periodOptions = [
        { value: "3m",  label: "3 mois"  },
        { value: "6m",  label: "6 mois"  },
        { value: "12m", label: "12 mois" },
    ];

    // ── Chart: revenue ──────────────────────────────────────────────
    const revenueCategories = revenue?.months.map(m => m.month) ?? [];
    const revenueData       = revenue?.months.map(m => m.revenue_cad) ?? [];
    const revenueSeries = [{ name: "Revenus (CAD)", data: revenueData }];
    const revenueOptions: ApexOptions = {
        chart:       { type: "area", toolbar: { show: false }, background: "transparent" },
        xaxis:       { categories: revenueCategories, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis:       { labels: { formatter: v => `${v.toFixed(0)} $` } },
        grid:        { borderColor: "#e5e7eb", strokeDashArray: 4 },
        dataLabels:  { enabled: false },
        stroke:      { curve: "smooth", width: 2 },
        fill:        { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] } },
        colors:      ["#10b981"],
        tooltip:     { y: { formatter: v => `${v.toFixed(2)} $ CAD` } },
        theme:       { mode: "light" },
    };

    // ── Chart: subscriptions ─────────────────────────────────────────
    const subsCategories = subs?.months.map(m => m.month) ?? [];
    const subsData       = subs?.months.map(m => m.new_subscriptions) ?? [];
    const subsSeries = [{ name: "Nouveaux abonnements", data: subsData }];
    const subsOptions: ApexOptions = {
        chart:       { type: "bar", toolbar: { show: false }, background: "transparent" },
        xaxis:       { categories: subsCategories, axisBorder: { show: false }, axisTicks: { show: false } },
        grid:        { borderColor: "#e5e7eb", strokeDashArray: 4 },
        plotOptions: { bar: { columnWidth: "40%", borderRadius: 6 } },
        dataLabels:  { enabled: false },
        colors:      ["#3b82f6"],
        tooltip:     { y: { formatter: v => `${v} abonnement${v !== 1 ? "s" : ""}` } },
        theme:       { mode: "light" },
    };

    // ── MoM delta ────────────────────────────────────────────────────
    const thisMonth = summary?.revenue_this_month_cad ?? 0;
    const lastMonth = summary?.revenue_last_month_cad ?? 0;
    const momDelta  = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;
    const momTrend  = momDelta === null ? "neutral" : momDelta >= 0 ? "up" : "down";
    const momLabel  = momDelta === null
        ? "vs mois précédent"
        : `${momDelta >= 0 ? "+" : ""}${momDelta.toFixed(1)} % vs mois précédent`;

    return (
        <div className="space-y-6">
            <PageMeta title="Admin - Rapports" description="Statistiques et rapports" />
            <PageBreadcrumb pageTitle="Rapports" />

            {/* ── KPI tiles ── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {loadingSummary ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    ))
                ) : (
                    <>
                        <KpiTile
                            label="Revenus ce mois"
                            value={`${(summary?.revenue_this_month_cad ?? 0).toFixed(2)} $`}
                            sub={momLabel}
                            trend={momTrend}
                            icon={TrendingUp}
                            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        />
                        <KpiTile
                            label="MRR"
                            value={`${(summary?.mrr_cad ?? 0).toFixed(2)} $`}
                            sub="Mensuel récurrent"
                            icon={CreditCard}
                            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        />
                        <KpiTile
                            label="Abonnements actifs"
                            value={String(summary?.active_subscriptions ?? 0)}
                            sub={`${subs?.canceled_count ?? 0} annulé(s) sur la période`}
                            icon={BadgeCheck}
                            color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                        />
                        <KpiTile
                            label="Utilisateurs"
                            value={String(summary?.total_users ?? 0)}
                            sub={`${summary?.token_packs_sold_this_month ?? 0} packs vendus ce mois`}
                            icon={Users}
                            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        />
                    </>
                )}
            </div>

            {/* ── Period selector shared by both charts ── */}
            <div className="flex justify-end">
                <Select
                    options={periodOptions}
                    defaultValue={period}
                    placeholder="Période"
                    onChange={val => setPeriod(val as Period)}
                    className="w-36"
                />
            </div>

            {/* ── Revenue chart ── */}
            <ComponentCard title={`Revenus${revenue ? ` — ${revenue.total_cad.toFixed(2)} $ CAD` : ""}`}>
                {loadingRevenue ? (
                    <ChartSkeleton height={280} />
                ) : (
                    <Chart options={revenueOptions} series={revenueSeries} type="area" height={280} />
                )}
            </ComponentCard>

            {/* ── Subscriptions chart ── */}
            <ComponentCard title={`Nouveaux abonnements${subs ? ` — ${subs.total_new} au total` : ""}`}>
                {loadingSubs ? (
                    <ChartSkeleton height={280} />
                ) : (
                    <Chart options={subsOptions} series={subsSeries} type="bar" height={280} />
                )}
            </ComponentCard>
        </div>
    );
}
