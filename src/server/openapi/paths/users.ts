import { registry } from "@/server/openapi/registry";
import { z } from "zod";

import {
    UpdateUserSchema,
    SetUserPhoneSchema,
    UserSchema,
} from "@/server/schemas/user.schema";
import { ErrorResponseSchema } from "@/server/schemas/error.schema";

const UsersTag = ["Users"];

// PATCH /api/v1/users (name, role)
registry.registerPath({
    method: "patch",
    path: "/api/v1/users",
    tags: UsersTag,
    operationId: "updateUser",
    summary: "Update user",
    description:
        "Updates a user. Only `name` and `role` can be edited. Requires `userId` as a query parameter. At least one field must be provided.",
    request: {
        query: z.object({
            userId: z.string().min(1),
        }),
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateUserSchema,
                    examples: {
                        updateName: {
                            summary: "Update name",
                            value: { name: "Daniel Garcia" },
                        },
                        updateRole: {
                            summary: "Update role",
                            value: { role: "ADMIN" },
                        },
                        updateBoth: {
                            summary: "Update name and role",
                            value: { name: "Daniel Garcia", role: "USER" },
                        },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "OK — User updated successfully.",
            content: {
                "application/json": {
                    schema: UserSchema,
                    examples: {
                        updated: {
                            value: {
                                id: "user_abc123",
                                name: "Daniel Garcia",
                                email: "dgo342@hotmail.com",
                                role: "ADMIN",
                                phone: null,
                                createdAt: "2026-01-01T10:00:00.000Z",
                                updatedAt: "2026-01-31T17:40:00.000Z",
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: "Bad Request — Missing userId or invalid request body.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        missingUserId: {
                            value: { error: { message: "Missing required query param: userId" } },
                        },
                        invalidBody: {
                            value: {
                                error: {
                                    message: "Invalid request body",
                                    details: {
                                        fieldErrors: {
                                            name: ["At least one field must be provided: name or role"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to update user.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        error: { value: { error: { message: "Failed to update user" } } },
                    },
                },
            },
        },
    },
});

// PATCH /api/v1/users/phone (phone)
registry.registerPath({
    method: "patch",
    path: "/api/v1/users/phone",
    tags: UsersTag,
    operationId: "setUserPhone",
    summary: "Set user phone",
    description:
        "Sets the `phone` field for a user. Requires `userId` as a query parameter. Use `null` to clear the phone.",
    request: {
        query: z.object({
            userId: z.string().min(1),
        }),
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: SetUserPhoneSchema,
                    examples: {
                        setPhone: {
                            summary: "Set phone",
                            value: { phone: "+57 301 435 5609" },
                        },
                        clearPhone: {
                            summary: "Clear phone",
                            value: { phone: null },
                        },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "OK — User phone updated successfully.",
            content: {
                "application/json": {
                    schema: UserSchema,
                    examples: {
                        updated: {
                            value: {
                                id: "user_abc123",
                                name: "Daniel Garcia",
                                email: "dgo342@hotmail.com",
                                role: "USER",
                                phone: "+57 301 435 5609",
                                createdAt: "2026-01-01T10:00:00.000Z",
                                updatedAt: "2026-01-31T17:45:00.000Z",
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: "Bad Request — Missing userId or invalid request body.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        missingUserId: {
                            value: { error: { message: "Missing required query param: userId" } },
                        },
                        invalidBody: {
                            value: {
                                error: {
                                    message: "Invalid request body",
                                    details: {
                                        fieldErrors: {
                                            phone: ["Expected string, received null"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to update user phone.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        error: { value: { error: { message: "Failed to update user phone" } } },
                    },
                },
            },
        },
    },
});
