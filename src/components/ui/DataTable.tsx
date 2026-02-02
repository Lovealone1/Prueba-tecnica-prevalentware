"use client";

import { useMemo, useState } from "react";

export type ColumnDef<T> = {
    key: string;
    header: string;
    widthClassName?: string;
    align?: "left" | "center" | "right";
    render: (row: T) => React.ReactNode;
};

type FooterCtx<T> = {
    pageRows: T[];
    page: number;
    totalPages: number;
    totalRows: number;
    pageSize: number;
};

type DataTableProps<T> = {
    title?: string;
    headerRight?: React.ReactNode;
    columns: ColumnDef<T>[];
    rows: T[];
    getRowKey: (row: T) => string;

    pageSize?: number;
    showPagination?: boolean;
    emptyText?: string;

    // ✅ nuevo: footer slot para cosas como "Total"
    footerRight?: (ctx: FooterCtx<T>) => React.ReactNode;
};

export function DataTable<T>({
    title,
    headerRight,
    columns,
    rows,
    getRowKey,
    pageSize = 10,
    showPagination = true,
    emptyText = "Sin datos",
    footerRight,
}: DataTableProps<T>) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const safePage = Math.min(page, totalPages);

    const pageRows = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return rows.slice(start, start + pageSize);
    }, [rows, safePage, pageSize]);

    const alignClass = (align?: ColumnDef<T>["align"]) => {
        if (align === "center") return "text-center";
        if (align === "right") return "text-right";
        return "text-left";
    };

    const btnBase =
        "flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800/70 bg-white/5 text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

    const footerCtx: FooterCtx<T> = {
        pageRows,
        page: safePage,
        totalPages,
        totalRows: rows.length,
        pageSize,
    };

    return (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/55 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
                <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
            </div>

            <div className="relative z-10">
                {title ? (
                    <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                        <h3 className="text-base font-bold uppercase text-white">{title}</h3>
                        <div className="flex items-center gap-2">{headerRight}</div>
                    </div>
                ) : (
                    <div className="border-b border-white/5" />
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-zinc-400">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={[
                                            "px-5 py-3 font-semibold",
                                            "border-b border-white/5",
                                            col.widthClassName ?? "",
                                            alignClass(col.align),
                                        ].join(" ")}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-5 py-10 text-center text-sm text-zinc-400"
                                    >
                                        {emptyText}
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((row) => (
                                    <tr
                                        key={getRowKey(row)}
                                        className="border-b border-white/5 text-sm text-zinc-200 transition hover:bg-white/5"
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={["px-5 py-3 align-middle", alignClass(col.align)].join(" ")}
                                            >
                                                {col.render(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {showPagination && rows.length > 0 ? (
                    <div className="flex items-center justify-between gap-3 px-5 py-4">
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span>
                                Página <span className="text-white">{safePage}</span> de{" "}
                                <span className="text-white">{totalPages}</span>
                            </span>

                            <span className="text-zinc-600">•</span>

                            <span>
                                <span className="text-white">{rows.length}</span> registros
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* ✅ slot del padre (ej: Total visible) */}
                            {footerRight ? <div>{footerRight(footerCtx)}</div> : null}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage(1)}
                                    disabled={safePage === 1}
                                    className={btnBase}
                                    aria-label="Primera página"
                                    title="Primera"
                                >
                                    ⟪
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className={btnBase}
                                    aria-label="Página anterior"
                                    title="Anterior"
                                >
                                    ⟨
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className={btnBase}
                                    aria-label="Página siguiente"
                                    title="Siguiente"
                                >
                                    ⟩
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPage(totalPages)}
                                    disabled={safePage === totalPages}
                                    className={btnBase}
                                    aria-label="Última página"
                                    title="Última"
                                >
                                    ⟫
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
