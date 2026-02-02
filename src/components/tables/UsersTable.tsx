/**
 * @component UsersTable
 * @description Table component for displaying user list with admin actions.
 * Shows user information and provides buttons for editing user details and phone.
 * Supports pagination and loading state with skeleton loaders.
 * 
 * @typedef {Object} UserRow
 * @property {string} id - User ID
 * @property {string|null} name - User name
 * @property {string} email - User email
 * @property {'ADMIN'|'USER'} role - User role
 * @property {string|null} phone - User phone number
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * 
 * @param {Object} props
 * @param {UserRow[]} props.rows - User data
 * @param {Function} [props.onEdit] - Callback when edit button clicked
 * @param {Function} [props.onPhone] - Callback when phone button clicked
 * @param {boolean} [props.loading=false] - Whether loading
 * @param {number} [props.pageSize=10] - Items per page
 * 
 * @example
 * <UsersTable
 *   rows={users}
 *   loading={isLoading}
 *   onEdit={(user) => openEditModal(user)}
 *   onPhone={(user) => openPhoneModal(user)}
 * />
 */
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

function SkeletonLine({ w = "w-28" }: { w?: string }) {
    return <div className={`h-4 ${w} animate-pulse rounded bg-white/10`} />;
}

export function UsersTable({
    rows,
    onEdit,
    onPhone,
    loading = false,
    pageSize = 10,
}: {
    rows: UserRow[];
    onEdit?: (u: UserRow) => void;
    onPhone?: (u: UserRow) => void;
    loading?: boolean;
    pageSize?: number;
}) {
    const columns: ColumnDef<UserRow>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Nombre",
                render: (u) => (loading ? <SkeletonLine w="w-40" /> : u.name ?? "—"),
            },
            {
                key: "email",
                header: "Email",
                render: (u) => (loading ? <SkeletonLine w="w-56" /> : u.email),
            },
            {
                key: "phone",
                header: "Teléfono",
                widthClassName: "w-40",
                render: (u) =>
                    loading ? (
                        <SkeletonLine w="w-24" />
                    ) : u.phone ? (
                        <span>{u.phone}</span>
                    ) : (
                        <span className="italic text-zinc-500">Sin teléfono</span>
                    ),
            },
            {
                key: "role",
                header: "Rol",
                widthClassName: "w-28",
                render: (u) =>
                    loading ? (
                        <SkeletonLine w="w-16" />
                    ) : (
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
                render: (u) => (loading ? <SkeletonLine w="w-32" /> : formatDate(u.createdAt)),
            },
            {
                key: "actions",
                header: "",
                align: "right",
                widthClassName: "w-28",
                render: (u) =>
                    loading ? (
                        <div className="flex justify-end gap-2">
                            <div className="h-8 w-8 animate-pulse rounded-md bg-white/10" />
                            <div className="h-8 w-8 animate-pulse rounded-md bg-white/10" />
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                title="Editar usuario"
                                onClick={() => onEdit?.(u)}
                                className="
                  flex h-8 w-8 items-center justify-center rounded-md
                  bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30
                  transition hover:bg-blue-500/25 hover:text-blue-200
                "
                            >
                                <MaterialIcon name="edit" set="rounded" size={18} />
                            </button>

                            <button
                                type="button"
                                title="Editar teléfono"
                                onClick={() => onPhone?.(u)}
                                className="
                  flex h-8 w-8 items-center justify-center rounded-md
                  bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30
                  transition hover:bg-blue-500/25 hover:text-blue-200
                "
                            >
                                <MaterialIcon name="phone" set="rounded" size={18} />
                            </button>
                        </div>
                    ),
            },
        ],
        [loading, onEdit, onPhone]
    );

    return (
        <DataTable
            title="Usuarios"
            columns={columns}
            rows={rows}
            getRowKey={(u) => u.id}
            pageSize={pageSize}
            emptyText={loading ? "" : "Sin usuarios"}
            showPagination={!loading}
        />
    );
}
