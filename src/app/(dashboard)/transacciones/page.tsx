import { cookies } from "next/headers";
import { TransactionsTable, type TransactionRow } from "@/components/tables/TransactionsTable";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

async function getTransactions(): Promise<TransactionRow[]> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/v1/transactions`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function TransactionsPage() {
    const rows = await getTransactions();

    return (
        <TransactionsTable
            rows={rows}
            pageSize={12}
            headerRight={
                <Link
                    href="/transactions/new"
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
                </Link>
            }
        />
    );
}
