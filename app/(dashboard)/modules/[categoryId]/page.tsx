import { ModulesInner } from "../_components/modules-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";

interface ModulesPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { categoryId } = await params;
  const categoryIdTyped = categoryId as Id<"categories">;

  // Carregar módulos da categoria
  const preloadedModules = await preloadQuery(api.modules.listByCategory, {
    categoryId: categoryIdTyped,
  });

  // Buscar informações da categoria para mostrar o título
  const preloadedCategory = await preloadQuery(api.categories.getById, {
    id: categoryIdTyped,
  });

  // _valueJSON is already a parsed object, not a JSON string
  const categoryData = (preloadedCategory._valueJSON as unknown) as {
    title: string;
  } | null;
  const categoryTitle = categoryData?.title ?? "Categoria";

  return (
    <ModulesInner
      preloadedModules={preloadedModules}
      categoryTitle={categoryTitle}
    />
  );
}

