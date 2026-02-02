"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AlertsProvider } from "@/components/providers/AlertsProvider";
import type { Me } from "@/types/auth";

export function AppShell({
    children,
    initialMe,
}: {
    children: React.ReactNode;
    initialMe: Me;
}) {
    return (
        <AuthProvider initialMe={initialMe}>
            <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Header />

                    <main className="min-w-0 flex-1 px-6 py-6">
                        {children}
                    </main>
                </div>
            </div>

            <AlertsProvider />
        </AuthProvider>
    );
}
