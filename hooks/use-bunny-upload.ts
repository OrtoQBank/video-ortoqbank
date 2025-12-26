import { useState } from "react";
import { uploadVideoToBunny } from "@/app/actions/bunny";

interface UploadProgress {
  stage: "idle" | "creating" | "uploading" | "complete";
  percentage: number;
}

interface BunnyUploadResult {
  videoId: string;
  libraryId: string;
}

export function useBunnyUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    stage: "idle",
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (
    file: File,
    title: string,
    createdBy: string
  ): Promise<BunnyUploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress({ stage: "creating", percentage: 25 });

    try {
      // Step 1: Create video in Bunny
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
        ".convex.cloud",
        ".convex.site"
      );

      if (!convexUrl) {
        throw new Error("CONVEX_URL not configured");
      }

      const createResponse = await fetch(`${convexUrl}/bunny/create-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "",
          isPrivate: true,
          createdBy,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create video");
      }

      const { videoId, libraryId } = await createResponse.json();
      setProgress({ stage: "uploading", percentage: 50 });

      // Step 2: Upload file via Server Action
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("libraryId", libraryId);
      formData.append("file", file);

      const uploadResult = await uploadVideoToBunny(formData);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      setProgress({ stage: "complete", percentage: 100 });
      return { videoId, libraryId };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setProgress({ stage: "idle", percentage: 0 });
      }, 1000);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress({ stage: "idle", percentage: 0 });
    setError(null);
  };

  return {
    uploadVideo,
    isUploading,
    progress,
    error,
    reset,
  };
}
