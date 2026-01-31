import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuthOr401 } from "@/server/auth/require-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await requireAuthOr401(req, res);
    if (!user) return;

    res.status(200).json(user);
}
