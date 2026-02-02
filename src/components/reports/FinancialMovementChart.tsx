"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function formatMoneyCop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancialMovementsChart({ data }: { data: any }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Ingresos",
        data: data.series.income,
        borderColor: "rgba(16, 185, 129, 0.9)",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: "Gastos",
        data: data.series.expense,
        borderColor: "rgba(244, 63, 94, 0.9)",
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: "Neto",
        data: data.series.net,
        borderColor: "rgba(59, 130, 246, 0.9)",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        labels: { color: "rgba(255,255,255,0.75)" },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatMoneyCop(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        ticks: {
          color: "rgba(255,255,255,0.6)",
          callback: (v: any) => formatMoneyCop(Number(v)),
        },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/55 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
      </div>

      <div className="relative z-10">
        <div className="border-b border-white/5 px-5 py-4">
          <h3 className="text-base font-bold uppercase text-white">Reportes</h3>
        </div>

        <div className="h-[340px] px-5 py-4">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </section>
  );
}
