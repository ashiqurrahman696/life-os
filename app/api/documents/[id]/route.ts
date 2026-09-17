import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("documents", { allowed: ["title", "category", "location", "expiryDate", "notes"] });
