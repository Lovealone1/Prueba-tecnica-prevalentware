/**
 * @component Modal
 * @description Generic and flexible base modal component for displaying content in a popup window.
 * Supports header, body, footer and closes with ESC key or backdrop click.
 * 
 * @features
 * - Close with ESC key
 * - Close on backdrop click
 * - Prevents body scroll when open
 * - Portal rendering to avoid z-index issues
 * - Visual effects with blur and glow
 * 
 * @param {Object} props
 * @param {boolean} props.open - Control whether modal is open
 * @param {string} props.title - Modal title
 * @param {string} [props.description] - Description under title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} [props.footer] - Modal footer content (buttons, etc)
 * @param {string} [props.widthClassName='max-w-lg'] - Tailwind width class
 * @param {Function} props.onClose - Callback when modal closes
 * 
 * @example
 * <Modal
 *   open={isOpen}
 *   title="Confirmation"
 *   description="Are you sure?"
 *   onClose={() => setIsOpen(false)}
 *   footer={<button onClick={handleConfirm}>Confirm</button>}
 * >
 *   <p>Content here</p>
 * </Modal>
 */
"use client";

import { useEffect } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Portal } from "@/components/ui/Portal";

function cx(...s: Array<string | false | null | undefined>) {
    return s.filter(Boolean).join(" ");
}

export function Modal({
    open,
    title,
    description,
    children,
    onClose,
    footer,
    widthClassName = "max-w-lg",
}: {
    open: boolean;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    onClose: () => void;
    widthClassName?: string;
}) {
    // Close modal when ESC is pressed
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999]">
                {/* Backdrop */}
                <button
                    type="button"
                    aria-label="Cerrar modal"
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60"
                />

                {/* Panel */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className={[
                            "relative w-full rounded-3xl",
                            "border border-zinc-800/70 bg-zinc-950/65",
                            "shadow-[0_30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl",
                            widthClassName ?? "max-w-lg",
                        ].join(" ")}
                    >
                        {/* glow */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
                            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />
                            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
                        </div>

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5">
                                <div>
                                    <h2 className="text-base font-bold uppercase text-white">{title}</h2>
                                    {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-grid h-9 w-9 place-items-center rounded-xl border border-zinc-800/70 bg-white/5 text-zinc-200 transition hover:bg-white/10"
                                    aria-label="Cerrar"
                                    title="Cerrar"
                                >
                                    <MaterialIcon name="close" set="rounded" size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">{children}</div>

                            {/* Footer */}
                            {footer ? (
                                <div className="flex items-center justify-end gap-2 border-t border-white/5 px-6 py-4">
                                    {footer}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
