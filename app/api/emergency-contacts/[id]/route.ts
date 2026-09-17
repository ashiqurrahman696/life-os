import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("emergencyContacts", {
  allowed: ["name", "relation", "phone", "altPhone", "address", "priority", "notes"],
});
