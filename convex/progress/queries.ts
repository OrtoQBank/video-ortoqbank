import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get user progress for a specific lesson within a tenant
 */
export const getLessonProgress = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_tenantId_and_userId_and_lessonId", (q) =>
        q
          .eq("tenantId", args.tenantId)
          .eq("userId", args.userId)
          .eq("lessonId", args.lessonId),
      )
      .unique();

    return progress;
  },
});

/**
 * Get user progress for a specific unit within a tenant
 */
export const getUnitProgress = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    unitId: v.id("units"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("unitProgress")
      .withIndex("by_tenantId_and_userId_and_unitId", (q) =>
        q
          .eq("tenantId", args.tenantId)
          .eq("userId", args.userId)
          .eq("unitId", args.unitId),
      )
      .unique();

    return progress;
  },
});

/**
 * Get global progress for a user within a tenant
 */
export const getGlobalProgress = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userGlobalProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .unique();

    return progress;
  },
});

/**
 * Get all lesson progress for a user in a specific unit within a tenant
 */
export const getUnitLessonsProgress = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    unitId: v.id("units"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .collect();

    // Filter to this unit only
    return progress.filter((p) => p.unitId === args.unitId);
  },
});

/**
 * Get all unit progress for a user within a tenant
 */
export const getAllUnitProgress = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("unitProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .collect();

    return progress;
  },
});

/**
 * Get all completed lessons for a user within a tenant
 */
export const getCompletedLessons = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .collect();

    // Filter to completed only
    return progress.filter((p) => p.completed);
  },
});

/**
 * Get count of completed published lessons
 * OPTIMIZED: Uses userGlobalProgress aggregate table
 */
export const getCompletedPublishedLessonsCount = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Use the aggregate table instead of counting manually
    const globalProgress = await ctx.db
      .query("userGlobalProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .unique();

    return globalProgress?.completedLessonsCount || 0;
  },
});

/**
 * OPTIMIZED: Get unit progress for specific category only
 * Reduces data load from all units to those in the category
 */
export const getUnitProgressByCategory = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // Verify category belongs to tenant
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.tenantId !== args.tenantId) {
      return [];
    }

    // Get units for this category
    const units = await ctx.db
      .query("units")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .take(200);

    const unitIds = new Set(units.map((u) => u._id));

    // Get progress only for this tenant and user
    const allProgress = await ctx.db
      .query("unitProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .collect();

    return allProgress.filter((p) => unitIds.has(p.unitId));
  },
});

/**
 * OPTIMIZED: Get completed lessons for specific category only
 */
export const getCompletedLessonsByCategory = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // Verify category belongs to tenant
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.tenantId !== args.tenantId) {
      return [];
    }

    // Get lessons for this category
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .take(1000);

    const lessonIds = new Set(lessons.map((l) => l._id));

    // Get completed progress for this tenant and user
    const allProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_tenantId_and_userId", (q) =>
        q.eq("tenantId", args.tenantId).eq("userId", args.userId),
      )
      .collect();

    return allProgress.filter((p) => p.completed && lessonIds.has(p.lessonId));
  },
});
