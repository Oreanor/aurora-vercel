# Backend API contract (for backend developers)

This document describes what the Aurora frontend expects from the backend: endpoints, request/response shapes, types, and how to connect your backend with minimal configuration.

**Overview:** The frontend calls nine endpoints — trees (list, get, create, update), chat (text with AI ancestor), voice (voice call session), video (video call with lifelike avatar), and story (create story, get status for the cinematic pipeline). All use the same base URL and JSON; auth is not required by default.

**Machine-readable contract:** OpenAPI 3.0 spec is in [`docs/openapi.yaml`](./openapi.yaml). Use it for codegen, Postman/Insomnia import, or contract tests.

**Contents:** [Quick start](#quick-start-for-backend) · [Implementation status](#implementation-status) · [1. Where to look](#1-where-to-look-in-the-frontend-repo) · [2. Base URL and paths](#2-base-url-and-paths) · [3. Endpoints and contract](#3-endpoints-and-contract) · [4. Domain types](#4-domain-types-for-requestresponse-bodies) · [5. How to connect](#5-how-to-connect-your-backend) · [6. Summary table](#6-summary-table)

---

## Implementation status

Current Next.js API routes (`app/api/*`) status when `NEXT_PUBLIC_API_URL` is unset:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/chat` | ✅ Implemented | Mistral AI, real LLM replies |
| `POST /api/voice/session` | ⚠️ Stub | Returns `sessionId` + placeholder message; no WebSocket/streaming |
| `POST /api/video/session` | ⚠️ Stub | Returns `sessionId` + placeholder message; no avatar/stream |
| `GET/POST/PUT /api/trees` | ⚠️ Mock + in-memory | Uses mock data; create/update stored in memory only |
| `POST /api/story` | ⚠️ Stub | Returns `storyId`; no real pipeline |
| `GET /api/story/:id` | ⚠️ Stub | Returns stub status; no scene/video generation |

To fully replace with your backend, implement all nine endpoints. The frontend will use them when `NEXT_PUBLIC_API_URL` is set.

---

## Quick start for backend

1. **Implement** the nine paths listed in [§ 2](#2-base-url-and-paths) with the request/response shapes in [§ 3](#3-endpoints-and-contract). Optionally import [`docs/openapi.yaml`](./openapi.yaml) into your stack (codegen, Postman, etc.).
2. **CORS:** Allow the frontend origin and `GET` / `POST` / `PUT`, `Content-Type`, and (if you add auth) `Authorization`.
3. **Errors:** Return JSON with an `error` field on 4xx/5xx when possible, e.g. `{ "error": "Tree not found" }`.
4. **Frontend config:** Set `NEXT_PUBLIC_API_URL=https://your-backend.example.com` (no trailing slash) in the frontend env so all `/api/*` requests go to your server.
5. **Env reference:** The frontend uses `.env.example` as a template; the only var that points at your backend is `NEXT_PUBLIC_API_URL`.

---

## 1. Where to look in the frontend repo

| What | Where |
|------|--------|
| **API client (base URL, fetch wrapper)** | `lib/api/client.ts` |
| **Trees API (list, get, create, update)** | `lib/api/trees.ts` |
| **Chat API** | `lib/api/chat.ts` |
| **Endpoint list + short contract** | `lib/api/index.ts` (comment at top) |
| **Domain types (Person, Tree, etc.)** | `types/family.ts` |
| **Voice API** | `lib/api/voice.ts` |
| **Video API** | `lib/api/video.ts` |
| **Story API** | `lib/api/story.ts` |
| **Current Next.js API routes (reference impl)** | `app/api/trees/`, `app/api/trees/[id]/`, `app/api/chat/`, `app/api/voice/session/`, `app/api/video/session/`, `app/api/story/`, `app/api/story/[id]/` |

The frontend never calls the backend directly from UI: all calls go through `lib/api/*`. So your backend only needs to implement the contract below; the frontend will use it when `NEXT_PUBLIC_API_URL` is set (see [§ 5](#5-how-to-connect-your-backend)).

---

## 2. Base URL and paths

- The frontend uses a **single base URL** for all backend requests (env: `NEXT_PUBLIC_API_URL`).
- If `NEXT_PUBLIC_API_URL` is **empty or unset**, requests go to the **same origin** (Next.js `/api/...` routes).
- If set (e.g. `https://api.mybackend.com`), every request is sent to `{baseUrl}{path}`.

All paths are **absolute from root** and must be exposed by your backend **as-is**:

- `GET  /api/trees`
- `GET  /api/trees/:id`
- `POST /api/trees`
- `PUT  /api/trees/:id`
- `POST /api/chat`
- `POST /api/voice/session`
- `POST /api/video/session`
- `POST /api/story`
- `GET  /api/story/:id`

So your server must serve these paths (and only these) with the request/response contract below.

---

## 3. Endpoints and contract

### 3.1 GET `/api/trees` — list trees for a user

**Query**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email; backend returns trees where this user is owner, editor, or viewer. |

**Response: 200**

```json
{
  "trees": [
    {
      "id": "string",
      "name": "string (optional)",
      "role": "owner" | "editor" | "viewer",
      "createdAt": "string (ISO date, optional)",
      "updatedAt": "string (ISO date, optional)"
    }
  ],
  "count": 0
}
```

**Errors**

- `400` — missing `email`. Body: `{ "error": "Email is required" }`.
- `500` — body: `{ "error": "..." }`.

---

### 3.2 GET `/api/trees/:id` — get one tree

**Path**

- `id` — tree ID.

**Response: 200**

Full tree with metadata and access:

```json
{
  "id": "string",
  "name": "string (optional)",
  "data": {
    "persons": [ { ... } ],
    "relationships": [ { ... } ]
  },
  "access": {
    "owner": ["email1", "email2"],
    "editor": ["email3"],
    "viewer": ["email4"]
  },
  "createdAt": "string (optional)",
  "updatedAt": "string (optional)"
}
```

**Errors**

- `404` — tree not found. Body: `{ "error": "Tree not found" }`.
- `500` — body: `{ "error": "..." }`.

---

### 3.3 POST `/api/trees` — create tree

**Request body**

```json
{
  "email": "string (creator/owner email)",
  "treeData": {
    "data": {
      "persons": [ ... ],
      "relationships": [ ... ]
    }
  }
}
```

**Response: 200**

Return the created tree **metadata** (same shape as one item in the list from GET `/api/trees`):

```json
{
  "id": "string",
  "name": "string (optional)",
  "role": "owner",
  "createdAt": "string (optional)",
  "updatedAt": "string (optional)"
}
```

**Errors**

- `400` — missing `email` or `treeData`. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

---

### 3.4 PUT `/api/trees/:id` — update tree

**Path**

- `id` — tree ID.

**Request body**

```json
{
  "treeData": {
    "data": {
      "persons": [ ... ],
      "relationships": [ ... ]
    }
  }
}
```

**Response: 200**

Return the **full tree** (same shape as GET `/api/trees/:id`):

```json
{
  "id": "string",
  "name": "string (optional)",
  "data": { "persons": [ ... ], "relationships": [ ... ] },
  "access": { "owner": [], "editor": [], "viewer": [] },
  "createdAt": "string (optional)",
  "updatedAt": "string (optional)"
}
```

**Errors**

- `400` — missing `treeData`. Body: `{ "error": "Tree data is required" }`.
- `404` — tree not found or not editable. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

---

### 3.5 POST `/api/chat` — chat with AI as a family member

**Request body**

```json
{
  "message": "string (user message)",
  "person": { ... Person object ... },
  "role": "string (e.g. Father, Mother, You)"
}
```

`person` must match the frontend `Person` type (see § 5).

**Response: 200**

```json
{
  "reply": "string"
}
```

**Errors**

- `400` — missing `message`, `person`, or `role`. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

The frontend currently uses this to call an LLM (e.g. Mistral) with a system prompt built from `person` and `role`. Your backend can implement the same logic or delegate to your own service; the contract is only request/response above.

---

### 3.6 POST `/api/voice/session` — start a voice call with an AI ancestor

**Request body**

```json
{
  "person": { ... Person object ... },
  "role": "string (e.g. Father, Mother, You)"
}
```

Same `person` and `role` contract as chat; used to start a voice session (real-time or streaming).

**Response: 200**

```json
{
  "sessionId": "string",
  "wsUrl": "string (optional — WebSocket URL for bidirectional voice)",
  "message": "string (optional — e.g. Connecting...)"
}
```

**Errors**

- `400` — missing `person` or `role`. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

The frontend uses this to begin a voice call; the backend can return a `sessionId` and optionally a `wsUrl` for a WebSocket connection for real-time audio. Until the voice pipeline is implemented, the frontend accepts a stub response with `sessionId` and optional `message`.

---

### 3.7 POST `/api/video/session` — start a video call with an AI ancestor (lifelike avatar)

**Request body**

```json
{
  "person": { ... Person object ... },
  "role": "string (e.g. Father, Mother, You)"
}
```

Same `person` and `role` contract as chat/voice; used to start a video session (lifelike avatar, expressions, smooth motion).

**Response: 200**

```json
{
  "sessionId": "string",
  "streamUrl": "string (optional — e.g. HLS, WebRTC video stream)",
  "wsUrl": "string (optional — WebSocket URL for real-time avatar / bidirectional video)",
  "message": "string (optional — e.g. Connecting...)"
}
```

**Errors**

- `400` — missing `person` or `role`. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

The frontend uses this to begin a video call with a lifelike AI avatar (facial expressions, emotional feedback, cinematic space). The backend can return `sessionId` and optionally `streamUrl` and/or `wsUrl`. Until the avatar pipeline is implemented, the frontend accepts a stub response with `sessionId` and optional `message`.

---

### 3.8 POST `/api/story` — create a story (cinematic pipeline: life story → narrated video)

**Request body**

```json
{
  "title": "string (optional)",
  "subjectName": "string (optional — name of the person this story is about)",
  "biography": "string (required — life story text)",
  "personId": "string (optional — family tree person ID for context)"
}
```

**Response: 200**

```json
{
  "storyId": "string",
  "status": "queued | processing | ready",
  "message": "string (optional)"
}
```

**Errors**

- `400` — missing or empty `biography`. Body: `{ "error": "Biography is required" }`.
- `500` — body: `{ "error": "..." }`.

The frontend uses this to start the pipeline that turns a life story into a narrated video. The backend should queue the job and return a `storyId` for polling.

---

### 3.9 GET `/api/story/:id` — get story status, scene previews, and video URL

**Path**

- `id` — story ID returned from POST /api/story.

**Response: 200**

```json
{
  "storyId": "string",
  "status": "queued | processing | ready | failed",
  "progress": 0,
  "scenes": [
    { "id": "string", "title": "string (optional)", "thumbnailUrl": "string (optional)", "order": 0 }
  ],
  "videoUrl": "string (optional — when status is ready)",
  "error": "string (optional — when status is failed)",
  "createdAt": "string (optional)",
  "updatedAt": "string (optional)"
}
```

**Errors**

- `404` — story not found. Body: `{ "error": "..." }`.
- `500` — body: `{ "error": "..." }`.

The frontend polls this to show scene previews, progress, and the final video. When `status` is `ready`, `videoUrl` should be set. `scenes` can be populated as the pipeline generates them.

---

## 4. Domain types (for request/response bodies)

Used in chat, voice, and video request bodies. Defined in the frontend in `types/family.ts`; your backend should accept and return JSON that matches these shapes.

```ts
type Gender = 'male' | 'female' | 'other';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;   // ISO date or date string
  deathDate?: string;
  gender?: Gender;
  photo?: string;
  qualities?: IQualities;
  email?: string;
  biography?: string;
  hobbies?: string;
}

interface IQualities {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  formality: number;
  religion: string;
  religionScale: number;
  passions: string;
  senseOfHumor: string;
  positivity: number;
}

interface Relationship {
  id: string;
  parentId: string;
  childId: string;
}

interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
}

interface TreeAccess {
  owner: string[];   // emails
  editor: string[];
  viewer: string[];
}

interface FamilyTree {
  id: string;
  name?: string;
  data: FamilyTreeData;
  access: TreeAccess;
  createdAt?: string;
  updatedAt?: string;
}
```

You can copy or re-export these from the frontend repo; the important part is that your API request/response bodies match these shapes.

---

## 5. How to connect your backend

1. **Implement the same paths and contract**  
   Expose all nine endpoints: `GET /api/trees`, `GET /api/trees/:id`, `POST /api/trees`, `PUT /api/trees/:id`, `POST /api/chat`, `POST /api/voice/session`, `POST /api/video/session`, `POST /api/story`, and `GET /api/story/:id` with the request/response shapes above.

2. **CORS**  
   If the frontend is served from another origin (e.g. `https://app.example.com`), your backend must allow that origin and the methods/headers the frontend uses (e.g. `GET`, `POST`, `PUT`, `Content-Type`, `Authorization` if you add it later).

3. **Frontend configuration**  
   In the frontend env (e.g. `.env.production` or hosting env vars), set:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.example.com
   ```
   No trailing slash. The frontend will then send all API requests to `https://your-backend.example.com/api/...`.

4. **Error format**  
   On non-2xx responses the frontend expects JSON with an `error` field when possible, e.g. `{ "error": "Tree not found" }`. It uses this string in user-facing messages.

---

## 6. Summary table

| Method | Path | Request | Response |
|--------|------|--------|----------|
| GET | `/api/trees?email=` | — | `{ trees: TreeInfo[], count }` |
| GET | `/api/trees/:id` | — | `FamilyTree` |
| POST | `/api/trees` | `{ email, treeData: { data } }` | `TreeInfo` |
| PUT | `/api/trees/:id` | `{ treeData: { data } }` | `FamilyTree` |
| POST | `/api/chat` | `{ message, person, role }` | `{ reply }` |
| POST | `/api/voice/session` | `{ person, role }` | `{ sessionId, wsUrl?, message? }` |
| POST | `/api/video/session` | `{ person, role }` | `{ sessionId, streamUrl?, wsUrl?, message? }` |
| POST | `/api/story` | `{ title?, subjectName?, biography, personId? }` | `{ storyId, status, message? }` |
| GET | `/api/story/:id` | — | `{ storyId, status, progress?, scenes?, videoUrl?, error?, createdAt?, updatedAt? }` |

All endpoints use `Content-Type: application/json`. The frontend does not send auth headers by default; you can add auth later (e.g. cookie or `Authorization`) and extend the client in `lib/api/client.ts` if needed.

---

*Last updated: implementation status table; My Story (POST /api/story, GET /api/story/:id).*
