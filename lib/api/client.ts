/**
 * API client for backend calls.
 *
 * Resolution:
 * - NEXT_PUBLIC_USE_API_MOCKS=true → no network; responses from lib/api/mocks.ts.
 * - NEXT_PUBLIC_API_URL set → requests go to that base URL (your backend).
 * - NEXT_PUBLIC_API_URL unset → same-origin requests to app/api/... (Next.js routes).
 *
 * See docs/API-RESOLUTION-AND-MOCKS.md for details.
 */

import { handleMockRequest, isMocksEnabled } from "./mocks";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * Performs a request to the backend. Uses mocks, external base URL, or same-origin per env.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  if (isMocksEnabled()) {
    return handleMockRequest<T>(path, options);
  }

  const { params, ...init } = options;
  const base = getBaseUrl();
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base || "http://localhost");
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  const href = base ? url.toString() : `${url.pathname}${url.search}`;
  const response = await fetch(href, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { error?: string })?.error ?? response.statusText;
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
