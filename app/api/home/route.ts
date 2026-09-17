import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("homeTasks", { required: ["title"] });
