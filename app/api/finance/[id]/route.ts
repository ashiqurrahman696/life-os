import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("transactions", { allowed: ["kind", "amount", "category", "date", "note"] });
