# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Aurora** — AI-powered family history platform: genealogical tree visualization, chat/voice/video with AI ancestors, cinematic story generation.

Stack: Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui (new-york style, neutral base), Prisma 6 + SQLite, NextAuth v4, `@xyflow/react` for tree graphs.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single pass)
npm run test:coverage
```

Run a single test file: `npx vitest run path/to/file.test.ts`

## Architecture

### API Resolution

Three modes, selected by env vars (checked in `lib/api/client.ts`):

| Mode | Env var | Behavior |
|---|---|---|
| Mocks | `NEXT_PUBLIC_USE_API_MOCKS=true` | In-memory responses from `lib/api/mocks.ts` |
| External backend | `NEXT_PUBLIC_API_URL=https://...` | Proxies all `/api/*` calls to that URL |
| Same-origin (default) | — | Next.js route handlers in `app/api/*/route.ts` |

API contract: `docs/BACKEND-API.md`. OpenAPI spec: `docs/openapi.yaml`.

### Directory Layout

```
app/                    # Next.js App Router — pages and API routes only
  api/                  # Route handlers: auth, chat, trees, voice, video, story
  tree/, chatroom/, story/, stories/, signin/, …

components/
  ui/                   # Base building blocks (shadcn/ui)
  layout/               # Navbar, footer, section-header
  features/             # Domain components: family-tree, chat-window, call-session-card, …
  providers/            # Context wrappers: AppProviders, SessionProvider, I18nProvider, ThemeProvider

contexts/               # React contexts: TreeContext, DeviceContext
lib/
  api/                  # All fetch calls (trees.ts, chat.ts, voice.ts, video.ts, story.ts, client.ts)
  family/               # Domain logic: person.ts, relationships.ts, roles.ts, dates.ts, validation.ts
  family-tree/          # Graph layout: graphLayout.ts, transformToFlowData.ts, buildSiblingBranch.ts
  ai/prompts.ts         # System prompts for ancestor chat
  i18n.ts, i18n-role.ts, i18n.*.json   # Internationalization (8 locales)
  theme.ts              # Design tokens
  prisma.ts             # Prisma client singleton
  utils.ts              # Barrel re-export of helpers
  mock-family-data.ts   # Demo trees for mock mode

types/
  family.ts             # Core domain types: Person, Relationship, SpouseLink, FamilyTree, FamilyTreeData
  next-auth.d.ts        # NextAuth Session augmentation

prisma/schema.prisma    # DB schema (User, Account, Session)
docs/                   # API contract and mock documentation
```

### State Management

No Redux/Zustand. State lives in React Context:
- `TreeContext` (`contexts/tree-context.tsx`) — selected tree ID (synced to `?treeId=` URL param), tree data, loading/error
- `DeviceContext` — mobile/tablet/desktop with touch detection
- `I18nContext` — locale (stored in `aurora-locale` cookie), `t(path, vars)`, `formatDate()`, `formatTime()`
- `ThemeProvider` — dark mode via `.dark` CSS class

### Key Conventions

- **Imports**: always use `@/` aliases (never `../../../`). Order: React/Next → external → internal (`@/`).
- **API calls**: only from `lib/api/`, never `fetch` directly in components.
- **Props**: always typed via a `Props` interface.
- **Styling**: Tailwind CSS only — no `.css`/`.scss`/styled-components. CSS variables in `app/globals.css`.
- **Component variants**: use `cva` (class-variance-authority).
- **Icons**: `lucide-react` only.
- **Radix UI**: only via shadcn/ui, not imported directly.
- **Comments and documentation**: English only.
- **Branch names**: `feature/*` and `fix/*`. Commits: `feat:`, `fix:` prefixes.
- **Temporary tree storage**: `global.userCreatedTrees` in API routes (in-memory, not DB) — to be replaced by full Prisma persistence.

### Family Tree Visualization

React Flow (`@xyflow/react`) with dagre layout (top-to-bottom hierarchy). Spouse pairs are detected from shared children or explicit `SpouseLink` objects. Node colors use CSS custom properties: `--avatar-male`, `--avatar-female`, `--avatar-main`, `--avatar-neutral`. Graph layout logic is in `lib/family-tree/graphLayout.ts`.

### Internationalization

8 locales: `en`, `de`, `es`, `fr`, `it`, `nl`, `pl`. Translation strings live in `lib/i18n.[locale].json`. Use `useI18n()` hook for `t()`, `formatDate()`, and `formatTime()`. Family role translations are in `lib/i18n-role.ts`.

### Testing

Vitest + React Testing Library. Test files colocated with source (`*.test.ts` / `*.test.tsx`). Environment: jsdom. Existing tests: `contexts/tree-context.test.tsx`, `lib/family-tree/graphLayout.test.ts`, `lib/family-tree/buildSiblingBranch.test.ts`.
