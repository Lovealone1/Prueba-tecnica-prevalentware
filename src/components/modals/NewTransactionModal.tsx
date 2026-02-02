/**
 * @component NewTransactionModal
 * @description Modal for creating new transactions (income or expense).
 * Provides dynamic fields based on user role - admins can assign transactions to other users.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {boolean} [props.loading=false] - Whether submitting
 * @param {'ADMIN'|'USER'} props.viewerRole - Current user role
 * @param {Array<{id:string, name:string|null}>} [props.users=[]] - Available users list (for admins)
 * @param {Function} props.onSubmit - Callback with form data
 * 
 * @example
 * <NewTransactionModal
 *   open={isOpen}
 *   viewerRole="ADMIN"
 *   users={usersList}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={(data) => createTransaction(data)}
 * />
 */
"use client";

import { FormModal, type FormField } from "@/components/ui/FormModal";

type Role = "ADMIN" | "USER";

export function NewTransactionModal({
    open,
    onClose,
    loading = false,
    viewerRole,
    users = [],
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    loading?: boolean;

    viewerRole: Role;
    users?: Array<{ id: string; name: string | null }>;

    onSubmit: (values: {
        amount: string;
        concept: string;
        date: string;
        type: "INCOME" | "EXPENSE";
        userId?: string; 
    }) => void | Promise<void>;
}) {
    const baseFields: FormField[] = [
        { name: "amount", label: "Monto", type: "number", required: true },
        { name: "concept", label: "Concepto", type: "text", required: true, widthClassName: "md:col-span-2" },
        { name: "date", label: "Fecha", type: "date", required: false }, 
        {
            name: "type",
            label: "Tipo",
            type: "select",
            required: true,
            options: [
                { value: "INCOME", label: "INGRESO" },
                { value: "EXPENSE", label: "GASTO" },
            ],
        },
    ];

    // Admin-only field to assign transaction to another user
    const adminField: FormField[] =
        viewerRole === "ADMIN"
            ? [
                {
                    name: "userId",
                    label: "Usuario (opcional)",
                    type: "select",
                    required: false,
                    widthClassName: "md:col-span-2",
                    options: [
                        { value: "", label: "Selecciona..." },
                        ...users.map((u) => ({ value: u.id, label: u.name?.trim() || u.id })),
                    ],
                },
            ]
            : [];

    const fields = [...baseFields, ...adminField];

    return (
        <FormModal
            open={open}
            title="Nuevo movimiento"
            description="Registra un ingreso o gasto."
            fields={fields}
            initialValues={{
                date: new Date().toISOString().slice(0, 10),
                type: "EXPENSE",
                userId: "",
            }}
            submitText="Ingresar"
            loading={loading}
            onClose={onClose}
            onSubmit={(v) => onSubmit(v as any)}
            widthClassName="max-w-xl"
        />
    );
}
