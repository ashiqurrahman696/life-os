import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("homeTasks", { allowed: ["title", "area", "frequency", "dueDate", "done", "cost", "notes"] });
