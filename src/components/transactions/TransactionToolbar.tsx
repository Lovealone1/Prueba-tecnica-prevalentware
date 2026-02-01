"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";

type Viewer = { id: string; role: "ADMIN" | "USER"; name?: string | null };

export function TransactionsToolbar({
    viewer,
    users,
}: {
    viewer: Viewer;
    users: Array<{ id: string; name: string | null }>;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function handleSubmit(values: {
        amount: string;
        concept: string;
        date: string;
        type: "INCOME" | "EXPENSE";
        userId?: string;
    }) {
        setErr(null);
        setLoading(true);

        try {
            const payload: any = {
                concept: values.concept,
                amount: Number(values.amount),
                type: values.type,
            };

            if (values.date) payload.date = values.date;

            const qs = new URLSearchParams();
            if (viewer.role === "ADMIN" && values.userId) qs.set("userId", values.userId);

            const url = qs.toString()
                ? `/api/v1/transactions?${qs.toString()}`
                : `/api/v1/transactions`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? "No se pudo crear la transacción");
            }

            setOpen(false);
            router.refresh(); 
        } catch (e: any) {
            setErr(e?.message ?? "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            {err ? (
                <span className="mr-2 text-xs text-rose-200">{err}</span>
            ) : null}

            <button
                type="button"
                onClick={() => setOpen(true)}
                className="
          inline-flex items-center gap-2
          rounded-xl
          bg-blue-500/15 text-blue-200
          ring-1 ring-blue-500/30
          px-3 py-2 text-sm font-semibold
          transition hover:bg-blue-500/25
        "
            >
                <MaterialIcon name="add" set="rounded" size={18} />
                Nueva transacción
            </button>

            <NewTransactionModal
                open={open}
                onClose={() => setOpen(false)}
                loading={loading}
                viewerRole={viewer.role}
                users={users}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
