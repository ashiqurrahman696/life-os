import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("appointments", { required: ["title", "start"], sort: { start: 1 } });
