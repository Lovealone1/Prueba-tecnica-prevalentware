import { registry } from "@/server/openapi/registry";
import { z } from "zod";

import {
    CreateTransactionSchema,
    TransactionListResponseSchema,
} from "@/server/schemas/transaction.schema";

import { ErrorResponseSchema } from "@/server/schemas/error.schema"; 

const TransactionsTag = ["Transactions"];

registry.registerPath({
    method: "get",
    path: "/api/v1/transactions",
    tags: TransactionsTag,
    operationId: "listTransactions",
    summary: "List transactions",
    description:
        "Returns transactions ordered by date (desc). Optionally filter by userId. Amounts are returned as numbers; dates are ISO strings.",
    request: {
        query: z.object({
            userId: z.string().optional(),
        }),
    },
    responses: {
        200: {
            description: "OK — List of transactions.",
            content: {
                "application/json": {
                    schema: TransactionListResponseSchema,
                    examples: {
                        sample: {
                            value: [
                                {
                                    id: "ckx123",
                                    concept: "Venta mostrador",
                                    amount: 120000,
                                    date: "2026-01-31T17:00:00.000Z",
                                    type: "INCOME",
                                    userId: "user_abc123",
                                    createdAt: "2026-01-31T17:33:16.000Z",
                                    updatedAt: "2026-01-31T17:33:16.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to list transactions.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        error: { value: { error: { message: "Failed to list transactions" } } },
                    },
                },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/v1/transactions",
    tags: TransactionsTag,
    operationId: "createTransaction",
    summary: "Create transaction",
    description:
        "Creates a new transaction. If `date` is omitted, the server uses the current date.",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: CreateTransactionSchema,
                    examples: {
                        income: {
                            summary: "Income example",
                            value: {
                                concept: "Venta mostrador",
                                amount: 120000,
                                type: "INCOME",
                            },
                        },
                        expense: {
                            summary: "Expense example",
                            value: {
                                concept: "Pago proveedor",
                                amount: 45000,
                                date: "2026-01-31T17:00:00.000Z",
                                type: "EXPENSE",
                            },
                        },
                    },
                },
            },
        },
    },
    responses: {
        201: {
            description: "Created — Transaction created successfully.",
            content: {
                "application/json": {
                    schema: TransactionListResponseSchema,
                    examples: {
                        created: {
                            value: [
                                {
                                    id: "ckx124",
                                    concept: "Pago proveedor",
                                    amount: 45000,
                                    date: "2026-01-31T17:00:00.000Z",
                                    type: "EXPENSE",
                                    userId: "user_abc123",
                                    createdAt: "2026-01-31T17:33:16.000Z",
                                    updatedAt: "2026-01-31T17:33:16.000Z",
                                },
                            ],
                        },
                    },
                },
            },
        },
        400: {
            description: "Bad Request — Invalid request body (validation error).",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        invalidBody: {
                            value: {
                                error: {
                                    message: "Invalid request body",
                                    details: {
                                        fieldErrors: {
                                            concept: ["Required"],
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
            description: "Internal Server Error — Failed to create transaction.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        error: { value: { error: { message: "Failed to create transaction" } } },
                    },
                },
            },
        },
    },
});
