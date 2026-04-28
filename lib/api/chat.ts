import { request } from "@/lib/api/client";
import { Person } from "@/types/family";

/** POST /api/chat response. */
export interface ChatReply {
  reply: string;
}

/**
 * POST /api/chat — send a message and get AI reply for the given person/role.
 */
export async function sendChatMessage(
  message: string,
  person: Person,
  role: string
): Promise<ChatReply> {
  return request<ChatReply>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, person, role }),
  });
}
