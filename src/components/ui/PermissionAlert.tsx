"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { alerts } from "@/lib/alerts";

export function PermissionAlert() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const hasShownAlert = useRef(false);

    useEffect(() => {
        if (!searchParams || !pathname) return;

        const reason = searchParams.get("alert");

        if (reason === "permission_denied" && !hasShownAlert.current) {
            hasShownAlert.current = true;

            alerts.warning("Acceso denegado", {
                description: "No tienes permisos para acceder a esta página.",
            });

            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete("alert");

            const newUrl =
                newSearchParams.toString().length > 0
                    ? `${pathname}?${newSearchParams.toString()}`
                    : pathname;

            router.replace(newUrl);
        }
    }, [searchParams, router, pathname]);

    return null;
}
