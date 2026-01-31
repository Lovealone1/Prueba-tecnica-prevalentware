import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing env DATABASE_URL");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
    directUrl: DIRECT_DATABASE_URL, // opcional
  },
});
