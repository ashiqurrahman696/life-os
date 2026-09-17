import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("reminders", { allowed: ["title", "notes", "remindAt", "repeat", "done"] });
