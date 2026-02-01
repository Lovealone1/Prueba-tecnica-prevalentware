export type Role = "ADMIN" | "USER";

export type Me = {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
};