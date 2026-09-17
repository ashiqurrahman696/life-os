import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("projects", { allowed: ["name", "description", "status", "deadline", "subtasks"] });
