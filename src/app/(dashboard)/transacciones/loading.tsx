import { TransactionsTable, type TransactionRow } from "@/components/tables/TransactionsTable";

const SKELETON_ROWS: TransactionRow[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `skeleton-${i}`,
    concept: "",
    amount: 0,
    date: new Date().toISOString(),
    type: "gasto",
    name: "",
}));

export default function Loading() {
    return <TransactionsTable rows={SKELETON_ROWS} loading pageSize={12} />;
}
