import { itemRoutes } from "@/lib/crud";
export const { PATCH, DELETE } = itemRoutes("importantDates", {
  allowed: ["title", "date", "category", "person", "repeatYearly", "notes"],
});
