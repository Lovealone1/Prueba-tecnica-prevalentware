"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Me } from "@/types/auth";
import { fetchMe } from "@/server/services/auth/me";

type AuthState = {
    me: Me | null;
    loading: boolean;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
    children,
    initialMe = null,
}: {
    children: React.ReactNode;
    initialMe?: Me | null;
}) {
    const [me, setMe] = useState<Me | null>(initialMe);
    const [loading, setLoading] = useState<boolean>(!initialMe);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchMe();
            setMe(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialMe) {
            refresh().catch(() => { });
            return;
        }

        refresh().catch(() => {
            setMe(null);
            setLoading(false);
        });
    }, []);

    const value = useMemo(() => ({ me, loading, refresh }), [me, loading, refresh]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
    return ctx;
}
