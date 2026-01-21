import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
/**
 * Submit feedback for a lesson (tenant-scoped)
 */
export const submitFeedback = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(), // clerkUserId
    lessonId: v.id("lessons"),
    unitId: v.id("units"),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.feedback || args.feedback.trim().length === 0) {
      throw new Error("Feedback não pode estar vazio");
    }

    // Verify lesson belongs to tenant
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson || lesson.tenantId !== args.tenantId) {
      throw new Error("Aula não encontrada ou não pertence a este tenant");
    }

    const feedbackId = await ctx.db.insert("lessonFeedback", {
      tenantId: args.tenantId,
      userId: args.userId,
      lessonId: args.lessonId,
      unitId: args.unitId,
      feedback: args.feedback.trim(),
      createdAt: Date.now(),
    });

    return feedbackId;
  },
});

/**
 * Get feedback for a lesson
 */
export const getFeedbackByLesson = query({
  args: {
    tenantId: v.id("tenants"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const feedbacks = await ctx.db
      .query("lessonFeedback")
      .withIndex("by_tenantId_and_lessonId", (q) =>
        q.eq("tenantId", args.tenantId).eq("lessonId", args.lessonId),
      )
      .order("desc")
      .collect();

    return feedbacks;
  },
});

/**
 * Get user's feedback for a lesson
 */
export const getUserFeedback = query({
  args: {
    tenantId: v.id("tenants"),
    userId: v.string(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const feedbacks = await ctx.db
      .query("lessonFeedback")
      .withIndex("by_tenantId_and_lessonId", (q) =>
        q.eq("tenantId", args.tenantId).eq("lessonId", args.lessonId),
      )
      .collect();

    const feedback = feedbacks.find((f) => f.userId === args.userId);
    return feedback || null;
  },
});

/**
 * Get all feedback with user and lesson information (tenant admin only) - Paginated
 */
export const getAllFeedbackWithDetails = query({
  args: {
    tenantId: v.id("tenants"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Get feedback for this tenant
    const allFeedbacks = await ctx.db
      .query("lessonFeedback")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")
      .collect();

    // Manual pagination
    const numToSkip = args.paginationOpts.cursor
      ? parseInt(args.paginationOpts.cursor as string)
      : 0;
    const feedbacks = allFeedbacks.slice(
      numToSkip,
      numToSkip + (args.paginationOpts.numItems || 10),
    );

    const feedbackWithDetails = await Promise.all(
      feedbacks.map(async (feedback) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", feedback.userId),
          )
          .first();

        const lesson = await ctx.db.get(feedback.lessonId);
        const unit = await ctx.db.get(feedback.unitId);

        return {
          _id: feedback._id,
          _creationTime: feedback._creationTime,
          userId: feedback.userId,
          lessonId: feedback.lessonId,
          unitId: feedback.unitId,
          feedback: feedback.feedback,
          createdAt: feedback.createdAt,
          userName: user
            ? `${user.firstName} ${user.lastName}`
            : "Usuário desconhecido",
          userEmail: user?.email || "N/A",
          lessonTitle: lesson?.title || "Aula não encontrada",
          unitTitle: unit?.title || "Unidade não encontrada",
        };
      }),
    );

    const hasMore = numToSkip + feedbacks.length < allFeedbacks.length;

    return {
      page: feedbackWithDetails,
      isDone: !hasMore,
      continueCursor: hasMore
        ? String(numToSkip + feedbacks.length)
        : undefined,
    };
  },
});
