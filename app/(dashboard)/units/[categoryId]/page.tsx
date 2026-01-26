"use client";

import { UnitsPage } from "../_components/units-page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTenantQuery, useTenantReady } from "@/hooks/use-tenant-convex";
import { Loader2 } from "lucide-react";
import { use } from "react";

interface UnitsPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default function Page({ params }: UnitsPageProps) {
  const { categoryId } = use(params);
  const categoryIdTyped = categoryId as Id<"categories">;
  const isTenantReady = useTenantReady();

  // Query category for title
  const category = useTenantQuery(api.categories.getById, {
    id: categoryIdTyped,
  });

  // Loading state
  if (!isTenantReady || category === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const categoryTitle = category?.title ?? "Categoria";

  return (
    <UnitsPage categoryId={categoryIdTyped} categoryTitle={categoryTitle} />
  );
}
