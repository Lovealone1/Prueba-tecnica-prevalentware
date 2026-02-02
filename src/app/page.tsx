import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";

export default async function HomePage() {
    const session = await auth.api.getSession({
        headers: (await headers()) as any,
    });

    if (!session?.user?.id) redirect("/login");

    redirect("/transacciones");
}
