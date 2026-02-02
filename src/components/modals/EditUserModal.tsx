"use client";

import { FormModal, type FormField } from "@/components/ui/FormModal";

type Role = "ADMIN" | "USER";

export function EditUserModal({
    open,
    onClose,
    initial,
    loading = false,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    initial: {
        name: string | null;
        role: Role;
    };
    onSubmit: (values: { name: string; role: Role }) => void | Promise<void>;
}) {
    const fields: FormField[] = [
        {
            name: "name",
            label: "Nombre",
            type: "text",
            required: true,
            placeholder: "Nombre del usuario",
            widthClassName: "md:col-span-2",
        },
        {
            name: "role",
            label: "Rol",
            type: "select",
            required: true,
            widthClassName: "md:col-span-2",
            options: [
                { value: "ADMIN", label: "ADMIN" },
                { value: "USER", label: "USER" },
            ],
        },
    ];

    return (
        <FormModal
            open={open}
            title="Editar usuario"
            description="Actualiza el nombre y el rol."
            fields={fields}
            initialValues={{
                name: initial.name ?? "",
                role: initial.role,
            }}
            submitText="Guardar"
            loading={loading}
            onClose={onClose}
            onSubmit={(v) =>
                onSubmit({
                    name: String(v.name ?? "").trim(),
                    role: (v.role as Role) ?? "USER",
                })
            }
            widthClassName="max-w-lg"
        />
    );
}
