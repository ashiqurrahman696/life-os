import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("vault", { required: ["service"] });
