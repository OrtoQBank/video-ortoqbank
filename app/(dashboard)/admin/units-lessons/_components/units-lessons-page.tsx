"use client";

import { useState, useEffect } from "react";
import { UnitForm } from "../../_components/unit-form";
import { LessonForm } from "../../_components/lesson-form";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UnitsLessonsPageProps {
  preloadedCategories: Preloaded<typeof api.categories.list>;
}

export function UnitsLessonsPage({
  preloadedCategories,
}: UnitsLessonsPageProps) {
  const categories = usePreloadedQuery(preloadedCategories);
  const { state } = useSidebar();

  // State for selected category
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | null>(
    categories.length > 0 ? categories[0]._id : null
  );

  // State for expanded units in left sidebar
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Query units and lessons based on selected category
  const units = useQuery(
    api.units.listByCategory,
    selectedCategoryId ? { categoryId: selectedCategoryId } : "skip"
  );

  const lessons = useQuery(
    api.lessons.listByUnit,
    units && units.length > 0 ? { unitId: units[0]._id as Id<"units"> } : "skip"
  );

  // Auto-expand first unit when data loads
  useEffect(() => {
    if (units && units.length > 0 && expandedUnits.size === 0) {
      setTimeout(() => {
        setExpandedUnits(new Set([units[0]._id]));
      }, 0);
    }
  }, [expandedUnits.size, units]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const getLessonsForUnit = (unitId: Id<"units">) => {
    if (!lessons) return [];
    return lessons
      .filter((lesson) => lesson.unitId === unitId)
      .sort((a, b) => a.order_index - b.order_index);
  };

  const selectedCategory = categories.find((cat) => cat._id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sidebar trigger - follows sidebar position */}
      <SidebarTrigger
        className={`hidden md:inline-flex fixed top-2 h-6 w-6 text-blue-brand hover:text-blue-brand-dark hover:bg-blue-brand-light transition-[left] duration-200 ease-linear z-10 ${state === "collapsed"
          ? "left-[calc(var(--sidebar-width-icon)+0.25rem)]"
          : "left-[calc(var(--sidebar-width)+0.25rem)]"
          }`}
      />

      {/* Header */}
      <div className="py-6 px-8 flex items-center gap-3 border-b">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Gerenciar Unidades e Aulas</h1>
          <p className="text-sm text-muted-foreground">
            Selecione uma categoria para gerenciar seus unidades e aulas
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="py-4 px-8 border-b bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap">
              Categoria:
            </label>
            <Select
              value={selectedCategoryId || ""}
              onValueChange={(value) => setSelectedCategoryId(value as Id<"categories">)}
            >
              <SelectTrigger className="w-full max-w-md bg-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedCategoryId ? (
        <div className="flex h-[calc(100vh-240px)]">
          {/* Left Sidebar - Units and Lessons Tree (Desktop Only) */}
          <div className="hidden lg:block lg:w-[400px] border-r overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Visualização
              </h3>

              {units && units.length > 0 ? (
                <div className="space-y-1">
                  {units
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((unit) => {
                      const unitLessons = getLessonsForUnit(unit._id);
                      const isExpanded = expandedUnits.has(unit._id);

                      return (
                        <div key={unit._id} className="space-y-1">
                          {/* Unit Header */}
                          <button
                            onClick={() => toggleUnit(unit._id)}
                            className={cn(
                              "w-full flex items-center gap-2 p-3 rounded-lg text-left transition-colors",
                              "hover:bg-white border border-transparent hover:border-gray-200",
                              isExpanded && "bg-white border-gray-200"
                            )}
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {unit.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {unitLessons.length} {unitLessons.length === 1 ? "aula" : "aulas"}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                unit.isPublished
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-700"
                              )}
                            >
                              {unit.isPublished ? "Publicado" : "Rascunho"}
                            </span>
                          </button>

                          {/* Lessons List */}
                          {isExpanded && unitLessons.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {unitLessons.map((lesson) => (
                                <div
                                  key={lesson._id}
                                  className="flex items-center gap-2 p-2 rounded text-sm hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">
                                      {lesson.lessonNumber}. {lesson.title}
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                                      lesson.isPublished
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-200 text-gray-700"
                                    )}
                                  >
                                    {lesson.isPublished ? "Pub" : "Rasc"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma unidade criada nesta categoria ainda
                </p>
              )}
            </div>
          </div>

          {/* Right Content Area - Forms */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Unit Form Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Criar Unidade</h2>
                <UnitForm
                  categories={selectedCategory ? [selectedCategory] : categories}
                />
              </div>

              <Separator className="my-8" />

              {/* Lesson Form Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Criar Aula</h2>
                {units && units.length > 0 ? (
                  <LessonForm units={units} />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Crie uma unidade primeiro para poder adicionar aulas
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-240px)]">
          <p className="text-muted-foreground">
            Selecione uma categoria para começar
          </p>
        </div>
      )}
    </div>
  );
}
