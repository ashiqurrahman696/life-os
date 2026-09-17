import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("appointments", {
  allowed: ["title", "withWhom", "location", "start", "end", "type", "status", "notes"],
});
