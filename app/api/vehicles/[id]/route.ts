import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("vehicles", {
  allowed: ["name", "make", "model", "year", "plate", "mileage", "fuel", "notes"],
});
