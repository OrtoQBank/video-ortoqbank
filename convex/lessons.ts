import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query para listar todas as lessons
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      bunnyStoragePath: v.optional(v.string()),
      publicUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      durationSeconds: v.number(),
      order_index: v.number(),
      lessonNumber: v.number(),
      isPublished: v.boolean(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    return lessons;
  },
});

// Query para listar lessons de um módulo específico
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      bunnyStoragePath: v.optional(v.string()),
      publicUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      durationSeconds: v.number(),
      order_index: v.number(),
      lessonNumber: v.number(),
      isPublished: v.boolean(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_moduleId_and_order", (q) => 
        q.eq("moduleId", args.moduleId)
      )
      .collect();

    return lessons;
  },
});

// Query para listar apenas lessons publicadas de um módulo
export const listPublishedByModule = query({
  args: { moduleId: v.id("modules") },
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      bunnyStoragePath: v.optional(v.string()),
      publicUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      durationSeconds: v.number(),
      order_index: v.number(),
      lessonNumber: v.number(),
      isPublished: v.boolean(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_moduleId_and_order", (q) => 
        q.eq("moduleId", args.moduleId)
      )
      .collect();

    // Filtrar apenas as publicadas
    return lessons.filter(lesson => lesson.isPublished);
  },
});

// Query para buscar uma lesson por ID
export const getById = query({
  args: { id: v.id("lessons") },
  returns: v.union(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      bunnyStoragePath: v.optional(v.string()),
      publicUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      durationSeconds: v.number(),
      order_index: v.number(),
      lessonNumber: v.number(),
      isPublished: v.boolean(),
      tags: v.optional(v.array(v.string())),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);
    return lesson;
  },
});

// Query para buscar uma lesson por slug
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("lessons"),
      _creationTime: v.number(),
      moduleId: v.id("modules"),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      bunnyStoragePath: v.optional(v.string()),
      publicUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      durationSeconds: v.number(),
      order_index: v.number(),
      lessonNumber: v.number(),
      isPublished: v.boolean(),
      tags: v.optional(v.array(v.string())),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    return lesson;
  },
});

// Mutation para criar uma nova lesson
export const create = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    bunnyStoragePath: v.optional(v.string()),
    publicUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    durationSeconds: v.number(),
    order_index: v.number(),
    lessonNumber: v.number(),
    isPublished: v.boolean(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("lessons"),
  handler: async (ctx, args) => {
    // Verificar se já existe uma lesson com o mesmo slug
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Já existe uma aula com este slug");
    }

    const lessonId: Id<"lessons"> = await ctx.db.insert("lessons", {
      moduleId: args.moduleId,
      title: args.title,
      slug: args.slug,
      description: args.description,
      bunnyStoragePath: args.bunnyStoragePath,
      publicUrl: args.publicUrl,
      thumbnailUrl: args.thumbnailUrl,
      durationSeconds: args.durationSeconds,
      order_index: args.order_index,
      lessonNumber: args.lessonNumber,
      isPublished: args.isPublished,
      tags: args.tags,
    });

    // Atualizar o total de lessons no módulo
    const module = await ctx.db.get(args.moduleId);
    if (module) {
      await ctx.db.patch(args.moduleId, {
        totalLessonVideos: module.totalLessonVideos + 1,
      });
    }

    return lessonId;
  },
});

// Mutation para atualizar uma lesson
export const update = mutation({
  args: {
    id: v.id("lessons"),
    moduleId: v.id("modules"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    bunnyStoragePath: v.optional(v.string()),
    publicUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    durationSeconds: v.number(),
    order_index: v.number(),
    lessonNumber: v.number(),
    isPublished: v.boolean(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verificar se já existe outra lesson com o mesmo slug
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error("Já existe uma aula com este slug");
    }

    await ctx.db.patch(args.id, {
      moduleId: args.moduleId,
      title: args.title,
      slug: args.slug,
      description: args.description,
      bunnyStoragePath: args.bunnyStoragePath,
      publicUrl: args.publicUrl,
      thumbnailUrl: args.thumbnailUrl,
      durationSeconds: args.durationSeconds,
      order_index: args.order_index,
      lessonNumber: args.lessonNumber,
      isPublished: args.isPublished,
      tags: args.tags,
    });

    return null;
  },
});

// Mutation para deletar uma lesson
export const remove = mutation({
  args: {
    id: v.id("lessons"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);
    
    if (!lesson) {
      throw new Error("Aula não encontrada");
    }

    await ctx.db.delete(args.id);

    // Atualizar o total de lessons no módulo
    const module = await ctx.db.get(lesson.moduleId);
    if (module && module.totalLessonVideos > 0) {
      await ctx.db.patch(lesson.moduleId, {
        totalLessonVideos: module.totalLessonVideos - 1,
      });
    }

    return null;
  },
});

// Mutation para alternar o status de publicação de uma lesson
export const togglePublish = mutation({
  args: {
    id: v.id("lessons"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);
    
    if (!lesson) {
      throw new Error("Aula não encontrada");
    }

    const newPublishStatus = !lesson.isPublished;

    await ctx.db.patch(args.id, {
      isPublished: newPublishStatus,
    });

    return newPublishStatus;
  },
});

