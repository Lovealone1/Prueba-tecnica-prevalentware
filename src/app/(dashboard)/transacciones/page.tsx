import { cookies } from "next/headers";
import { TransactionsTable, type TransactionRow } from "@/components/tables/TransactionsTable";
import { TransactionsToolbar } from "@/components/transactions/TransactionToolbar";

type Me = { id: string; role: "ADMIN" | "USER"; name?: string | null };

async function getCookieHeader() {
    const cookieStore = await cookies();
    return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}

async function getTransactions(cookieHeader: string): Promise<TransactionRow[]> {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/v1/transactions`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
}

async function getMe(cookieHeader: string): Promise<Me | null> {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}

async function getUsersForAdmin(cookieHeader: string): Promise<Array<{ id: string; name: string | null }>> {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/v1/users`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });
    if (!res.ok) return [];
    const list = await res.json();
    return list.map((u: any) => ({ id: u.id, name: u.name ?? null }));
}

export default async function TransactionsPage() {
    const cookieHeader = await getCookieHeader();

    const [me, rows] = await Promise.all([getMe(cookieHeader), getTransactions(cookieHeader)]);

    if (!me) {
        return (
            <TransactionsTable
                rows={rows}
                pageSize={12}
                headerRight={<TransactionsToolbar viewer={{ id: "", role: "USER", name: null }} users={[]} />}
            />
        );
    }

    const users = me.role === "ADMIN" ? await getUsersForAdmin(cookieHeader) : [];

    return (
        <TransactionsTable
            rows={rows}
            pageSize={12}
            headerRight={<TransactionsToolbar viewer={me} users={users} />}
        />
    );
}
