import { z } from "@/server/openapi/zod-openapi";

export const UserRoleEnum = z.enum(["ADMIN", "USER"]).openapi("UserRole");

export const UpdateUserSchema = z
    .object({
        name: z.string().min(1).max(120).optional(),
        role: UserRoleEnum.optional(),
    })
    .refine((v) => v.name !== undefined || v.role !== undefined, {
        message: "At least one field must be provided: name or role",
        path: ["name"],
    })
    .openapi("UpdateUser");

export const SetUserPhoneSchema = z
    .object({
        phone: z.string().trim().min(1).max(30).nullable(),
    })
    .openapi("SetUserPhone");

export const UserSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        role: UserRoleEnum,
        phone: z.string().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    })
    .openapi("User");
