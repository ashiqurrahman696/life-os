import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("vehicleServices", {
  required: ["vehicleName", "title"],
  sort: { dueDate: 1 },
});
