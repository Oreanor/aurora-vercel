# How API endpoints are resolved and the mock layer

## 1. How endpoints are resolved

All frontend API calls go through `lib/api/client.ts` → `request(path, options)`.

**Base URL**

- `getBaseUrl()` returns `process.env.NEXT_PUBLIC_API_URL ?? ""`.
- If **empty or unset**: the request URL is **relative** (`/api/trees`, `/api/chat`, etc.), so the browser sends the request to the **same origin** (your Next.js app). Next.js handles it with `app/api/**/route.ts` (trees, chat, voice, video, story).
- If **set** (e.g. `NEXT_PUBLIC_API_URL=https://api.mybackend.com`): the request URL is **absolute** (`https://api.mybackend.com/api/trees`). The frontend never talks to local `/api/*`; your external backend must implement the same paths and contract.

**Summary**

| `NEXT_PUBLIC_API_URL` | Request target |
|-----------------------|----------------|
| unset / empty         | Same origin → `app/api/...` (Next.js routes) |
| set                  | That base URL → your backend |

So you can:

- Develop locally without a backend: leave it unset, use Next.js API routes (and stubs/mocks there).
- Point to a real backend: set it in env, implement the contract on the backend.

---

## 2. Mock layer (client-side)

To work without any server (or to force predictable data), the client can use **client-side mocks**: no `fetch`, responses come from in-memory handlers.

**Switch**

- Set `NEXT_PUBLIC_USE_API_MOCKS=true` in `.env.local` (or in env in your host).
- The client’s `request()` will call `lib/api/mocks.ts` and return mock data for the requested path/method instead of sending a real request.

**When to use**

- Demos, screenshots, or UI work when the backend or Next.js API is not ready.
- E2E/playwright tests against a stable, fake API.
- Offline or constrained environments.

**What is mocked**

- Trees: list and get from `lib/mock-family-data.ts` (mock trees only; create/update are in-memory stubs).
- Chat: fake reply text.
- Voice / Video: fake `sessionId` and optional `message`.
- Story: fake `storyId` and status; GET story returns stub status.

Mock handlers live in `lib/api/mocks.ts` and mirror the real API response shapes so the rest of the app does not need to change.
