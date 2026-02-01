import type { MaterialIconSet } from "@/components/ui/MaterialIcon";

export type Role = "ADMIN" | "USER";

export type NavItem = {
    name: string;
    href: string;
    iconName?: string;
    iconSet?: MaterialIconSet;
    roles?: Role[];
};

export type NavSection = {
    title: string;
    iconName?: string;
    iconSet?: MaterialIconSet;
    items: NavItem[];
};
