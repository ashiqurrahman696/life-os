import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("trips", { allowed: ["name", "destination", "startDate", "endDate", "budget", "status", "checklist", "notes"] });
