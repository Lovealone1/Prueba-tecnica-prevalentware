"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ConfirmDeleteModal({
    open,
    title = "Confirmar eliminación",
    description,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    loading = false,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-[100]">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={() => !loading && onClose()}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className="
                        w-full max-w-md
                        rounded-2xl
                        border border-zinc-800/70
                        bg-zinc-950/85
                        shadow-2xl
                        ring-1 ring-white/5
                        overflow-hidden
                    "
                >
                    <div className="flex items-start gap-3 px-5 py-4">
                        <div
                            className="
                                mt-0.5 flex h-9 w-9 items-center justify-center
                                rounded-xl
                                bg-rose-500/15 text-rose-200
                                ring-1 ring-rose-500/30
                            "
                        >
                            <MaterialIcon name="delete" set="rounded" size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-zinc-100">{title}</div>
                            {description ? (
                                <div className="mt-1 text-sm text-zinc-300">{description}</div>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                -mr-1 -mt-1
                                flex h-9 w-9 items-center justify-center
                                rounded-xl
                                text-zinc-300
                                hover:bg-white/5
                                disabled:opacity-50
                            "
                            aria-label="Cerrar"
                            title="Cerrar"
                        >
                            <MaterialIcon name="close" set="rounded" size={18} />
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-zinc-800/70 px-5 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="
                                h-10 rounded-xl
                                border border-zinc-800/70
                                bg-white/5 px-4
                                text-sm font-semibold text-zinc-200
                                transition hover:bg-white/10
                                disabled:cursor-not-allowed disabled:opacity-50
                            "
                        >
                            {cancelText}
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="
                                h-10 rounded-xl
                                bg-rose-500/15 px-4
                                text-sm font-semibold text-rose-200
                                ring-1 ring-rose-500/30
                                transition hover:bg-rose-500/25
                                disabled:cursor-not-allowed disabled:opacity-50
                                inline-flex items-center gap-2
                            "
                        >
                            {loading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200/40 border-t-rose-200" />
                            ) : (
                                <MaterialIcon name="delete" set="rounded" size={18} />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
