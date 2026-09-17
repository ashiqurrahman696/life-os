import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("knowledge", { required: ["title", "content"], sort: { updatedAt: -1 } });
