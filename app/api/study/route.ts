import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("study", { required: ["subject", "title"], sort: { updatedAt: -1 } });
