import { registry } from "@/server/openapi/registry";

import {
    FinancialMovementsQuerySchema,
    FinancialMovementsReportSchema,
    FinancialMovementsChartResponseSchema,
    FinancialBalanceResponseSchema
} from "@/server/schemas/report.schema";
import { ErrorResponseSchema } from "@/server/schemas/error.schema";

const ReportsTag = ["Reports"];

const now = new Date();

const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
const todayUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23,
    59,
    59
));

const fromIso = startOfYear.toISOString();
const toIso = todayUtc.toISOString();

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

registry.registerPath({
    method: "get",
    path: "/api/v1/reports/financial-movements-chart",
    tags: ReportsTag,
    operationId: "getFinancialMovementsChart",
    summary: "Financial movements chart data",
    description:
        "Admin-only. Returns chart-ready data: labels + aligned series (income/expense/net), totals and points.\n\nGranularity:\n- `day`: groups by day (YYYY-MM-DD)\n- `week`: groups by week (label is Monday YYYY-MM-DD)\n- `month`: groups by month (YYYY-MM)\n- `all`: accepted for compatibility and normalized to `month`.\n\nIf no date range is provided, frontend usually queries from start of current year until today.",
    request: {
        query: FinancialMovementsQuerySchema,
    },
    responses: {
        200: {
            description: "OK — Chart data generated.",
            content: {
                "application/json": {
                    schema: FinancialMovementsChartResponseSchema,
                    examples: {
                        day: {
                            summary: "Daily chart series (from Jan 1st to today)",
                            value: {
                                meta: {
                                    from: fromIso,
                                    to: toIso,
                                    granularity: "day",
                                },
                                labels: ["2026-01-31"],
                                series: {
                                    income: [481000],
                                    expense: [45000],
                                    net: [436000],
                                },
                                points: [
                                    {
                                        label: "2026-01-31",
                                        income: 481000,
                                        expense: 45000,
                                        net: 436000,
                                    },
                                ],
                                totals: {
                                    income: 481000,
                                    expense: 45000,
                                    net: 436000,
                                },
                                datasets: [
                                    { key: "income", label: "Ingresos", data: [481000] },
                                    { key: "expense", label: "Gastos", data: [45000] },
                                    { key: "net", label: "Neto", data: [436000] },
                                ],
                            },
                        },
                        month: {
                            summary: "Monthly chart series (from Jan 1st to today)",
                            value: {
                                meta: {
                                    from: fromIso,
                                    to: toIso,
                                    granularity: "month",
                                },
                                labels: ["2026-01", "2026-02"],
                                series: {
                                    income: [250000, 50000],
                                    expense: [70000, 20000],
                                    net: [180000, 30000],
                                },
                                points: [
                                    {
                                        label: "2026-01",
                                        income: 250000,
                                        expense: 70000,
                                        net: 180000,
                                    },
                                    {
                                        label: "2026-02",
                                        income: 50000,
                                        expense: 20000,
                                        net: 30000,
                                    },
                                ],
                                totals: {
                                    income: 300000,
                                    expense: 90000,
                                    net: 210000,
                                },
                                datasets: [
                                    { key: "income", label: "Ingresos", data: [250000, 50000] },
                                    { key: "expense", label: "Gastos", data: [70000, 20000] },
                                    { key: "net", label: "Neto", data: [180000, 30000] },
                                ],
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
                },
            },
        },
        401: {
            description: "Unauthorized.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        403: {
            description: "Forbidden — Admin only.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to generate chart data.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/api/v1/reports/financial-balance",
    tags: ReportsTag,
    operationId: "getFinancialBalance",
    summary: "Current financial balance",
    description:
        "Admin-only. Returns the current financial balance (income - expense) and totals.",
    responses: {
        200: {
            description: "OK — Balance returned.",
            content: {
                "application/json": {
                    schema: FinancialBalanceResponseSchema,
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
            description: "Forbidden — Admin only.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Internal Server Error — Failed to get balance.",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});
