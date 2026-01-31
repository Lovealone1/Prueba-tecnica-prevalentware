import { auth } from "@/server/auth/auth"; // o donde lo tengas
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
