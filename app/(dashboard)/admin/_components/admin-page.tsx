"use client";

import { CategoryForm } from "./category-form";
import { CategoryList } from "./category-list";
import { UnitForm } from "./unit-form";
import { UnitList } from "./unit-list";
import { LessonForm } from "./lesson-form";
import { LessonList } from "./lesson-list";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { parseAsStringLiteral } from "nuqs";
import { useQueryState } from "nuqs";

interface AdminProps {
  preloadedCategories: Preloaded<typeof api.categories.list>;
}

export function Admin({
  preloadedCategories,

}: AdminProps) {
  const categories = usePreloadedQuery(preloadedCategories);

  const { state } = useSidebar();

  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["categories", "units", "lessons"] as const).withDefault("categories")
  );

  const handleTabChange = (value: string) => {
    if (value === "categories" || value === "units" || value === "lessons") {
      setTab(value);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sidebar trigger - follows sidebar position */}
      <SidebarTrigger className={`hidden md:inline-flex fixed top-2 h-6 w-6 text-blue-brand hover:text-blue-brand-dark hover:bg-blue-brand-light transition-[left] duration-200 ease-linear z-10 ${state === 'collapsed' ? 'left-[calc(var(--sidebar-width-icon)+0.25rem)]' : 'left-[calc(var(--sidebar-width)+0.25rem)]'}`} />

      {/* Header */}
      <div className="py-6 px-8 flex items-center gap-3 border-b">
        <h1 className="text-2xl font-bold">Administração</h1>
      </div>

      {/* Content */}
      <div className="p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="units">Unidades</TabsTrigger>
              <TabsTrigger value="lessons">Aulas</TabsTrigger>
            </TabsList>

            {/* Categorias */}
            <TabsContent value="categories">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Gerenciar Categorias
                </h2>

              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <CategoryForm />
                </div>
                <div>
                  <CategoryList categories={categories} />
                </div>
              </div>
            </TabsContent>

            {/* Unidades */}
            <TabsContent value="units">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Gerenciar Unidades
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
                <div className="h-full overflow-auto">
                  <UnitForm categories={categories} />
                </div>
                <div className="h-full overflow-auto">
                  <UnitList categories={categories} />
                </div>
              </div>
            </TabsContent>

            {/* Aulas */}
            <TabsContent value="lessons">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Gerenciar Aulas</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
                <div className="h-full overflow-auto" data-lesson-form>
                  <LessonForm units={[]} />
                </div>
                <div className="h-full overflow-auto">
                  <LessonList lessons={[]} />
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
