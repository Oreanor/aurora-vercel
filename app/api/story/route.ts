import { NextResponse } from "next/server";

/**
 * POST /api/story
 * Create a story and queue the cinematic pipeline (life story → narrated video).
 * Body: { title?, subjectName?, biography: string, personId? }
 * Response: { storyId: string, status: "queued" | "processing" | "ready", message? }
 *
 * TODO: Implement with real storytelling pipeline (scene generation, narration, video).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { biography } = body as {
      biography?: string;
    };

    if (!biography || typeof biography !== "string" || !biography.trim()) {
      return NextResponse.json(
        { error: "Biography is required" },
        { status: 400 }
      );
    }

    const storyId = `story-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return NextResponse.json({
      storyId,
      status: "queued",
      message: "Story created. Pipeline integration pending.",
    });
  } catch (error) {
    console.error("Story create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
