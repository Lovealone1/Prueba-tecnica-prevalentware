import type { NavSection } from "@/types/navigation";
import type { Role } from "@/types/auth";

export function filterNavByRole(sections: NavSection[], role: Role): NavSection[] {
    return sections
        .map((s) => ({
            ...s,
            items: s.items.filter((it) => !it.roles || it.roles.includes(role)),
        }))
        .filter((s) => s.items.length > 0);
}
