import { z } from "@/server/openapi/zod-openapi";

export const TransactionTypeEnum = z
    .enum(["INCOME", "EXPENSE"])
    .openapi("TransactionType");

export const TransactionSchema = z
    .object({
        id: z.string(),
        concept: z.string().min(1),
        amount: z.number().positive(),
        date: z.coerce.date(),
        type: TransactionTypeEnum,
        userId: z.string(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    })
    .openapi("Transaction");

export const CreateTransactionSchema = z
    .object({
        concept: z.string().min(1),
        amount: z.number().positive(),
        date: z.coerce.date().optional(),
        type: TransactionTypeEnum,
        userId: z.string().optional(),
    })
    .openapi("CreateTransaction");

export const TransactionListResponseSchema = z
    .array(TransactionSchema)
    .openapi("TransactionListResponse");
