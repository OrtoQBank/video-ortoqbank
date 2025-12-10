import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para buscar sugestões de módulos e lessons enquanto digita
export const getSuggestions = query({
  args: { query: v.string() },
  returns: v.object({
    modules: v.array(
      v.object({
        _id: v.id("modules"),
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
        moduleId: v.id("modules"),
        moduleTitle: v.string(),
        categoryId: v.id("categories"),
        categoryTitle: v.string(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    
    if (!searchQuery || searchQuery.length < 2) {
      return { modules: [], lessons: [] };
    }

    // Buscar módulos publicados
    const allModules = await ctx.db
      .query("modules")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Buscar lessons publicadas
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .collect();

    // Filtrar módulos que contenham a query no título ou descrição
    const matchedModules: Array<{
      _id: Id<"modules">;
      title: string;
      description: string;
      categoryId: Id<"categories">;
      categoryTitle: string;
    }> = [];
    for (const module of allModules) {
      const titleMatch = module.title.toLowerCase().includes(searchQuery);
      const descMatch = module.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar categoria do módulo
        const category = await ctx.db.get(module.categoryId);
        if (category && category.isPublished) {
          matchedModules.push({
            _id: module._id,
            title: module.title,
            description: module.description,
            categoryId: module.categoryId,
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
      moduleId: Id<"modules">;
      moduleTitle: string;
      categoryId: Id<"categories">;
      categoryTitle: string;
    }> = [];
    for (const lesson of allLessons) {
      const titleMatch = lesson.title.toLowerCase().includes(searchQuery);
      const descMatch = lesson.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar módulo e categoria da lesson
        const module = await ctx.db.get(lesson.moduleId);
        if (module && module.isPublished) {
          const category = await ctx.db.get(module.categoryId);
          if (category && category.isPublished) {
            matchedLessons.push({
              _id: lesson._id,
              title: lesson.title,
              description: lesson.description,
              moduleId: lesson.moduleId,
              moduleTitle: module.title,
              categoryId: module.categoryId,
              categoryTitle: category.title,
            });
          }
        }
      }
    }

    // Limitar resultados (max 5 de cada tipo)
    return {
      modules: matchedModules.slice(0, 5),
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

    // Buscar todos os módulos e lessons publicados
    const allModules = await ctx.db
      .query("modules")
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

    // 2. Buscar módulos cujo título ou descrição contenham a query
    for (const module of allModules) {
      const titleMatch = module.title.toLowerCase().includes(searchQuery);
      const descMatch = module.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        matchedCategoryIds.add(module.categoryId);
      }
    }

    // 3. Buscar lessons cujo título ou descrição contenham a query
    for (const lesson of allLessons) {
      const titleMatch = lesson.title.toLowerCase().includes(searchQuery);
      const descMatch = lesson.description.toLowerCase().includes(searchQuery);
      
      if (titleMatch || descMatch) {
        // Buscar o módulo desta lesson para obter o categoryId
        const module = await ctx.db.get(lesson.moduleId);
        if (module) {
          matchedCategoryIds.add(module.categoryId);
        }
      }
    }

    // Retornar apenas as categorias que foram encontradas
    return allCategories.filter((cat) => matchedCategoryIds.has(cat._id));
  },
});
