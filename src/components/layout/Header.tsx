"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { authClient } from "@/lib/auth-client";

export function Header() {
    const onLogout = async () => {
        try {
            await authClient.signOut();
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <header className="sticky top-0 z-20 border-b border-zinc-800/70 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex h-14 w-full items-center justify-between px-6">
                <Breadcrumbs />

                <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/70 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
