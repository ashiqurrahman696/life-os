import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("knowledge", {
  allowed: ["title", "content", "category", "tags", "favorite"],
});
