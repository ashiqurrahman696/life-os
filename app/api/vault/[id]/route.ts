import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("vault", { allowed: ["service", "username", "url", "category", "passwordHint", "lastChanged", "notes"] });
