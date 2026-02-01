import type { MaterialIconSet } from "@/components/ui/MaterialIcon";

export type NavItem = {
    name: string;
    href: string;
    iconName?: string;
    iconSet?: MaterialIconSet;
};

export type NavSection = {
    title: string;
    iconName?: string;
    iconSet?: MaterialIconSet;
    items: NavItem[];
};
