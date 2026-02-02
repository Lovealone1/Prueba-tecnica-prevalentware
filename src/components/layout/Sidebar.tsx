"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { navSections } from "@/config/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useAuth } from "@/components/providers/AuthProvider";
import { filterNavByRole } from "@/config/nav-guard";

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const { me, loading } = useAuth();

    const widthClass = collapsed ? "w-16" : "w-72";

    const items = useMemo(() => {
        if (!me) return [];
        const sections = filterNavByRole(navSections, me.role);
        return sections.flatMap((s) => s.items);
    }, [me]);

    if (loading) return null;
    if (!me) return null;

    return (
        <aside
            className={[
                "flex h-screen flex-col border-r border-zinc-800/70 bg-zinc-950/40 backdrop-blur-xl transition-[width] duration-200",
                widthClass,
            ].join(" ")}
        >
            <div className={collapsed ? "px-2 pt-4" : "px-5 pt-6"}>
                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    className={[
                        "group flex items-center rounded-md border border-zinc-800/60 bg-zinc-950/40 transition hover:bg-white/5",
                        collapsed
                            ? "mx-auto h-10 w-10 justify-center p-0"
                            : "w-full justify-between px-3 py-3",
                    ].join(" ")}
                    title={collapsed ? "Expandir" : "Colapsar"}
                >
                    <div
                        className={[
                            "flex items-center justify-center",
                            collapsed ? "h-10 w-10 rounded-xl" : "",
                        ].join(" ")}
                    >
                        <Image
                            src={
                                collapsed
                                    ? "/prevalentware_logo.png"
                                    : "/logo-prevalentware.png"
                            }
                            alt="PrevalentWare"
                            width={collapsed ? 24 : 200}
                            height={collapsed ? 24 : 60}
                            priority
                        />
                    </div>

                    {!collapsed && (
                        <MaterialIcon
                            name="chevron_left"
                            set="rounded"
                            size={22}
                            className="text-zinc-300 group-hover:text-white"
                            title="Colapsar"
                        />
                    )}
                </button>

                <div className="mt-4 h-px w-full bg-white/10" />
            </div>

            {/* Nav */}
            <nav className={collapsed ? "flex-1 px-2 py-4" : "flex-1 px-4 py-5"}>
                <div className="space-y-2">
                    {items.map((item) => {
                        const active =
                            pathname === item.href ||
                            (item.href !== "/" && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={[
                                    "group flex items-center transition",
                                    collapsed
                                        ? "h-10 w-10 justify-center rounded-md"
                                        : "h-10 w-full gap-3 rounded-md px-3",
                                    active
                                        ? "bg-blue-500/15 ring-1 ring-blue-500/30"
                                        : "hover:bg-white/5",
                                ].join(" ")}
                            >
                                {item.iconName && (
                                    <MaterialIcon
                                        name={item.iconName}
                                        set={item.iconSet}
                                        size={20}
                                        className={[
                                            "transition",
                                            active
                                                ? "text-blue-200"
                                                : "text-zinc-300 group-hover:text-white",
                                        ].join(" ")}
                                    />
                                )}

                                {!collapsed && (
                                    <span
                                        className={[
                                            "text-sm font-medium",
                                            active ? "text-white" : "text-zinc-300",
                                        ].join(" ")}
                                    >
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
}
