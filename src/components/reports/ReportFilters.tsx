"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { alerts } from "@/lib/alerts";

type Granularity = "day" | "month" | "all";

function Spinner() {
    return (
        <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
        />
    );
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
    const pathname = usePathname();
    const sp = useSearchParams();

    const [isPending, startTransition] = useTransition();
    const [isDownloading, setIsDownloading] = useState(false);

    const [draftFrom, setDraftFrom] = useState(from);
    const [draftTo, setDraftTo] = useState(to);
    const [draftGran, setDraftGran] = useState<Granularity>(granularity);

    const changed = useMemo(
        () => draftFrom !== from || draftTo !== to || draftGran !== granularity,
        [draftFrom, draftTo, draftGran, from, to, granularity]
    );

    const busy = isPending || isDownloading;

    const labelCls = "text-xs uppercase tracking-wide text-zinc-400";
    const fieldBase =
        "h-10 rounded-xl border border-zinc-800/70 bg-zinc-950/55 px-3 text-sm text-zinc-200 " +
        "outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/30";

    const prevApplied = useRef({ from, to, granularity });

    useEffect(() => {
        const hasChanged =
            prevApplied.current.from !== from ||
            prevApplied.current.to !== to ||
            prevApplied.current.granularity !== granularity;

        if (!hasChanged) return;

        prevApplied.current = { from, to, granularity };

        if (from > to) return;

        alerts.success("Report updated");
    }, [from, to, granularity]);

    function apply() {
        if (draftFrom > draftTo) {
            alerts.error("Invalid date range", {
                description: "The start date cannot be after the end date.",
            });
            return;
        }

        const next = new URLSearchParams(sp ? sp.toString() : "");
        next.set("from", draftFrom);
        next.set("to", draftTo);
        next.set("granularity", draftGran);

        startTransition(() => {
            router.replace(`${pathname}?${next.toString()}`);
        });
    }

    async function downloadCsv() {
        if (isDownloading) return;

        if (draftFrom > draftTo) {
            alerts.error("Invalid date range", {
                description: "The start date cannot be after the end date.",
            });
            return;
        }

        const qs = new URLSearchParams();
        qs.set("from", draftFrom);
        qs.set("to", draftTo);
        qs.set("granularity", draftGran);

        const url = `/api/v1/reports/financial-movements.csv?${qs.toString()}`;

        try {
            setIsDownloading(true);

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "text/csv" },
            });

            if (!res.ok) {
                alerts.error("CSV export failed");
                return;
            }

            const text = await res.text();

            if (!text.trim()) {
                alerts.warning("No data for selected range");
                return;
            }

            const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });

            const cd = res.headers.get("content-disposition") ?? "";
            const match = /filename="([^"]+)"/.exec(cd);
            const filename =
                match?.[1] ?? `financial-movements_${draftFrom}_${draftTo}_${draftGran}.csv`;

            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.rel = "noopener";
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(href);

            alerts.success("CSV downloaded");
        } catch {
            alerts.error("Unexpected error while exporting CSV");
        } finally {
            setIsDownloading(false);
        }
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
                    disabled={busy}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Hasta</label>
                <input
                    type="date"
                    value={draftTo}
                    onChange={(e) => setDraftTo(e.target.value)}
                    className={[fieldBase, "w-[180px]"].join(" ")}
                    disabled={busy}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Granularidad</label>
                <div className="relative">
                    <select
                        value={draftGran}
                        onChange={(e) => setDraftGran(e.target.value as Granularity)}
                        className={[fieldBase, "w-[220px] pr-10 bg-zinc-950/70 appearance-none"].join(" ")}
                        disabled={busy}
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
                    disabled={busy}
                    className="h-10 rounded-xl border border-zinc-800/70 bg-white/5 px-4 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                    {isDownloading ? (
                        <>
                            <Spinner />
                            <span>Exporting…</span>
                        </>
                    ) : (
                        <>
                            <MaterialIcon name="download" className="text-[18px] text-zinc-200/90" />
                            <span>Export CSV</span>
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={apply}
                    disabled={!changed || busy}
                    className="h-10 rounded-xl bg-blue-500/20 px-4 text-sm font-semibold text-blue-200 ring-1 ring-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Spinner />
                            <span>Applying…</span>
                        </>
                    ) : (
                        "Apply"
                    )}
                </button>
            </div>
        </section>
    );
}
