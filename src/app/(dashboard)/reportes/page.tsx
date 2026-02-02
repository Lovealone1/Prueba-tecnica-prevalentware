import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/server/auth/auth";

import { ReportFilters } from "@/components/reports/ReportFilters";
import { FinancialBalanceCard } from "@/components/reports/FinancialBalanceCard";
import { FinancialMovementsChart } from "@/components/reports/FinancialMovementChart";

function ymd(d: Date) {
    return d.toISOString().slice(0, 10);
}

function isYMD(s: unknown): s is string {
    return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeGranularity(v: unknown): "day" | "month" | "all" {
    if (v === "month" || v === "all" || v === "day") return v;
    return "day";
}

async function getCookieHeader() {
    const cookieStore = await cookies();
    return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}

async function fetchJSON(url: string, cookieHeader: string) {
    const res = await fetch(url, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Fetch failed:", res.status, url, text);
        return null;
    }

    return res.json();
}

async function fetchMeServer(baseUrl: string, cookieHeader: string) {
    const meUrl = new URL("/api/v1/auth/me", baseUrl);
    return fetchJSON(meUrl.toString(), cookieHeader);
}

export default async function ReportesPage({
    searchParams,
}: {
    searchParams?: Promise<{ from?: string; to?: string; granularity?: string }>;
}) {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const cookieHeader = await getCookieHeader();

    const session = await auth.api.getSession({
        headers: { cookie: cookieHeader } as any,
    });

    if (!session?.user?.id) {
        redirect("/login");
    }

    const me = await fetchMeServer(baseUrl, cookieHeader);

    if (!me) {
        redirect("/login");
    }

    if (me.role !== "ADMIN") {
        redirect("/transacciones");
    }

    const sp = (await searchParams) ?? {};

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const from = isYMD(sp.from) ? sp.from : ymd(startOfYear);
    const to = isYMD(sp.to) ? sp.to : ymd(now);
    const granularity = normalizeGranularity(sp.granularity);

    const chartUrl = new URL("/api/v1/reports/financial-movements-chart", baseUrl);
    chartUrl.searchParams.set("from", from);
    chartUrl.searchParams.set("to", to);
    chartUrl.searchParams.set("granularity", granularity);

    const balanceUrl = new URL("/api/v1/reports/financial-balance", baseUrl);
    balanceUrl.searchParams.set("from", from);
    balanceUrl.searchParams.set("to", to);

    const [chartData, balanceData] = await Promise.all([
        fetchJSON(chartUrl.toString(), cookieHeader),
        fetchJSON(balanceUrl.toString(), cookieHeader),
    ]);

    if (!chartData || !balanceData) {
        redirect("/transacciones");
    }

    return (
        <div className="px-6 py-6 space-y-4">
            <ReportFilters from={from} to={to} granularity={granularity} />
            <FinancialBalanceCard data={balanceData} />
            <FinancialMovementsChart data={chartData} />
        </div>
    );
}
