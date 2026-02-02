"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";

type FieldType = "text" | "number" | "date" | "select" | "tel";

export type FormField = {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    widthClassName?: string; // ej: "md:col-span-2"
    options?: Array<{ value: string; label: string }>; // select
};

type Values = Record<string, string>;

function cx(...s: Array<string | false | null | undefined>) {
    return s.filter(Boolean).join(" ");
}

export function FormModal({
    open,
    title,
    description,
    fields,
    initialValues,
    submitText = "Guardar",
    cancelText = "Cancelar",
    loading = false,
    onClose,
    onSubmit,
    widthClassName,
}: {
    open: boolean;
    title: string;
    description?: string;
    fields: FormField[];
    initialValues?: Values;
    submitText?: string;
    cancelText?: string;
    loading?: boolean;
    widthClassName?: string;

    onClose: () => void;
    onSubmit: (values: Values) => void | Promise<void>;
}) {
    const defaults = useMemo<Values>(() => {
        const base: Values = {};
        for (const f of fields) base[f.name] = "";
        return base;
    }, [fields]);

    const [values, setValues] = useState<Values>({ ...defaults, ...(initialValues ?? {}) });

    useEffect(() => {
        if (open) setValues({ ...defaults, ...(initialValues ?? {}) });
    }, [open, defaults, initialValues]);

    const fieldBase =
        "h-10 w-full rounded-xl border border-zinc-800/70 bg-zinc-950/55 px-3 text-sm text-zinc-200 " +
        "outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/30";

    function set(name: string, v: string) {
        setValues((prev) => ({ ...prev, [name]: v }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        for (const f of fields) {
            if (f.required && !values[f.name]?.trim()) return;
        }

        onSubmit(values);
    }

    return (
        <Modal
            open={open}
            title={title}
            description={description}
            onClose={onClose}
            widthClassName={widthClassName}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-10 rounded-xl border border-zinc-800/70 bg-white/5 px-4 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        form="form-modal"
                        disabled={loading}
                        className="h-10 rounded-xl bg-blue-500/20 px-4 text-sm font-semibold text-blue-200 ring-1 ring-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                    >
                        {submitText}
                    </button>
                </>
            }
        >
            <form id="form-modal" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {fields.map((f) => (
                        <div key={f.name} className={cx("flex flex-col gap-1", f.widthClassName)}>
                            <label className="text-xs uppercase tracking-wide text-zinc-400">
                                {f.label} {f.required ? <span className="text-rose-300">*</span> : null}
                            </label>

                            {f.type === "select" ? (
                                <select
                                    value={values[f.name] ?? ""}
                                    onChange={(e) => set(f.name, e.target.value)}
                                    className={cx(fieldBase, "appearance-none bg-zinc-950/70")}
                                    required={f.required}
                                >
                                    {(f.options ?? []).map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type}
                                    value={values[f.name] ?? ""}
                                    onChange={(e) => set(f.name, e.target.value)}
                                    placeholder={f.placeholder}
                                    className={fieldBase}
                                    required={f.required}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </form>
        </Modal>
    );
}
