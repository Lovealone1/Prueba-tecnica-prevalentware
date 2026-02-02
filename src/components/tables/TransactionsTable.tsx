/**
 * @component TransactionsTable
 * @description Table component for displaying transaction list (income and expenses).
 * Renders information with special formatting for COP currency and dates.
 * Supports pagination and loading state with skeleton loaders.
 *
 * @typedef {Object} TransactionRow
 * @property {string} id - Unique transaction ID
 * @property {string} concept - Movement description
 * @property {number} amount - Amount in pesos
 * @property {string} date - ISO format movement date
 * @property {'gasto'|'ingreso'} type - Movement type
 * @property {string} name - Name of responsible user
 *
 * @param {Object} props
 * @param {TransactionRow[]} props.rows - Transaction data
 * @param {React.ReactNode} [props.headerRight] - Element to show in header right
 * @param {Function} [props.onDelete] - Callback when delete button clicked
 * @param {boolean} [props.loading=false] - Whether loading
 * @param {number} [props.pageSize=10] - Items per page
 *
 * @example
 * <TransactionsTable
 *   rows={transactions}
 *   loading={isLoading}
 *   headerRight={<NewTransactionButton />}
 *   onDelete={(tx) => handleDelete(tx)}
 * />
 */
"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export type TransactionRow = {
    id: string;
    concept: string;
    amount: number;
    date: string;
    type: "gasto" | "ingreso";
    name: string;
};

function formatDate(value: string) {
    return value.slice(0, 19).replace("T", " ");
}

function formatMoneyCop(value: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

function SkeletonLine({ w = "w-28" }: { w?: string }) {
    return <div className={`h-4 ${w} animate-pulse rounded bg-white/10`} />;
}

export function TransactionsTable({
    rows,
    headerRight,
    onDelete,
    loading = false,
    pageSize = 10,
}: {
    rows: TransactionRow[];
    headerRight?: React.ReactNode;
    onDelete?: (t: TransactionRow) => void;
    loading?: boolean;
    pageSize?: number;
}) {
    const columns: ColumnDef<TransactionRow>[] = useMemo(
        () => [
            {
                key: "concept",
                header: "Concepto",
                render: (t) => (loading ? <SkeletonLine w="w-48" /> : t.concept),
            },
            {
                key: "type",
                header: "Tipo",
                widthClassName: "w-32",
                render: (t) =>
                    loading ? (
                        <SkeletonLine w="w-20" />
                    ) : (
                        <span
                            className={[
                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
                                t.type === "ingreso"
                                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                                    : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
                            ].join(" ")}
                        >
                            {t.type === "ingreso" ? "INGRESO" : "GASTO"}
                        </span>
                    ),
            },
            {
                key: "amount",
                header: "Monto",
                widthClassName: "w-44",
                align: "right",
                render: (t) =>
                    loading ? (
                        <div className="flex justify-end">
                            <SkeletonLine w="w-24" />
                        </div>
                    ) : (
                        <span className="text-zinc-200">{formatMoneyCop(t.amount)}</span>
                    ),
            },
            {
                key: "date",
                header: "Fecha",
                widthClassName: "w-44",
                render: (t) => (loading ? <SkeletonLine w="w-32" /> : formatDate(t.date)),
            },
            {
                key: "name",
                header: "Usuario",
                widthClassName: "w-56",
                render: (t) => (loading ? <SkeletonLine w="w-40" /> : t.name?.trim() || "—"),
            },
            {
                key: "actions",
                header: "",
                align: "right",
                widthClassName: "w-20",
                render: (t) =>
                    loading ? (
                        <div className="flex justify-end">
                            <div className="h-8 w-8 animate-pulse rounded-md bg-white/10" />
                        </div>
                    ) : (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                title="Eliminar transacción"
                                onClick={() => onDelete?.(t)}
                                className="
                  flex h-8 w-8 items-center justify-center rounded-md
                  bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30
                  transition hover:bg-rose-500/25 hover:text-rose-200
                "
                            >
                                <MaterialIcon name="delete" set="rounded" size={18} />
                            </button>
                        </div>
                    ),
            },
        ],
        [loading, onDelete]
    );

    return (
        <DataTable
            title="Transacciones"
            headerRight={headerRight}
            columns={columns}
            rows={rows}
            getRowKey={(t) => t.id}
            pageSize={pageSize}
            emptyText={loading ? "" : "Sin transacciones"}
            showPagination={!loading}
            footerRight={({ pageRows }) => {
                const total = pageRows.reduce((acc, t) => {
                    const signed = t.type === "ingreso" ? t.amount : -t.amount;
                    return acc + signed;
                }, 0);

                return (
                    <div className="rounded-xl border border-zinc-800/70 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                        <span className="mr-2 uppercase tracking-wide text-zinc-400">Total:</span>
                        <span className="font-semibold text-white">{formatMoneyCop(total)}</span>
                    </div>
                );
            }}
        />
    );
}
