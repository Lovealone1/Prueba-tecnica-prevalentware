"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UsersTable, type UserRow } from "@/components/tables/UsersTable";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { SetPhoneModal } from "@/components/modals/SetPhoneModal";

export function UsersAdminClient({ rows }: { rows: UserRow[] }) {
    const router = useRouter();

    const [selected, setSelected] = useState<UserRow | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [phoneOpen, setPhoneOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const initialEdit = useMemo(
        () => ({
            name: selected?.name ?? "",
            role: (selected?.role ?? "USER") as "ADMIN" | "USER",
        }),
        [selected]
    );

    async function patchUser(userId: string, body: Record<string, any>) {
        const qs = new URLSearchParams({ userId });
        const res = await fetch(`/api/v1/users?${qs.toString()}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message ?? "No se pudo actualizar el usuario");
        }

        return res.json().catch(() => null);
    }

    async function patchPhone(userId: string, phone: string | null) {
        const qs = new URLSearchParams({ userId });
        const res = await fetch(`/api/v1/users/phone?${qs.toString()}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message ?? "No se pudo actualizar el teléfono");
        }

        return res.json().catch(() => null);
    }

    return (
        <>
            <UsersTable
                rows={rows}
                onEdit={(u) => {
                    setSelected(u);
                    setEditOpen(true);
                }}
                onPhone={(u) => {
                    setSelected(u);
                    setPhoneOpen(true);
                }}
            />

            <EditUserModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                loading={loading}
                initial={initialEdit}
                onSubmit={async ({ name, role }) => {
                    if (!selected) return;

                    const body: any = {};
                    if (name.trim() !== (selected.name ?? "").trim()) body.name = name.trim();
                    if (role !== selected.role) body.role = role;

                    if (Object.keys(body).length === 0) {
                        setEditOpen(false);
                        return;
                    }

                    setLoading(true);
                    try {
                        await patchUser(selected.id, body);
                        setEditOpen(false);
                        router.refresh();
                    } finally {
                        setLoading(false);
                    }
                }}
            />

            <SetPhoneModal
                open={phoneOpen}
                onClose={() => setPhoneOpen(false)}
                loading={loading}
                initialPhone={selected?.phone ?? ""}
                onSubmit={async ({ phone }) => {
                    if (!selected) return;

                    const normalized = phone.trim();
                    const valueToSend = normalized.length === 0 ? null : normalized;

                    setLoading(true);
                    try {
                        await patchPhone(selected.id, valueToSend);
                        setPhoneOpen(false);
                        router.refresh();
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </>
    );
}
