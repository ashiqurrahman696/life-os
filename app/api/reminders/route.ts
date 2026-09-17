import { collectionRoutes } from "@/lib/crud";
export const { GET, POST } = collectionRoutes("reminders", { required: ["title", "remindAt"], sort: { remindAt: 1 } });
