/**
 * @hook useTransactions
 * @description Custom hook for fetching and managing transaction list.
 * Handles loading, error, and pagination states automatically.
 * 
 * @param {Object} [params] - Optional parameters
 * @param {string} [params.userId] - Filter transactions by user ID (admin only)
 * 
 * @returns {Object} Transaction state
 * @returns {boolean} returns.loading - Whether transactions are loading
 * @returns {string|null} returns.error - Error message if any
 * @returns {TransactionRow[]} returns.rows - Transaction data
 * 
 * @example
 * const { loading, error, rows } = useTransactions();
 * 
 * // With user filter
 * const adminTransactions = useTransactions({ userId: "user-123" });
 */
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
                    const msg = body?.message ?? "Could not load transaction list";
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
