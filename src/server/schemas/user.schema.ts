import { z } from "zod";

export const UserRoleEnum = z.enum(["ADMIN", "USER"]);

export const UpdateUserSchema = z.object({
    name: z.string().min(1),
    role: UserRoleEnum,
});

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    role: UserRoleEnum,
    phone: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

