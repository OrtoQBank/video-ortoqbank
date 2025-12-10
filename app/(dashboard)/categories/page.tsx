import { CategoriesInner } from "./_components/categories-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function CategoriesPage() {
  // Carregar apenas categorias PUBLICADAS do Convex
  const preloadedCategories = await preloadQuery(api.categories.listPublished);

  // Obter token de autenticação para Convex
  const { userId, getToken } = await auth();
  const token = await getToken({ template: "convex" }).catch(() => null);

  // Pré-carregar dados de progresso (se autenticado)
  const preloadedContentStats = await preloadQuery(
    api.contentStats.get,
    {},
    token ? { token } : undefined
  ).catch(() => null);

  const preloadedCompletedCount = userId
    ? await preloadQuery(
        api.progress.getCompletedPublishedLessonsCount,
        { userId },
        token ? { token } : undefined
      ).catch(() => null)
    : null;

  return (
    <CategoriesInner
      preloadedCategories={preloadedCategories}
      preloadedContentStats={preloadedContentStats}
      preloadedCompletedCount={preloadedCompletedCount}
    />
  );
}

