import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

/**
 * Toggle a video as favorite for a user
 */
export const toggleFavorite = mutation({
  args: {
    userId: v.string(),
    videoId: v.id("videos"),
  },
  returns: v.object({
    isFavorited: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      // Remove from favorites
      await ctx.db.delete(existing._id);
      return { isFavorited: false };
    } else {
      // Add to favorites
      await ctx.db.insert("favorites", {
        userId: args.userId,
        videoId: args.videoId,
      });
      return { isFavorited: true };
    }
  },
});

/**
 * Check if a video is favorited by a user
 */
export const isFavorited = query({
  args: {
    userId: v.string(),
    videoId: v.id("videos"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();
    
    return favorite !== null;
  },
});

/**
 * Get paginated list of user's favorite videos
 */
export const getUserFavorites = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("videos"),
        _creationTime: v.number(),
        title: v.string(),
        description: v.string(),
        duration: v.string(),
        videoUrl: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        courseId: v.string(),
        courseName: v.string(),
        moduleId: v.string(),
        moduleName: v.string(),
        subthemeId: v.string(),
        subthemeName: v.string(),
        order: v.number(),
        level: v.union(v.literal("Básico"), v.literal("Intermediário"), v.literal("Avançado")),
        favoritedAt: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get paginated favorites
    const favoritesPage = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Get video details for each favorite
    const videosWithFavorites = await Promise.all(
      favoritesPage.page.map(async (favorite) => {
        const video = await ctx.db.get(favorite.videoId);
        if (!video) {
          throw new Error(`Video ${favorite.videoId} not found`);
        }
        return {
          ...video,
          favoritedAt: favorite._creationTime,
        };
      })
    );

    return {
      page: videosWithFavorites,
      isDone: favoritesPage.isDone,
      continueCursor: favoritesPage.continueCursor,
    };
  },
});

/**
 * Get unwatched first videos from different subthemes for "Watch Also" section
 * Returns up to 3 random videos that are the first in their subtheme
 */
export const getUnwatchedFirstVideos = query({
  args: {
    userId: v.string(),
    count: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("videos"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.string(),
      duration: v.string(),
      videoUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      courseId: v.string(),
      courseName: v.string(),
      moduleId: v.string(),
      moduleName: v.string(),
      subthemeId: v.string(),
      subthemeName: v.string(),
      order: v.number(),
      level: v.union(v.literal("Básico"), v.literal("Intermediário"), v.literal("Avançado")),
    })
  ),
  handler: async (ctx, args) => {
    // Get all first videos (order = 0) from each subtheme
    const allFirstVideos = await ctx.db
      .query("videos")
      .withIndex("by_subtheme_and_order")
      .collect();

    // Filter only videos with order = 0
    const firstVideos = allFirstVideos.filter((video) => video.order === 0);

    // Get user's watched videos
    const watchedVideos = await ctx.db
      .query("progress")
      .withIndex("by_user_and_completed", (q) =>
        q.eq("userId", args.userId).eq("completed", true)
      )
      .collect();

    const watchedVideoIds = new Set(watchedVideos.map((p) => p.videoId));

    // Filter out watched videos
    const unwatchedFirstVideos = firstVideos.filter(
      (video) => !watchedVideoIds.has(video._id)
    );

    // Shuffle and take requested count
    const shuffled = unwatchedFirstVideos.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, args.count);
  },
});

/**
 * Mark a video as completed
 */
export const markAsCompleted = mutation({
  args: {
    userId: v.string(),
    videoId: v.id("videos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: true,
        lastWatchedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("progress", {
        userId: args.userId,
        videoId: args.videoId,
        completed: true,
        lastWatchedAt: Date.now(),
      });
    }

    return null;
  },
});

