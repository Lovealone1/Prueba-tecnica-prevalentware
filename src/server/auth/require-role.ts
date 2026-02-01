import type { NextApiRequest, NextApiResponse } from "next";
import { jsonError } from "@/server/http/json-error";
import { AuthUser } from "./require-auth";

export function requireRoleOr403(
    res: NextApiResponse,
    user: AuthUser,
    roles: AuthUser["role"][]
) {
    if (!roles.includes(user.role)) {
        jsonError(res, 403, "Access denied");
        return false;
    }
    return true;
}
