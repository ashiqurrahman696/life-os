import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("vehicleServices", {
  allowed: ["vehicleId", "vehicleName", "title", "serviceType", "dueDate", "dueMileage", "mileage", "cost", "done", "notes"],
});
