/**
 * Bunny Stream Video Management Actions
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

/**
 * Create a new video in Bunny Stream library
 * Returns the video ID and upload credentials
 */
export const createVideo = action({
  args: {
    title: v.string(),
    createdBy: v.string(),
  },
  returns: v.object({
    videoId: v.string(),
    libraryId: v.string(),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.BUNNY_LIBRARY_ID;

    if (!apiKey || !libraryId) {
      throw new Error("Bunny credentials not configured (BUNNY_API_KEY, BUNNY_LIBRARY_ID)");
    }

    // Create video in Bunny
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: args.title }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bunny API error: ${errorText}`);
    }

    const videoData = await response.json();
    const videoId = videoData.guid;

    // Save video to Convex database
    try {
      await ctx.runMutation(api.videos.create, {
        videoId,
        libraryId,
        title: args.title,
        description: "",
        createdBy: args.createdBy,
        isPrivate: true,
        status: "uploading",
      });
    } catch (dbError) {
      console.error("Failed to save video to database:", dbError);
      // Video is created in Bunny but not saved in DB
      // Continue anyway so upload can proceed
    }

    return {
      videoId,
      libraryId,
      title: args.title,
    };
  },
});

