import { request } from "@/lib/api/client";

/** Payload to create a story (life story → narrated video). */
export interface StoryCreatePayload {
  /** Story title (e.g. "Grandma's childhood"). */
  title?: string;
  /** Name of the person this story is about. */
  subjectName?: string;
  /** Main biography / life story text. */
  biography: string;
  /** Optional: link to a family tree person ID for context. */
  personId?: string;
}

/** Response from creating a story. */
export interface StoryCreateResponse {
  storyId: string;
  status: "queued" | "processing" | "ready";
  message?: string;
}

/** Scene preview (thumbnail + caption) for the pipeline. */
export interface ScenePreview {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  order?: number;
}

/** Full story status (for polling GET /api/story/:id). */
export interface StoryStatusResponse {
  storyId: string;
  status: "queued" | "processing" | "ready" | "failed";
  progress?: number;
  scenes?: ScenePreview[];
  videoUrl?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * POST /api/story — create a story and start the cinematic pipeline.
 */
export async function createStory(
  payload: StoryCreatePayload
): Promise<StoryCreateResponse> {
  return request<StoryCreateResponse>("/api/story", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/story/:id — get story status, scene previews, and video URL when ready.
 */
export async function getStory(storyId: string): Promise<StoryStatusResponse> {
  return request<StoryStatusResponse>(`/api/story/${storyId}`);
}
