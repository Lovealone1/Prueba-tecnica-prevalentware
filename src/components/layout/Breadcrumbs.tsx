"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleFromSegment(seg: string) {
    const map: Record<string, string> = {
        usuarios: "Usuarios",
        reportes: "Reportes",
        transacciones: "Transacciones",
        inicio: "Inicio",
    };

    const decoded = decodeURIComponent(seg);
    return map[decoded] ?? decoded.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
    const pathname = usePathname();
    const parts = (pathname || "/").split("?")[0].split("#")[0].split("/").filter(Boolean);

    const crumbs = [
        { href: "/", label: "Prevalentware" },
        ...parts.map((seg, idx) => {
            const href = "/" + parts.slice(0, idx + 1).join("/");
            return { href, label: titleFromSegment(seg) };
        }),
    ];

    return (
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-300">
            <ol className="flex flex-wrap items-center gap-2">
                {crumbs.map((c, i) => {
                    const last = i === crumbs.length - 1;

                    return (
                        <li key={c.href} className="flex items-center gap-2">
                            {i > 0 && <span className="text-zinc-500">›</span>}

                            {last ? (
                                <span className="text-white">{c.label}</span>
                            ) : (
                                <Link href={c.href} className="hover:text-white">
                                    {c.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
