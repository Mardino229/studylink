import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import Select from "../../components/form/Select.tsx";
import { useRetentionReport } from "../../utils/reports.ts";
import type { Period } from "../../utils/reports.ts";
import { Users, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────

/** Returns a green-tinted background color based on the percentage (0-100). */
function heatColor(value: number | null): string {
    if (value === null) return "";
    if (value === 100) return "bg-emerald-600 text-white";
    if (value >= 80)   return "bg-emerald-500 text-white";
    if (value >= 60)   return "bg-emerald-400 text-white";
    if (value >= 40)   return "bg-emerald-200 text-emerald-900";
    if (value >= 20)   return "bg-emerald-100 text-emerald-800";
    return "bg-red-100 text-red-700";
}

/** Format a cohort month label, e.g. "2026-01" → "Jan 26" */
function formatCohortLabel(cohort: string): string {
    const [year, month] = cohort.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("fr-CA", { month: "short", year: "2-digit" });
}

// ── KPI tile ──────────────────────────────────────────────────────────
function RetentionKpi({
    label,
    value,
    sub,
    icon: Icon,
    color,
    trend,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    color: string;
    trend?: "up" | "down" | "neutral";
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
                    {trend === "up"   && <TrendingUp  size={12} className="text-emerald-500" />}
                    {trend === "down" && <TrendingDown size={12} className="text-red-400" />}
                    {trend === "neutral" && <Minus size={12} className="text-gray-400" />}
                    {sub}
                </p>
            )}
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────────────
function MatrixSkeleton() {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                    <div className="h-8 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                    {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="h-8 w-14 rounded bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ── Legend ────────────────────────────────────────────────────────────
function HeatLegend() {
    const stops = [
        { label: "< 20 %",  cls: "bg-red-100" },
        { label: "20–40 %", cls: "bg-emerald-100" },
        { label: "40–60 %", cls: "bg-emerald-200" },
        { label: "60–80 %", cls: "bg-emerald-400" },
        { label: "> 80 %",  cls: "bg-emerald-500" },
        { label: "100 %",   cls: "bg-emerald-600" },
    ];
    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Légende :</span>
            {stops.map(s => (
                <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span className={`inline-block h-3.5 w-3.5 rounded-sm ${s.cls}`} />
                    {s.label}
                </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-500 text-[9px]">—</span>
                Non mesuré
            </span>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function Retention() {
    const [period, setPeriod] = useState<Period>("12m");
    const { data, isLoading } = useRetentionReport(period);

    const periodOptions = [
        { value: "3m",  label: "3 mois"  },
        { value: "6m",  label: "6 mois"  },
        { value: "12m", label: "12 mois" },
    ];

    // Determine the max number of retention columns across all cohorts
    const cohorts = data?.cohorts ?? [];
    const maxMonths = cohorts.reduce((acc, c) => {
        const keys = Object.keys(c.retention).filter(k => k.startsWith("m")).length;
        return Math.max(acc, keys);
    }, 0);
    const columns = Array.from({ length: maxMonths }, (_, i) => `m${i}` as string);

    const ret30  = data?.summary.retention_30d;
    const ret90  = data?.summary.retention_90d;

    return (
        <div className="space-y-6">
            <PageMeta title="Admin - Rétention" description="Analyse de rétention des abonnements par cohortes" />
            <PageBreadcrumb pageTitle="Rétention" />

            {/* ── KPI tiles ── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <RetentionKpi
                    label="Rétention 30 j"
                    value={ret30 !== null && ret30 !== undefined ? `${ret30.toFixed(1)} %` : "—"}
                    sub={ret30 !== null && ret30 !== undefined ? "après 1 mois" : "Données insuffisantes"}
                    icon={TrendingUp}
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    trend={ret30 !== null && ret30 !== undefined ? (ret30 >= 50 ? "up" : "down") : "neutral"}
                />
                <RetentionKpi
                    label="Rétention 90 j"
                    value={ret90 !== null && ret90 !== undefined ? `${ret90.toFixed(1)} %` : "—"}
                    sub={ret90 !== null && ret90 !== undefined ? "après 3 mois" : "Données insuffisantes"}
                    icon={Activity}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    trend={ret90 !== null && ret90 !== undefined ? (ret90 >= 30 ? "up" : "down") : "neutral"}
                />
                <RetentionKpi
                    label="Cohortes analysées"
                    value={String(data?.summary.cohort_count ?? "—")}
                    sub={`Période : ${period}`}
                    icon={Users}
                    color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                />
                <RetentionKpi
                    label="Abonnés initiaux"
                    value={String(cohorts.reduce((s, c) => s + c.initial_users, 0) || "—")}
                    sub="Total sur la période"
                    icon={Users}
                    color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
            </div>

            {/* ── Period selector ── */}
            <div className="flex justify-end">
                <Select
                    options={periodOptions}
                    defaultValue={period}
                    placeholder="Période"
                    onChange={val => setPeriod(val as Period)}
                    className="w-36"
                />
            </div>

            {/* ── Cohort matrix ── */}
            <ComponentCard
                title="Matrice de rétention par cohortes"
                desc="Pourcentage d'abonnés encore actifs à chaque mois suivant leur souscription initiale."
            >
                {isLoading ? (
                    <MatrixSkeleton />
                ) : cohorts.length === 0 ? (
                    <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée de cohorte disponible pour cette période.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <HeatLegend />

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-1 text-sm">
                                <thead>
                                    <tr>
                                        {/* Cohort header */}
                                        <th className="min-w-[90px] rounded-lg bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            Cohorte
                                        </th>
                                        <th className="min-w-[60px] rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            Utilisateurs
                                        </th>
                                        {columns.map((col, i) => (
                                            <th
                                                key={col}
                                                className="min-w-[60px] rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                            >
                                                {i === 0 ? "Mois 0" : `+ ${i}m`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cohorts.map(cohort => (
                                        <tr key={cohort.cohort}>
                                            {/* Cohort label */}
                                            <td className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 dark:bg-gray-800/60 dark:text-gray-200">
                                                {formatCohortLabel(cohort.cohort)}
                                            </td>
                                            {/* Initial users */}
                                            <td className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                                                {cohort.initial_users}
                                            </td>
                                            {/* Retention cells */}
                                            {columns.map(col => {
                                                const val = cohort.retention[col] ?? null;
                                                return (
                                                    <td
                                                        key={col}
                                                        className={`rounded-lg px-3 py-2 text-center text-xs font-medium transition-opacity ${
                                                            val !== null
                                                                ? heatColor(val)
                                                                : "bg-gray-50 text-gray-400 dark:bg-gray-800/30"
                                                        }`}
                                                        title={
                                                            val !== null
                                                                ? `${cohort.cohort} — ${col} : ${val.toFixed(1)} %`
                                                                : "Non encore mesurable"
                                                        }
                                                    >
                                                        {val !== null ? `${val.toFixed(0)} %` : "—"}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            * Une valeur <strong>—</strong> indique que la période n'est pas encore écoulée pour cette cohorte et ne peut pas encore être mesurée.
                        </p>
                    </div>
                )}
            </ComponentCard>
        </div>
    );
}
