import { CategoriesPage } from "./_components/categories-page";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";

export default async function AdminCategoriesPage() {
  // Preload categories data on the server
  const preloadedCategories = await preloadQuery(api.categories.list);

  return <CategoriesPage preloadedCategories={preloadedCategories} />;
}
