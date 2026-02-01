function esc(v: unknown) {
    const s = String(v ?? "");
    const needsQuotes = /[",\n\r]/.test(s);
    const quoted = s.replace(/"/g, '""');
    return needsQuotes ? `"${quoted}"` : quoted;
}

export function financialMovementsReportToCsv(report: {
    series: { period: string; income: number; expense: number; net: number }[];
    balance: number;
    currency: string;
    from: string | null;
    to: string | null;
    granularity: "day" | "month" | "all";
}) {
    const meta = [
        ["currency", report.currency],
        ["granularity", report.granularity],
        ["from", report.from ?? ""],
        ["to", report.to ?? ""],
        ["balance", report.balance],
    ];

    const metaLines = meta.map(([k, v]) => `${esc(k)},${esc(v)}`);

    const header = ["period", "income", "expense", "net"].join(",");
    const rows = report.series.map((r) =>
        [esc(r.period), esc(r.income), esc(r.expense), esc(r.net)].join(",")
    );

    return [...metaLines, "", header, ...rows].join("\n");
}
