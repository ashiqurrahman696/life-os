import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("documents", { required: ["title"] });
