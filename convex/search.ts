import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para buscar sugestões de unidades e lessons enquanto digita
export const getSuggestions = query({
  args: { query: v.string() },
  returns: v.object({
    units: v.array(
      v.object({
        _id: v.id("units"),
        title: v.string(),
        description: v.string(),
        categoryId: v.id("categories"),
        categoryTitle: v.string(),
      })
    ),
    lessons: v.array(
      v.object({
        _id: v.id("lessons"),
        title: v.string(),
        description: v.string(),
        unitId: v.id("units"),
        unitTitle: v.string(),
        categoryId: v.id("categories"),
        categoryTitle: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    
    if (!searchQuery || searchQuery.length < 2) {
      return { units: [], lessons: [] };
    }

    // Buscar unidades publicadas
    const allUnits = await ctx.db
      .query("units")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Buscar lessons publicadas
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Filtrar unidades que contenham a query no título ou descrição
    const matchedUnits: Array<{
      _id: Id<"units">;
      title: string;
      description: string;
      categoryId: Id<"categories">;
      categoryTitle: string;
    }> = [];
    for (const unit of allUnits) {
      const titleMatch = unit.title.toLowerCase().includes(searchQuery);
      const descMatch = unit.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar categoria da unidade
        const category = await ctx.db.get(unit.categoryId);
        if (category && category.isPublished) {
          matchedUnits.push({
            _id: unit._id,
            title: unit.title,
            description: unit.description,
            categoryId: unit.categoryId,
            categoryTitle: category.title,
          });
        }
      }
    }

    // Filtrar lessons que contenham a query no título ou descrição
    const matchedLessons: Array<{
      _id: Id<"lessons">;
      title: string;
      description: string;
      unitId: Id<"units">;
      unitTitle: string;
      categoryId: Id<"categories">;
      categoryTitle: string;
    }> = [];
    for (const lesson of allLessons) {
      const titleMatch = lesson.title.toLowerCase().includes(searchQuery);
      const descMatch = lesson.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar unidade e categoria da lesson
        const unit = await ctx.db.get(lesson.unitId);
        if (unit && unit.isPublished) {
          const category = await ctx.db.get(unit.categoryId);
          if (category && category.isPublished) {
            matchedLessons.push({
              _id: lesson._id,
              title: lesson.title,
              description: lesson.description,
              unitId: lesson.unitId,
              unitTitle: unit.title,
              categoryId: unit.categoryId,
              categoryTitle: category.title,
            });
          }
        }
      }
    }

    // Limitar resultados (max 5 de cada tipo)
    return {
      units: matchedUnits.slice(0, 5),
      lessons: matchedLessons.slice(0, 5),
    };
  },
});

// Query para buscar categorias que contenham a query em qualquer lugar
export const searchCategories = query({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      position: v.number(),
      iconUrl: v.optional(v.string()),
      isPublished: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    
    if (!searchQuery) {
      // Se não há query, retornar todas as categorias publicadas
      return await ctx.db
        .query("categories")
        .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
        .collect();
    }

    // Buscar todas as categorias publicadas
    const allCategories = await ctx.db
      .query("categories")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Buscar todas as unidades e lessons publicados
    const allUnits = await ctx.db
      .query("units")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Set para armazenar IDs de categorias que correspondem
    const matchedCategoryIds = new Set<string>();

    // 1. Buscar categorias cujo título ou descrição contenham a query
    for (const category of allCategories) {
      const titleMatch = category.title.toLowerCase().includes(searchQuery);
      const descMatch = category.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        matchedCategoryIds.add(category._id);
      }
    }

    // 2. Buscar unidades cujo título ou descrição contenham a query
    for (const unit of allUnits) {
      const titleMatch = unit.title.toLowerCase().includes(searchQuery);
      const descMatch = unit.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        matchedCategoryIds.add(unit.categoryId);
      }
    }

    // 3. Buscar lessons cujo título ou descrição contenham a query
    for (const lesson of allLessons) {
      const titleMatch = lesson.title.toLowerCase().includes(searchQuery);
      const descMatch = lesson.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar a unidade desta lesson para obter o categoryId
        const unit = await ctx.db.get(lesson.unitId);
        if (unit) {
          matchedCategoryIds.add(unit.categoryId);
        }
      }
    }

    // Retornar apenas as categorias que foram encontradas
    return allCategories.filter((cat) => matchedCategoryIds.has(cat._id));
  },
});
