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
            },
            {
                name: "Usuarios",
                href: "/usuarios",
                iconName: "people",
                iconSet: "rounded",
            },
            {
                name: "Reportes",
                href: "/reportes",
                iconName: "summarize",
                iconSet: "rounded",
            },
        ],
    },
];

export function getNavSections() {
    return navSections;
}
