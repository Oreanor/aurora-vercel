import { request } from "@/lib/api/client";
import { Person } from "@/types/family";

/**
 * Response from starting a video session.
 * Backend may return sessionId, streamUrl for video, or wsUrl for real-time bidirectional.
 */
export interface VideoSession {
  sessionId: string;
  /** Optional URL for video stream (e.g. HLS, WebRTC). */
  streamUrl?: string;
  /** Optional WebSocket URL for real-time avatar / bidirectional video. */
  wsUrl?: string;
  /** Optional message shown to the user (e.g. "Connecting..."). */
  message?: string;
}

/**
 * POST /api/video/session — start a video call session with an AI ancestor (lifelike avatar).
 * Same person/role contract as chat/voice; backend returns session details for stream or WebSocket.
 */
export async function startVideoSession(
  person: Person,
  role: string
): Promise<VideoSession> {
  return request<VideoSession>("/api/video/session", {
    method: "POST",
    body: JSON.stringify({ person, role }),
  });
}
