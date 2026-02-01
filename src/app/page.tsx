import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";

export default async function RootPage() {
    const session = await auth.api.getSession({
        headers: (await headers()) as any,
    });

    if (session?.user?.id) {
        redirect("/"); 
    }

    redirect("/login");
}
