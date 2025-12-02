import { CategoriesInner } from "./_components/categories-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function CategoriesPage() {
  try {
    // Get auth token for Convex (optional - queries may work without it)
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" }).catch(() => null);

    // Carregar categorias do Convex
    const preloadedCategories = await preloadQuery(
      api.categories.list,
      {},
      token ? { token } : undefined
    );

    const userProgress = 34;

    return <CategoriesInner preloadedCategories={preloadedCategories} initialProgress={userProgress} />;
  } catch (error) {
    console.error("Error loading categories:", error);
    // Fallback: return empty state
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar categorias</p>
        </div>
      </div>
    );
  }
}

