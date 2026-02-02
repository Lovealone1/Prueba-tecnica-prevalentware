/**
 * @fileoverview Dashboard layout - protected route that wraps all authenticated pages.
 * Retrieves user session and initializes AppShell with user data.
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth/auth";
import { AppShell } from "@/components/layout/AppShell";
import type { Me } from "@/types/auth";

/**
 * Dashboard layout component - requires authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: (await headers()) as any,
    });

    if (!session?.user?.id) {
        redirect("/login");
    }

    const initialMe: Me = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        role: (session.user as any).role ?? "USER",
    };

    return <AppShell initialMe={initialMe}>{children}</AppShell>;
}
