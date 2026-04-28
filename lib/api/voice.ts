import { request } from "@/lib/api/client";
import { Person } from "@/types/family";

/**
 * Response from starting a voice session.
 * Backend may return sessionId, wsUrl for real-time audio, or a stream URL.
 */
export interface VoiceSession {
  sessionId: string;
  /** Optional WebSocket URL for real-time bidirectional voice. */
  wsUrl?: string;
  /** Optional message shown to the user (e.g. "Connecting..."). */
  message?: string;
}

/**
 * POST /api/voice/session — start a voice call session with an AI ancestor.
 * Same person/role contract as chat; backend returns session details for streaming/WebSocket.
 */
export async function startVoiceSession(
  person: Person,
  role: string
): Promise<VoiceSession> {
  return request<VoiceSession>("/api/voice/session", {
    method: "POST",
    body: JSON.stringify({ person, role }),
  });
}
