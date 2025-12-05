import { AdminInner } from "./_components/admin-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";

export default async function AdminPage() {
  // Preload das queries necessárias no servidor
  const preloadedCategories = await preloadQuery(api.categories.list);
  const preloadedModules = await preloadQuery(api.modules.list);
  const preloadedLessons = await preloadQuery(api.lessons.list);

  return (
    <AdminInner
      preloadedCategories={preloadedCategories}
      preloadedModules={preloadedModules}
      preloadedLessons={preloadedLessons}
    />
  );
}
