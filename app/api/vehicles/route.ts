import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("vehicles", { required: ["name"], sort: { updatedAt: -1 } });
