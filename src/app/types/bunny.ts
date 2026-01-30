export interface BunnyVideo {
  videoId: string;
  libraryId: string;
}

export interface BunnyUploadOptions {
  title: string;
  description?: string;
  isPrivate?: boolean;
}

export type UploadStage = "idle" | "creating" | "uploading" | "complete";

export interface UploadProgress {
  stage: UploadStage;
  percentage: number;
}
