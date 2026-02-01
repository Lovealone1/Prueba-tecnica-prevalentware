import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UsersAdminClient } from "@/components/users/UsersAdminClient";
import type { UserRow } from "@/components/tables/UsersTable";

type Me = { id: string; role: "ADMIN" | "USER" };

async function getCookieHeader() {
    const cookieStore = await cookies();
    return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
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

async function getUsers(cookieHeader: string): Promise<UserRow[]> {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/v1/users`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function UsuariosPage() {
    const cookieHeader = await getCookieHeader();
    const me = await getMe(cookieHeader);

    if (!me) redirect("/login"); 
    if (me.role !== "ADMIN") redirect("/transacciones");

    const users = await getUsers(cookieHeader);

    return <UsersAdminClient rows={users} />;
}
