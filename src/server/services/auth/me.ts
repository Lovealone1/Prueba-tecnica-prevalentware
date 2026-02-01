import type { Me } from "@/types/auth";

export async function fetchMe(signal?: AbortSignal): Promise<Me | null> {
    const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        credentials: "include",
        signal,
    });

    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`Failed to load me: ${res.status}`);

    const data = await res.json();

    return {
        id: data.id,
        email: data.email,
        name: data.name ?? null,
        role: data.role, // "ADMIN" | "USER"
    };
}
