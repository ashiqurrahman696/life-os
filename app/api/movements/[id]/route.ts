import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("movements", {
  allowed: ["who", "destination", "departAt", "returnAt", "purpose", "transport", "status", "notes"],
});
