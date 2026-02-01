import type { NextApiResponse } from "next";

export function jsonError(
    res: NextApiResponse,
    status: number,
    message: string,
    details?: unknown
) {
    return res.status(status).json({ error: { message, details } });
}
