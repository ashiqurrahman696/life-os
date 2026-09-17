import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("projects", { required: ["name"] });
