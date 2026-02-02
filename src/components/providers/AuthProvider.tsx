"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Me } from "@/types/auth";
import { fetchMe } from "@/server/services/auth/me";

/**
 * @typedef {Object} AuthState
 * @property {Me|null} me - Current authenticated user data
 * @property {boolean} loading - Whether user information is being loaded
 * @property {Function} refresh - Function to refresh authenticated user data
 */
type AuthState = {
    me: Me | null;
    loading: boolean;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * @component AuthProvider
 * @description Context provider for managing authentication and user state.
 * Provides authenticated user information, loading state, and function to refresh user data.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {Me|null} [props.initialMe] - Initial user data (obtained from server)
 * 
 * @example
 * <AuthProvider initialMe={userFromServer}>
 *   <Dashboard />
 * </AuthProvider>
 */
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

/**
 * Hook to access the authentication context
 * @returns {AuthState} Authentication state with user data and functions
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * const { me, loading, refresh } = useAuth();
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
    return ctx;
}
