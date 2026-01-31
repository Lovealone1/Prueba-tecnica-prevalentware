import { registry } from "@/server/openapi/registry";

import {
    FinancialMovementsQuerySchema,
    FinancialMovementsReportSchema,
} from "@/server/schemas/report.schema";
import { ErrorResponseSchema } from "@/server/schemas/error.schema";

const ReportsTag = ["Reports"];

registry.registerPath({
    method: "get",
    path: "/api/v1/reports/financial-movements",
    tags: ReportsTag,
    operationId: "getFinancialMovementsReport",
    summary: "Financial movements report",
    description:
        "Admin-only. Returns aggregated movements for charting (income/expense/net) and current balance.\n\nGranularity:\n- `day`: groups by day (YYYY-MM-DD)\n- `month`: groups by month (YYYY-MM)\n- `all`: returns a single total row (`period: \"all\"`)\n\nOptional date range via `from` and `to` (coerced to Date).",
    request: {
        query: FinancialMovementsQuerySchema,
    },
    responses: {
        200: {
            description: "OK — Report generated.",
            content: {
                "application/json": {
                    schema: FinancialMovementsReportSchema,
                    examples: {
                        day: {
                            summary: "Daily series",
                            value: {
                                balance: 75000,
                                currency: "COP",
                                from: "2026-01-01T00:00:00.000Z",
                                to: "2026-01-31T23:59:59.000Z",
                                granularity: "day",
                                series: [
                                    { period: "2026-01-10", income: 120000, expense: 45000, net: 75000 },
                                    { period: "2026-01-11", income: 0, expense: 10000, net: -10000 },
                                ],
                            },
                        },
                        month: {
                            summary: "Monthly series",
                            value: {
                                balance: 180000,
                                currency: "COP",
                                from: "2026-01-01T00:00:00.000Z",
                                to: "2026-03-31T23:59:59.000Z",
                                granularity: "month",
                                series: [
                                    { period: "2026-01", income: 250000, expense: 70000, net: 180000 },
                                    { period: "2026-02", income: 50000, expense: 20000, net: 30000 },
                                ],
                            },
                        },
                        all: {
                            summary: "All (single total row)",
                            value: {
                                balance: 210000,
                                currency: "COP",
                                from: null,
                                to: null,
                                granularity: "all",
                                series: [{ period: "all", income: 300000, expense: 90000, net: 210000 }],
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: "Bad Request — Invalid query params.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        invalid: {
                            value: {
                                error: {
                                    message: "Invalid query params",
                                    details: { fieldErrors: { userId: ["Required"] } },
                                },
                            },
                        },
                    },
                },
            },
        },
        403: {
            description: "Forbidden — Admin only.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        forbidden: { value: { error: { message: "Forbidden" } } },
                    },
                },
            },
        },
        404: {
            description: "Not Found — User not found.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        notFound: { value: { error: { message: "User not found" } } },
                    },
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to generate report.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                    examples: {
                        error: { value: { error: { message: "Failed to generate report" } } },
                    },
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/v1/reports/financial-movements.csv",
    tags: ["Reports"],
    operationId: "downloadFinancialMovementsCsv",
    summary: "Download financial movements report (CSV)",
    description:
        "Downloads the financial movements report as a CSV file. Admin only.",
    request: {
        query: FinancialMovementsQuerySchema,
    },
    responses: {
        200: {
            description: "CSV file download",
            content: {
                "text/csv": {
                    schema: {
                        type: "string",
                        format: "binary",
                    },
                },
            },
            headers: {
                "Content-Disposition": {
                    description: "Attachment filename",
                    schema: { type: "string" },
                },
            },
        },
        400: {
            description: "Invalid query params",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        403: {
            description: "Access denied",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Failed to generate CSV report",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});