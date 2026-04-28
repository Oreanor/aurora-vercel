import { NextResponse } from "next/server";

/**
 * POST /api/voice/session
 * Returns Gemini Live model config. The actual WebSocket is opened client-side
 * using NEXT_PUBLIC_GEMINI_API_KEY. This route exists for future auth proxy use.
 */
export async function POST() {
  return NextResponse.json({
    model: "models/gemini-2.0-flash-exp",
    voiceName: "Charon",
  });
}
