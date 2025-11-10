import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";

export default function MonthlyTarget() {
  const series = [75.55];

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains("dark"));
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 280,
      type: "radialBar",
      background: "transparent",
      foreColor: isDark ? "#CBD5E1" : undefined,
    },
    series: [67],
    colors: [isDark ? "#7AA2FF" : "#465FFF"],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "70%",
          background: isDark ? "rgba(255,255,255,0.06)" : "#E4E7EC",
        },
        track: {
          background: isDark ? "rgba(255,255,255,0.06)" : undefined,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: isDark ? 0.12 : 0.15,
          },
        },
        dataLabels: {
          name: {
            offsetY: -10,
            fontSize: "13px",
            color: isDark ? "#94A3B8" : undefined,
          },
          value: {
            color: isDark ? "#F8FAFC" : "#1D2939",
            fontSize: "30px",
            show: true,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        gradientToColors: [isDark ? "#7AA2FF" : "#465FFF"],
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  }), [isDark]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-background sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Progression globale
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Suivez votre progression globale
            </p>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            +10%
          </span>
        </div>
      </div>
    </div>
  );
}
