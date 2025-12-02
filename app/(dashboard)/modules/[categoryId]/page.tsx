import { ModulesInner } from "../_components/modules-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";

interface ModulesPageProps {
  params: {
    categoryId: string;
  };
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const categoryId = params.categoryId as Id<"categories">;

  // Carregar módulos da categoria
  const preloadedModules = await preloadQuery(api.modules.listByCategory, {
    categoryId: categoryId,
  });

  // Buscar informações da categoria para mostrar o título
  const preloadedCategory = await preloadQuery(api.categories.getById, {
    id: categoryId,
  });

  const categoryData = preloadedCategory._valueJSON;
  const categoryTitle = categoryData ? categoryData.title : "Categoria";

  return (
    <ModulesInner
      preloadedModules={preloadedModules}
      categoryTitle={categoryTitle}
    />
  );
}

