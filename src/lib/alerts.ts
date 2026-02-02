import { toast } from "sonner";

export type AlertVariant = "success" | "error" | "info" | "warning";

export const alerts = {
    success: (msg: string, opts?: { description?: string }) =>
        toast.success(msg, opts),
    error: (msg: string, opts?: { description?: string }) =>
        toast.error(msg, opts),
    info: (msg: string, opts?: { description?: string }) =>
        toast(msg, opts),
    warning: (msg: string, opts?: { description?: string }) =>
        toast.warning(msg, opts),
};
