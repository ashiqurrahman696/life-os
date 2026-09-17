import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("family", { required: ["title"] });
