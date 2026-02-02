"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { alerts } from "@/lib/alerts";
import { TransactionsTable, type TransactionRow } from "@/components/tables/TransactionsTable";
import { TransactionsToolbar } from "@/components/transactions/TransactionToolbar";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

type Viewer = { id: string; role: "ADMIN" | "USER"; name?: string | null };

export function TransactionsDeleteWrapper({
    viewer,
    users,
    initialRows,
}: {
    viewer: Viewer;
    users: Array<{ id: string; name: string | null }>;
    initialRows: TransactionRow[];
}) {
    const router = useRouter();
    const [rows, setRows] = useState<TransactionRow[]>(initialRows);
    const [isPending, startTransition] = useTransition();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [target, setTarget] = useState<TransactionRow | null>(null);

    const headerRight = useMemo(
        () => <TransactionsToolbar viewer={viewer} users={users} />,
        [viewer, users]
    );

    function requestDelete(t: TransactionRow) {
        setTarget(t);
        setDeleteOpen(true);
    }

    async function confirmDelete() {
        if (!target) return;

        const t = target;
        const prev = rows;

        setDeleteLoading(true);
        setRows((r) => r.filter((x) => x.id !== t.id));

        try {
            const res = await fetch(`/api/v1/transactions?id=${encodeURIComponent(t.id)}`, {
                method: "DELETE",
            });

            if (res.status === 204) {
                setDeleteOpen(false);
                setTarget(null);
                alerts.success("Transacción eliminada", {
                    description: "Se eliminó correctamente.",
                });
                startTransition(() => router.refresh());
                return;
            }

            if (res.status === 403) {
                alerts.error("Acceso denegado", {
                    description: "No puedes eliminar transacciones de otro usuario.",
                });
            } else if (res.status === 404) {
                alerts.error("No encontrada", {
                    description: "La transacción ya no existe.",
                });
            } else {
                alerts.error("Error", { description: "No se pudo eliminar la transacción." });
            }

            setRows(prev);
        } catch {
            setRows(prev);
            alerts.error("Error de red", { description: "No se pudo conectar al servidor." });
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <>
            <TransactionsTable
                rows={rows}
                pageSize={11}
                headerRight={headerRight}
                onDelete={requestDelete}
                loading={isPending}
            />

            <ConfirmDeleteModal
                open={deleteOpen}
                loading={deleteLoading}
                title="Eliminar transacción"
                description={
                    target
                        ? `Se eliminará "${target.concept}". Esta acción no se puede deshacer.`
                        : "Esta acción no se puede deshacer."
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                onClose={() => {
                    if (deleteLoading) return;
                    setDeleteOpen(false);
                    setTarget(null);
                }}
                onConfirm={confirmDelete}
            />
        </>
    );
}
