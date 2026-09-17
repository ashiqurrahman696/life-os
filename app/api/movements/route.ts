import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("movements", { required: ["who", "destination", "departAt"], sort: { departAt: 1 } });
