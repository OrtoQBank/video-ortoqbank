import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  // Videos/Lessons table
  videos: defineTable({
    title: v.string(),
    description: v.string(),
    duration: v.string(), // formato "15:34"
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    categoryId: v.string(),
    categoryName: v.string(),
    moduleId: v.string(),
    moduleName: v.string(),
    subthemeId: v.string(),
    subthemeName: v.string(),
    order: v.number(), // ordem dentro do subtema
    level: v.union(v.literal("Básico"), v.literal("Intermediário"), v.literal("Avançado")),
  })
    .index("by_category", ["categoryId"])
    .index("by_module", ["moduleId"])
    .index("by_subtheme", ["subthemeId"])
    .index("by_subtheme_and_order", ["subthemeId", "order"]),

  // User progress/watched videos
  progress: defineTable({
    userId: v.string(),
    videoId: v.id("videos"),
    completed: v.boolean(),
    lastWatchedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_video", ["userId", "videoId"])
    .index("by_user_and_completed", ["userId", "completed"]),
});
