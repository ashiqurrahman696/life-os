import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("family", { allowed: ["title", "member", "dueDate", "done", "priority", "notes"] });
