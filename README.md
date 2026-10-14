# Freelance Companion — Frontend

React 19 SPA for translators and freelancers: clients and prospects, projects with task kanban, time tracking, invoices, rates and occupations, plus Clockify, HubSpot and Google Calendar integrations. Talks to the NestJS backend (`../the-translator-companion`) over GraphQL and REST, with HTTP-only cookie auth.

Stack: React 19 (React Compiler), TanStack Query v5 (the app's cache, over GraphQL and REST), Apollo Client v4 (GraphQL transport), React Router v7, Shadcn/ui, Tailwind CSS v4, Vite 8, TypeScript 6. Development rules and architecture: [`CLAUDE.md`](./CLAUDE.md).

## Setup

Prerequisites: Node.js 24, pnpm (version pinned in `package.json`), backend running at `http://localhost:3000`.

```bash
pnpm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000/graphql
pnpm run dev           # http://localhost:5173
```

## Scripts

```bash
pnpm run build          # type-check then bundle
pnpm run preview        # serve the production build
pnpm test               # unit tests (Vitest)
pnpm run test:e2e       # Playwright E2E (network mocked, no backend needed)
pnpm run storybook      # component explorer at http://localhost:6006
pnpm run test:mutation  # StrykerJS (scope it with --mutate)
pnpm run check          # full gate (below)
```

`pnpm run check` (`scripts/check.mjs`) runs, in order, stopping at the first failure: `typecheck`, `circular`, `knip`, `format`, `lint` (no auto-fix — it fails instead), `audit`, `unit`, `stories`, `build`, `e2e`, `mutation` (Stryker on lines changed since `origin/main`).

```bash
pnpm run check --list                 # step names
pnpm run check --skip e2e             # skip one step
pnpm run check --skip e2e,mutation    # skip several (or repeat --skip)
```

`knip` (`knip.json`) replaces depcheck and ts-prune: it fails on unused files, exports, types and dependencies. Exports used only in their own file are allowed, and shadcn primitives in `src/components/ui/` keep their full export sets. Delete what it reports rather than ignoring it.

`pnpm audit` has no ignored findings; overrides for vulnerable transitive dependencies are in `pnpm-workspace.yaml`.

## Pages

| Path                                            | Page                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| `/login`, `/register`, `/2fa/verify`            | Sign in, sign up, two-factor check (public)    |
| `/forgot-password`, `/reset-password`           | Password reset (public)                        |
| `/`                                             | Dashboard                                      |
| `/clients`, `/clients/:id`                      | Clients and client detail (contacts, projects) |
| `/prospects`                                    | Prospect pipeline board                        |
| `/projects`, `/projects/:id`                    | Projects, task kanban, time, overview          |
| `/time`                                         | Time entries and timer                         |
| `/invoices`, `/invoices/:id`                    | Invoices, line items, PDF                      |
| `/rates`, `/occupations`, `/occupations/:id`    | Rates, rate sheets, business lines             |
| `/time-tracker`, `/hubspot`, `/google-calendar` | Integrations                                   |
| `/profile/edit`, `/settings/2fa`                | Profile and security                           |
| `/admin/*`                                      | Admin (ADMIN role)                             |

Feature history: `../docs/implementations/ttc-front-history.md`.
