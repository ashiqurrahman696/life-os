import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("importantDates", { required: ["title", "date"], sort: { date: 1 } });
