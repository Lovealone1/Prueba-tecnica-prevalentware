import type { NextApiRequest, NextApiResponse } from "next";
import { generateOpenApiSpec } from "@/server/openapi/base";

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const spec = generateOpenApiSpec();
  res.status(200).json(spec);
}

