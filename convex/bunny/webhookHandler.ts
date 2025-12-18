/**
 * Bunny Stream Webhook Handler
 * Handles video processing notifications from Bunny CDN
 */

import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

/**
 * SHA256 hash utility (shared)
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Map Bunny video status codes to our schema status
 */
function mapBunnyStatus(
  bunnyStatus: number,
): "uploading" | "processing" | "ready" | "failed" {
  switch (bunnyStatus) {
    case 4: // Encoded/Ready
      return "ready";
    case 5: // Failed
      return "failed";
    case 3: // Processing
      return "processing";
    default:
      return "processing";
  }
}

/**
 * Bunny webhook payload interface
 */
interface BunnyWebhookPayload {
  VideoGuid: string;
  Status: number;
  VideoLibraryId: string;
  [key: string]: unknown;
}

/**
 * Process webhook payload and update video in database
 */
export async function processBunnyWebhook(
  ctx: ActionCtx,
  body: BunnyWebhookPayload,
  signature: string | null,
) {
  // Validate webhook signature if secret is configured
  const webhookSecret = process.env.BUNNY_WEBHOOK_SECRET;
  if (webhookSecret && signature) {
    const expectedSignature = await sha256(
      webhookSecret + JSON.stringify(body),
    );
    if (signature !== expectedSignature) {
      throw new Error("Invalid webhook signature");
    }
  }

  const { VideoGuid, Status, VideoLibraryId } = body;

  if (!VideoGuid || !VideoLibraryId) {
    throw new Error("Missing required webhook fields: VideoGuid or VideoLibraryId");
  }

  console.log("Bunny webhook received:", { VideoGuid, Status, VideoLibraryId });

  // Map status
  const convexStatus = mapBunnyStatus(Status);

  // Fetch complete video information from Bunny API
  const apiKey = process.env.BUNNY_API_KEY;
  if (!apiKey) {
    throw new Error("BUNNY_API_KEY not configured");
  }

  try {
    const videoInfoResponse = await fetch(
      `https://video.bunnycdn.com/library/${VideoLibraryId}/videos/${VideoGuid}`,
      {
        headers: {
          AccessKey: apiKey,
          Accept: "application/json",
        },
      },
    );

    if (videoInfoResponse.ok) {
      const videoInfo = await videoInfoResponse.json();

      // Update database with complete information
      await ctx.runMutation(internal.videos.updateFromWebhook, {
        videoId: VideoGuid,
        status: convexStatus,
        thumbnailUrl: videoInfo.thumbnailFileName
          ? `https://vz-${VideoLibraryId}.b-cdn.net/${VideoGuid}/${videoInfo.thumbnailFileName}`
          : undefined,
        hlsUrl:
          convexStatus === "ready"
            ? `https://vz-${VideoLibraryId}.b-cdn.net/${VideoGuid}/playlist.m3u8`
            : undefined,
        metadata: {
          duration: videoInfo.length || undefined,
          width: videoInfo.width || undefined,
          height: videoInfo.height || undefined,
          framerate: videoInfo.framerate || undefined,
          bitrate: videoInfo.bitrate || undefined,
        },
      });
    } else {
      // If fetching details fails, update only status
      await ctx.runMutation(internal.videos.updateFromWebhook, {
        videoId: VideoGuid,
        status: convexStatus,
      });
    }

    return { success: true, videoId: VideoGuid, status: convexStatus };
  } catch (error) {
    console.error("Error processing webhook:", error);
    throw error;
  }
}
