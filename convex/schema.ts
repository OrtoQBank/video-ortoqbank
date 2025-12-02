import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    role: v.union(v.literal("user"), v.literal("admin")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended")),
    hasActiveYearAccess: v.boolean(),
    paid: v.boolean(),
    paymentDate: v.optional(v.number()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    testeId: v.optional(v.string()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_hasActiveYearAccess", ["hasActiveYearAccess"]),

  // Categories table
  categories: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    position: v.number(),
    iconUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_position", ["position"]),

  // Modules table (formerly courses)
  modules: defineTable({
    categoryId: v.id("categories"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    order_index: v.number(),
    totalLessonVideos: v.number(),
  })
    .index("by_categoryId", ["categoryId"])
    .index("by_slug", ["slug"])
    .index("by_categoryId_and_order", ["categoryId", "order_index"]),

  // Lessons table (video lessons)
  lessons: defineTable({
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
    .index("by_moduleId", ["moduleId"])
    .index("by_slug", ["slug"])
    .index("by_moduleId_and_order", ["moduleId", "order_index"])
    .index("by_isPublished", ["isPublished"]),
});
