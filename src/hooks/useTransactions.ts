"use client";

import { useEffect, useMemo, useState } from "react";
import type { TransactionRow } from "@/components/tables/TransactionsTable";

type State = {
    loading: boolean;
    error: string | null;
    rows: TransactionRow[];
};

export function useTransactions(params?: { userId?: string }) {
    const [state, setState] = useState<State>({
        loading: true,
        error: null,
        rows: [],
    });

    const query = useMemo(() => {
        const qs = new URLSearchParams();
        if (params?.userId) qs.set("userId", params.userId);
        const s = qs.toString();
        return s ? `?${s}` : "";
    }, [params?.userId]);

    useEffect(() => {
        let alive = true;

        async function run() {
            setState((s) => ({ ...s, loading: true, error: null }));

            try {
                const res = await fetch(`/api/v1/transactions${query}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    const msg = body?.message ?? "No se pudo cargar el listado";
                    throw new Error(msg);
                }

                const data = (await res.json()) as TransactionRow[];
                if (!alive) return;

                setState({ loading: false, error: null, rows: data });
            } catch (e: any) {
                if (!alive) return;
                setState({ loading: false, error: e?.message ?? "Error", rows: [] });
            }
        }

        run();
        return () => {
            alive = false;
        };
    }, [query]);

    return state;
}
