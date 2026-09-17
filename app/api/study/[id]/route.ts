import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("study", {
  allowed: ["subject", "title", "type", "status", "dueDate", "durationMin", "notes"],
});
