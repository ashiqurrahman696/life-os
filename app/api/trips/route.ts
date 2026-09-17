import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("trips", { required: ["name", "destination"] });
