import { cookies } from "next/headers";
import { PermissionAlert } from "@/components/ui/PermissionAlert";
import type { TransactionRow } from "@/components/tables/TransactionsTable";
import { TransactionsDeleteWrapper } from "@/components/transactions/TransactionsDeleteWrapper";

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

async function getUsersForAdmin(
    cookieHeader: string
): Promise<Array<{ id: string; name: string | null }>> {
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

    const [me, initialRows] = await Promise.all([
        getMe(cookieHeader),
        getTransactions(cookieHeader),
    ]);

    const viewer: Me = me ?? { id: "", role: "USER", name: null };
    const users = me?.role === "ADMIN" ? await getUsersForAdmin(cookieHeader) : [];

    return (
        <>
            <PermissionAlert />
            <TransactionsDeleteWrapper viewer={viewer} users={users} initialRows={initialRows} />
        </>
    );
}
