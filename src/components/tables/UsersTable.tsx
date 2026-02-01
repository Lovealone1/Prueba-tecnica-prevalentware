"use client";

import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export type UserRow = {
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "USER";
    phone: string | null;
    createdAt: string;
    updatedAt: string;
};

function formatDate(value: string) {
    return value.slice(0, 19).replace("T", " ");
}

export function UsersTable({ rows }: { rows: UserRow[] }) {
    const columns: ColumnDef<UserRow>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Nombre",
                render: (u) => u.name ?? "—",
            },
            {
                key: "email",
                header: "Email",
                render: (u) => u.email,
            },
            {
                key: "phone",
                header: "Teléfono",
                widthClassName: "w-40",
                render: (u) =>
                    u.phone ? (
                        <span>{u.phone}</span>
                    ) : (
                        <span className="italic text-zinc-500">Sin teléfono</span>
                    ),
            },
            {
                key: "role",
                header: "Rol",
                widthClassName: "w-28",
                render: (u) => (
                    <span className="rounded-md border border-zinc-800/70 bg-white/5 px-2 py-1 text-xs">
                        {u.role}
                    </span>
                ),
            },
            {
                key: "createdAt",
                header: "Creado",
                align: "left",
                widthClassName: "w-44",
                render: (u) => formatDate(u.createdAt),
            },
            {
                key: "actions",
                header: "",
                align: "right",
                widthClassName: "w-28",
                render: () => (
                    <div className="flex justify-end gap-2">
                        {/* Editar */}
                        <button
                            type="button"
                            title="Editar usuario"
                            className="
                            flex h-8 w-8 items-center justify-center
                            rounded-md
                            bg-blue-500/15 text-blue-300
                            ring-1 ring-blue-500/30
                            transition
                            hover:bg-blue-500/25 hover:text-blue-200
                            "
                        >
                            <MaterialIcon name="edit" set="rounded" size={18} />
                        </button>

                        {/* Teléfono */}
                        <button
                            type="button"
                            title="Agregar teléfono"
                            className="
                            flex h-8 w-8 items-center justify-center
                            rounded-md
                            bg-blue-500/15 text-blue-300
                            ring-1 ring-blue-500/30
                            transition
                            hover:bg-blue-500/25 hover:text-blue-200
                            "
                        >
                            <MaterialIcon name="phone" set="rounded" size={18} />
                        </button>
                    </div>
                ),
            }
            ,
        ],
        []
    );

    return (
        <DataTable
            title="Usuarios"
            columns={columns}
            rows={rows}
            getRowKey={(u) => u.id}
            pageSize={10}
            emptyText="Sin usuarios"
        />
    );
}
