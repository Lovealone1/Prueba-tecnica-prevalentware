"use client";

import { FormModal, type FormField } from "@/components/ui/FormModal";

export function SetPhoneModal({
    open,
    onClose,
    initialPhone,
    loading = false,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    initialPhone?: string | null;
    loading?: boolean;
    onSubmit: (values: { phone: string }) => void | Promise<void>;
}) {
    const fields: FormField[] = [
        {
            name: "phone",
            label: "Teléfono",
            type: "tel",
            required: true,
            placeholder: "+57 300 000 0000",
            widthClassName: "md:col-span-2",
        },
    ];

    return (
        <FormModal
            open={open}
            title="Actualizar teléfono"
            description="Guarda el número de contacto del usuario."
            fields={fields}
            initialValues={{ phone: initialPhone ?? "" }}
            submitText="Guardar"
            loading={loading}
            onClose={onClose}
            onSubmit={(v) => onSubmit(v as any)}
            widthClassName="max-w-md"
        />
    );
}
