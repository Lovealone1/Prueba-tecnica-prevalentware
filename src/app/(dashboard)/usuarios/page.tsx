import { cookies } from "next/headers";
import { UsersTable, type UserRow } from "@/components/tables/UsersTable";

async function getUsers(): Promise<UserRow[]> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/v1/users`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
}

export default async function UsuariosPage() {
    const users = await getUsers();
    return <UsersTable rows={users} />;
}
