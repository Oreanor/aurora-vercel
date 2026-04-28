import { NextResponse } from "next/server";
import { generateSimliSessionToken, generateIceServers } from "simli-client";
import { Person } from "@/types/family";

/**
 * POST /api/video/session
 * Resolves faceId (creates from person photo if possible), generates Simli
 * session token and ICE servers server-side. The API key never reaches the browser.
 */
export async function POST(req: Request) {
  try {
    const { person } = (await req.json()) as { person?: Person };
    const simliKey = process.env.SIMLI_API_KEY;
    const defaultFaceId = process.env.SIMLI_DEFAULT_FACE_ID ?? "tmp9i8bbq7c";

    if (!simliKey) {
      return NextResponse.json({ error: "SIMLI_API_KEY is not configured" }, { status: 500 });
    }

    // Resolve faceId: try to create from person photo, fall back to default
    let faceId = defaultFaceId;
    if (person?.photo) {
      try {
        const res = await fetch("https://api.simli.ai/createFaceFromImageURL", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ URL: person.photo, name: `${person.firstName ?? "ancestor"}-aurora` }),
        });
        if (res.ok) {
          const data = (await res.json()) as { faceId?: string };
          if (data.faceId) faceId = data.faceId;
        }
      } catch {
        // fall through to default
      }
    }

    // Generate session token and ICE servers on the server — key stays here
    const [{ session_token }, iceServers] = await Promise.all([
      generateSimliSessionToken({
        config: { faceId, handleSilence: true, maxSessionLength: 600, maxIdleTime: 30 },
        apiKey: simliKey,
      }),
      generateIceServers(simliKey).catch(() => null),
    ]);

    return NextResponse.json({ sessionToken: session_token, iceServers, faceId });
  } catch (error) {
    console.error("Video session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
