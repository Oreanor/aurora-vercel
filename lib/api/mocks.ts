/**
 * Client-side API mocks. Used when NEXT_PUBLIC_USE_API_MOCKS=true.
 * Responses match the real API contract so the app works without a backend.
 */

import { mockFamilyTrees } from "@/lib/mock-family-data";
import type { RequestOptions } from "./client";

function getRole(email: string, tree: (typeof mockFamilyTrees)[0]): "owner" | "editor" | "viewer" {
  if (tree.access.owner.includes(email)) return "owner";
  if (tree.access.editor.includes(email)) return "editor";
  return "viewer";
}

function parseBody(options: RequestOptions): Record<string, unknown> {
  if (!options.body || typeof options.body !== "string") return {};
  return JSON.parse(options.body) as Record<string, unknown>;
}

function matchPath(pathParts: string[], ...segments: string[]): boolean {
  if (pathParts.length !== segments.length) return false;
  return segments.every((s, i) => s === "*" || pathParts[i] === s);
}

async function mockTreesList(options: RequestOptions): Promise<object> {
  const email = options.params?.email ?? "";
  const trees = mockFamilyTrees.map((tree) => ({
    id: tree.id,
    name: tree.name,
    role: getRole(email, tree),
    createdAt: tree.createdAt,
    updatedAt: tree.updatedAt,
  }));
  return { trees, count: trees.length };
}

async function mockTreeGet(pathParts: string[]): Promise<object> {
  const tree = mockFamilyTrees.find((t) => t.id === pathParts[2]);
  if (!tree) throw new Error("Tree not found");
  return tree;
}

async function mockTreePost(options: RequestOptions): Promise<object> {
  const body = parseBody(options);
  const name = (body.treeData as { data?: { name?: string } } | undefined)?.data?.name;
  return {
    id: `tree-mock-${Date.now()}`,
    name: name ?? "My Family Tree",
    role: "owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function mockTreePut(pathParts: string[], options: RequestOptions): Promise<object> {
  const tree = mockFamilyTrees.find((t) => t.id === pathParts[2]);
  if (!tree) throw new Error("Tree not found or cannot be updated");
  const body = parseBody(options);
  const data = (body.treeData as { data?: unknown } | undefined)?.data ?? tree.data;
  return { ...tree, data, updatedAt: new Date().toISOString() };
}

export async function handleMockRequest<T = object>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const pathNorm = path.replace(/^\/+/, "");
  const pathParts = pathNorm.split("/");

  const route = [
    [() => method === "GET" && matchPath(pathParts, "api", "trees"), () => mockTreesList(options)],
    [() => method === "GET" && matchPath(pathParts, "api", "trees", "*"), () => mockTreeGet(pathParts)],
    [() => method === "POST" && pathNorm === "api/trees", () => mockTreePost(options)],
    [() => method === "PUT" && matchPath(pathParts, "api", "trees", "*"), () => mockTreePut(pathParts, options)],
    [
      () => method === "POST" && pathNorm === "api/chat",
      () => ({ reply: "This is a mock reply. Your message was received. (Set NEXT_PUBLIC_USE_API_MOCKS=false to use the real chat.)" }),
    ],
    [
      () => method === "POST" && pathNorm === "api/voice/session",
      () => ({ sessionId: `voice-mock-${Date.now()}`, message: "Voice session (mock). Backend not called." }),
    ],
    [
      () => method === "POST" && pathNorm === "api/video/session",
      () => ({ sessionId: `video-mock-${Date.now()}`, message: "Video session (mock). Backend not called." }),
    ],
    [
      () => method === "POST" && pathNorm === "api/story",
      () => ({ storyId: `story-mock-${Date.now()}`, status: "queued", message: "Story created (mock). Pipeline not called." }),
    ],
    [
      () => method === "GET" && matchPath(pathParts, "api", "story", "*"),
      () => ({
        storyId: pathParts[2],
        status: "queued",
        progress: 0,
        scenes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ],
  ].find(([match]) => (match as () => boolean)());

  if (route) {
    const result = await Promise.resolve((route[1] as () => object | Promise<object>)());
    return result as T;
  }
  throw new Error(`Mock not implemented: ${method} ${path}`);
}

export function isMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_API_MOCKS === "true";
}
