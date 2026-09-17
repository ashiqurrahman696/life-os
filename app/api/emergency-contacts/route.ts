import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("emergencyContacts", { required: ["name", "phone"], sort: { updatedAt: -1 } });
