export const components = {
    schemas: {
        TransactionType: {
            type: "string",
            enum: ["INCOME", "EXPENSE"],
        },

        Transaction: {
            type: "object",
            required: ["id", "concept", "amount", "date", "type", "userId"],
            properties: {
                id: { type: "string" },
                concept: { type: "string" },
                amount: { type: "number" },
                date: { type: "string", format: "date-time" },
                type: { $ref: "#/components/schemas/TransactionType" },
                userId: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
            },
        },

        CreateTransactionRequest: {
            type: "object",
            required: ["concept", "amount", "type", "userId"],
            properties: {
                concept: { type: "string" },
                amount: { type: "number" },
                date: { type: "string", format: "date-time", nullable: true },
                type: { $ref: "#/components/schemas/TransactionType" },
                userId: { type: "string" },
            },
        },

        ErrorResponse: {
            type: "object",
            properties: {
                error: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        details: { type: "object", nullable: true },
                    },
                },
            },
        },
    },
};
