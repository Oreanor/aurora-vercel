import { NextResponse } from "next/server";

/**
 * GET /api/story/:id
 * Get story status, scene previews, and video URL when ready.
 * Response: { storyId, status, progress?, scenes?, videoUrl?, error?, createdAt?, updatedAt? }
 *
 * TODO: Implement with real pipeline status and storage.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Stub: return a fixed status for any story id
    return NextResponse.json({
      storyId: id,
      status: "queued",
      progress: 0,
      scenes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Story get error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
