import { z } from "zod";

export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const TransactionSchema = z.object({
    id: z.string(),
    concept: z.string().min(1),
    amount: z.number().positive(),
    date: z.coerce.date(),
    type: TransactionTypeEnum,
    userId: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const CreateTransactionSchema = z.object({
    concept: z.string().min(1),
    amount: z.number().positive(),
    date: z.coerce.date().optional(),
    type: TransactionTypeEnum,
    userId: z.string(),
});

export const TransactionListResponseSchema = z.array(TransactionSchema);
