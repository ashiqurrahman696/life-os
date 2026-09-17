import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("shopping", { required: ["name"] });
