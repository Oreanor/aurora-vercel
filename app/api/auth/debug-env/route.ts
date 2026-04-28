import { NextResponse } from "next/server";

/**
 * Dev-only: check that auth env vars are loaded locally.
 * Open GET /api/auth/debug-env when running `npm run dev`.
 * Remove or disable in production.
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only in development" }, { status: 404 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const vars = {
    GOOGLE_CLIENT_ID: clientId ? "set" : "missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "set" : "missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "missing",
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "missing",
    // Compare with Google Console: Client ID should start/end with these (no spaces, same project)
    GOOGLE_CLIENT_ID_preview:
      clientId.length > 0
        ? `${clientId.trim().slice(0, 15)}...${clientId.trim().slice(-8)} (length: ${clientId.trim().length})`
        : "n/a",
  };

  return NextResponse.json(vars);
}
