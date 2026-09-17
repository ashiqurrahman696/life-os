import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("shopping", { allowed: ["name", "qty", "category", "recurring", "frequency", "bought"] });
