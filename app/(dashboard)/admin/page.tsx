import { Admin } from "./_components/admin-page";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function AdminPage() {
  const preloadedCategories = await preloadQuery(api.categories.list);

  return <Admin preloadedCategories={preloadedCategories} />;
}
