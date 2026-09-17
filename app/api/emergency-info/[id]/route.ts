import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("emergencyInfo", {
  allowed: ["type", "title", "details"],
});
