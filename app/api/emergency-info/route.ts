import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("emergencyInfo", { required: ["title", "details"], sort: { updatedAt: -1 } });
