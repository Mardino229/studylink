import {useMemo, useState} from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";

export default function Statistics() {
  const { t } = useTranslation('app');
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const today = new Date();

  type Goal = { id: string; title: string; start: string; end: string };
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalStart, setGoalStart] = useState("");
  const [goalEnd, setGoalEnd] = useState("");
  const [goalError, setGoalError] = useState("");

  const { percent, daysElapsed, totalDays, error } = useMemo(() => {
    if (!start || !end) return { percent: 0, daysElapsed: 0, totalDays: 0, error: "" };
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { percent: 0, daysElapsed: 0, totalDays: 0, error: t('statistics.invalid_dates') };
    if (e < s) return { percent: 0, daysElapsed: 0, totalDays: 0, error: t('statistics.end_after_start') };

    const msTotal = e.getTime() - s.getTime();
    const msElapsed = Math.min(Math.max(today.getTime() - s.getTime(), 0), msTotal);
    const total = Math.ceil(msTotal / (1000 * 60 * 60 * 24)) + 1;
    const elapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24)) + (today >= s ? 1 : 0);
    const p = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
    return { percent: Number(p.toFixed(2)), daysElapsed: Math.max(0, elapsed), totalDays: Math.max(0, total), error: "" };
  }, [start, end, today, t]);

  const options: ApexOptions = {
    chart: { type: "radialBar", toolbar: { show: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: { name: { show: false }, value: { fontSize: "28px" } }
      }
    },
    labels: [t('statistics.chart_label')],
    colors: ["#3b82f6"],
  };

  const series = [percent];

  const goalSeries = useMemo(() => {
    return [
      {
        name: t('statistics.chart_goals'),
        data: goals.map(g => ({
          x: g.title,
          y: [new Date(g.start).getTime(), new Date(g.end).getTime()],
        }))
      }
    ];
  }, [goals, t]);

  const goalOptions: ApexOptions = {
    chart: { type: "rangeBar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, barHeight: "60%" },
    },
    xaxis: { type: "datetime" },
    colors: ["#22c55e"],
    dataLabels: { enabled: true, formatter: (_: number, opts) => {
      const { x } = opts.w.config.series?.[opts.seriesIndex]?.data?.[opts.dataPointIndex] || { x: "" } as any;
      return x as string;
    }},
    tooltip: {
      x: { format: "dd MMM yyyy" },
    },
    legend: { show: false },
  };

  function addGoal() {
    setGoalError("");
    if (!goalTitle.trim() || !goalStart || !goalEnd) {
      setGoalError(t('statistics.goal_error_required'));
      return;
    }
    const s = new Date(goalStart); const e = new Date(goalEnd);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      setGoalError(t('statistics.invalid_dates'));
      return;
    }
    if (e < s) {
      setGoalError(t('statistics.end_after_start'));
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setGoals(prev => [...prev, { id, title: goalTitle.trim(), start: goalStart, end: goalEnd }]);
    setGoalTitle(""); setGoalStart(""); setGoalEnd("");
  }

  function removeGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('statistics.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm">{t('statistics.semester_start')}</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm">{t('statistics.semester_end')}</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm">{t('statistics.today')}</label>
          <input type="text" readOnly value={today.toLocaleDateString()} className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <div className="w-72 h-72">
            <Chart options={options} series={series} type="radialBar" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-lg">{t('statistics.progress_label')}: <span className="font-semibold">{percent}%</span></div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{t('statistics.days_elapsed')}: {daysElapsed} / {totalDays}</div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded">
            <div className="h-3 bg-blue-500 rounded" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
        <h2 className="text-xl font-semibold">{t('statistics.goals_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('statistics.goal_title_label')}</label>
            <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Ex: Réviser Chapitre 1" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('statistics.goal_start_label')}</label>
            <input type="date" value={goalStart} onChange={(e) => setGoalStart(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm">{t('statistics.goal_end_label')}</label>
            <input type="date" value={goalEnd} onChange={(e) => setGoalEnd(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>
          <div className="flex items-end">
            <button onClick={addGoal} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">{t('statistics.add_goal')}</button>
          </div>
        </div>
        {goalError && <div className="text-red-500 text-sm">{goalError}</div>}

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Chart options={goalOptions} series={goalSeries as any} type="rangeBar" height={350} />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{t('statistics.goal_list_title')}</h3>
              <ul className="space-y-2">
                {goals.map(g => (
                  <li key={g.id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{new Date(g.start).toLocaleDateString()} → {new Date(g.end).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => removeGoal(g.id)} className="text-red-600 hover:underline text-sm">{t('statistics.goal_delete')}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
