import type { NavSection } from "@/types/navigation";

export const navSections: NavSection[] = [
    {
        title: "",
        items: [
            {
                name: "Ingresos y egresos",
                href: "/transacciones",
                iconName: "payments",
                iconSet: "rounded",
                roles: ["ADMIN", "USER"],
            },
            {
                name: "Usuarios",
                href: "/usuarios",
                iconName: "people",
                iconSet: "rounded",
                roles: ["ADMIN"],
            },
            {
                name: "Reportes",
                href: "/reportes",
                iconName: "summarize",
                iconSet: "rounded",
                roles: ["ADMIN"],
            },
        ],
    },
];

export function getNavSections() {
    return navSections;
}