"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Granularity = "day" | "month" | "all";

function ymd(d: Date) {
    return d.toISOString().slice(0, 10);
}

export function ReportFilters({
    from,
    to,
    granularity,
}: {
    from: string;
    to: string;
    granularity: Granularity;
}) {
    const router = useRouter();
    const sp = useSearchParams();

    const [draftFrom, setDraftFrom] = useState(from);
    const [draftTo, setDraftTo] = useState(to);
    const [draftGran, setDraftGran] = useState<Granularity>(granularity);

    const defaults = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { from: ymd(start), to: ymd(now), granularity: "day" as Granularity };
    }, []);

    const labelCls = "text-xs uppercase tracking-wide text-zinc-400";
    const fieldBase =
        "h-10 rounded-xl border border-zinc-800/70 bg-zinc-950/55 px-3 text-sm text-zinc-200 " +
        "outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/30";

    function apply() {
        const next = new URLSearchParams(sp ? sp.toString() : "");
        next.set("from", draftFrom);
        next.set("to", draftTo);
        next.set("granularity", draftGran);
        router.push(`?${next.toString()}`);
    }

    function reset() {
        setDraftFrom(defaults.from);
        setDraftTo(defaults.to);
        setDraftGran(defaults.granularity);

        const next = new URLSearchParams(sp ? sp.toString() : "");
        next.set("from", defaults.from);
        next.set("to", defaults.to);
        next.set("granularity", defaults.granularity);
        router.push(`?${next.toString()}`);
    }

    function downloadCsv() {
        const qs = new URLSearchParams();
        qs.set("from", draftFrom);
        qs.set("to", draftTo);
        qs.set("granularity", draftGran);

        const url = `/api/v1/reports/financial-movements.csv?${qs.toString()}`;

        const a = document.createElement("a");
        a.href = url;
        a.rel = "noopener";

        a.download = `financial-movements_${draftFrom}_${draftTo}_${draftGran}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    return (
        <section className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
                <label className={labelCls}>Desde</label>
                <input
                    type="date"
                    value={draftFrom}
                    onChange={(e) => setDraftFrom(e.target.value)}
                    className={[fieldBase, "w-[180px]"].join(" ")}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Hasta</label>
                <input
                    type="date"
                    value={draftTo}
                    onChange={(e) => setDraftTo(e.target.value)}
                    className={[fieldBase, "w-[180px]"].join(" ")}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Granularidad</label>
                <div className="relative">
                    <select
                        value={draftGran}
                        onChange={(e) => setDraftGran(e.target.value as Granularity)}
                        className={[fieldBase, "w-[220px] pr-10 bg-zinc-950/70 appearance-none"].join(" ")}
                    >
                        <option value="day">Día</option>
                        <option value="month">Mes</option>
                        <option value="all">Todo</option>
                    </select>

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        ▾
                    </span>
                </div>
            </div>

            <div className="flex items-end gap-2">
                <button
                    type="button"
                    onClick={downloadCsv}
                    className="h-10 rounded-xl border border-zinc-800/70 bg-white/5 px-3 text-sm text-zinc-200 hover:bg-white/10"
                    title="Descargar reporte CSV"
                >
                    Descargar CSV
                </button>

                <button
                    type="button"
                    onClick={reset}
                    className="h-10 rounded-xl border border-zinc-800/70 bg-white/5 px-3 text-sm text-zinc-200 hover:bg-white/10"
                >
                    Reset
                </button>

                <button
                    type="button"
                    onClick={apply}
                    className="h-10 rounded-xl bg-blue-500/20 px-3 text-sm font-semibold text-blue-200 ring-1 ring-blue-500/30 hover:bg-blue-500/30"
                >
                    Aplicar
                </button>
            </div>
        </section>
    );
}
