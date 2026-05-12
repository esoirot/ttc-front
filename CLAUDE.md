# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev            # Start dev server (HMR)
pnpm run build          # Type-check then bundle (tsc -b && vite build)
pnpm run lint           # ESLint with auto-fix
pnpm run preview        # Preview production build locally
pnpm run typecheck      # tsc --noEmit
pnpm run circular       # Detect circular dependencies (madge)
pnpm run depcheck       # Find unused/missing dependencies
pnpm run prune          # Find unused exports (ts-prune)
pnpm run format         # Prettier write
pnpm run format:check   # Prettier check
pnpm run check          # Run all checks in sequence
pnpm run test:e2e       # Run Playwright E2E tests (headless)
pnpm run test:e2e:ui    # Run Playwright with interactive UI
pnpm run test:e2e:headed # Run Playwright with browser visible
```

Always use **pnpm** — never npm or yarn.

**E2E tests** use Playwright (`e2e/` directory). Config in `playwright.config.ts`. Tests mock all network traffic with `page.route()` — no real backend needed. Mock helpers in `e2e/helpers/mock.ts` (`mockGraphQL`, `mockClockifyStatus`, `mockClockifyTracker`, etc.).

## Stack

- **React 19** with **React Compiler** enabled — do not add manual `useMemo`/`useCallback`/`memo` wrappers; the compiler handles memoization automatically.
- **Apollo Client v4** (`@apollo/client`) for all GraphQL communication with the backend. Configured with `credentials: 'include'` for HTTP-only cookie auth. v4 splits into subpackages — see import rules below.
- **TanStack Query v5** (`@tanstack/react-query`) — used for all **REST** API calls (Clockify, any future non-GraphQL endpoints). Do not use TanStack Query for GraphQL calls.
- **Shadcn/ui** — component library built on Radix UI primitives. Components generated into `src/components/ui/`. Always use Shadcn primitives (`Button`, `Input`, `Label`, `Card`, `Badge`, `Tabs`, `Skeleton`, `Separator`, `Alert`) instead of raw HTML elements. Add new components via `pnpm dlx shadcn@latest add <name>`.
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js` needed. Theme is defined in `src/index.css` via `@theme inline` + CSS custom properties (`:root` / `.dark`). Use semantic color tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-destructive`, etc.) — not raw `zinc-*`/`violet-*` classes.
- **Geist** variable font — imported via `@fontsource-variable/geist` in `src/index.css`; set as `--font-sans` in `@theme`.
- **Vite 8** bundler with `@rolldown/plugin-babel` wiring the React Compiler Babel preset.
- **TypeScript 6** — strict mode via `tsconfig.app.json`. `erasableSyntaxOnly` is enabled: do not use parameter properties (`public readonly x` in constructors) — declare fields explicitly.

## Environment

`.env` at the project root:

```
VITE_API_URL=http://localhost:3000/graphql
```

## Architecture

**GraphQL client**: `src/lib/apollo.ts` exports a single `apolloClient` instance. `ApolloProvider` wraps the app in `main.tsx`. All GraphQL operations go through Apollo — do not use `fetch` or TanStack Query for GraphQL calls. An `ErrorLink` (from `@apollo/client/link/error`) sits first in the chain; on `UNAUTHENTICATED` (checked via `CombinedGraphQLErrors.is(error)`) or HTTP 401 (checked via `ServerError.is(error)`) outside public paths it calls `tryRefresh()` (from `api.ts`) and retries the original operation via `forward(operation)` using `Observable` (from `@apollo/client/utilities`). If refresh fails, falls back to `window.location.replace('/login')`. Links composed via `ApolloLink.from([...])` — `from` is deprecated in v4.

**REST client**: `src/lib/api.ts` exports `apiGet`, `apiPost`, `apiPatch`, `apiDelete` — thin `fetch` wrappers with `credentials: 'include'` and typed error (`ApiError`). Base URL derived from `VITE_API_URL` by stripping `/graphql`. On 401, automatically fires the `refreshToken` GraphQL mutation and retries the original request once; if refresh also fails, throws `ApiError(401)`. `Content-Type: application/json` is only sent when the request has a body — body-less requests (GET, DELETE) omit it. Use these for all REST endpoints; wrap them in TanStack Query hooks in `src/hooks/`.

**Auth state**: determined by the `me` query. If it returns a user, the session is active. No tokens are managed in JS — auth cookies are HTTP-only and invisible to the frontend.

**File layout**:

```
src/
├── lib/
│   ├── apollo.ts                  — Apollo client (credentials: 'include')
│   ├── api.ts                     — REST fetch helpers (apiGet/apiPost/apiPatch/apiDelete, ApiError)
│   └── utils.ts                   — cn() helper (clsx + tailwind-merge) for conditional class names
├── graphql/
│   └── auth.operations.ts         — All auth queries/mutations typed with TypedDocumentNode<Result, Vars>
├── hooks/
│   ├── useAuth.ts                 — useCurrentUser, useLogin, useRegister, useLogout, useUpdateMe, useSetupTwoFactor, useEnableTwoFactor, useVerifyTwoFactor
│   ├── useClockify.ts             — TanStack Query hooks for all Clockify REST endpoints
│   └── useHubspot.ts              — TanStack Query hooks for all HubSpot REST endpoints (status, contacts, companies, deals, disconnect, infinite lists, contact search)
├── components/
│   ├── ui/                        — Shadcn/ui generated components (Button, Input, Label, Card, Badge, Tabs, Skeleton, Separator, Alert)
│   ├── auth/
│   │   ├── AuthLayout.tsx         — Card wrapper for public auth pages (uses Card/CardHeader/CardContent)
│   │   ├── GoogleOAuthButton.tsx  — Full-page redirect to /auth/google (OAuth cannot use GraphQL)
│   │   └── ProtectedRoute.tsx     — Redirects to /login when unauthenticated; shows loading state
│   ├── clockify/                  — Time tracker sub-components (ActiveTimer, DayGroup, EntryRow, etc.)
│   ├── hubspot/                   — HubSpot sub-components (SetupView, ConnectedView, ContactsTab, etc.)
│   └── layout/
│       ├── AppLayout.tsx          — App shell: renders <Sidebar /> + <Outlet /> side by side
│       └── Sidebar.tsx            — Sticky sidebar with nav links; username is a <Link> to /profile/edit; sign-out button
└── pages/
    ├── auth/
    │   ├── LoginPage.tsx          — Email/password form; on requiresTwoFactor → navigate to /2fa/verify
    │   ├── RegisterPage.tsx       — Registration form
    │   ├── TwoFactorVerifyPage.tsx — TOTP code input; reads tempToken from router state
    │   └── TwoFactorSetupPage.tsx — Security settings page: QR setup + enable 2FA (legacy route kept)
    ├── account/
    │   ├── DashboardPage.tsx      — Protected landing page with 2FA prompt
    │   └── EditProfilePage.tsx    — Profile editor: Profile tab (name/email) + Security tab (2FA setup)
    └── integrations/
        ├── TimeTrackerPage.tsx    — Clockify time tracker: connect → pick workspace → start/stop/edit timers
        └── HubspotPage.tsx        — HubSpot CRM: OAuth connect flow + tabbed view
```

**Routing** (`App.tsx` — `createBrowserRouter`):
| Route | Component | Auth |
|---|---|---|
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/2fa/verify` | `TwoFactorVerifyPage` | public (has `tempToken` in router state) |
| `/` | `DashboardPage` | protected (inside `AppLayout`) |
| `/profile/edit` | `EditProfilePage` | protected (inside `AppLayout`) |
| `/settings/2fa` | `TwoFactorSetupPage` | protected (inside `AppLayout`) |
| `/time-tracker` | `TimeTrackerPage` | protected (inside `AppLayout`) |
| `/hubspot` | `HubspotPage` | protected (inside `AppLayout`) |

The protected route hierarchy is: `ProtectedRoute → AppLayout → [page]`. Adding a new protected page means adding it as a child of `AppLayout` in `App.tsx`.

**Key rules:**

- The React Compiler handles memoization — keep components and hooks pure.
- Vite plugins: `tailwindcss()` (first) + `@vitejs/plugin-react` (JSX) + `@rolldown/plugin-babel` (React Compiler). Add Babel plugins to `vite.config.ts` only, not `.babelrc`.
- `useCurrentUser()` uses `errorPolicy: 'ignore'` so unauthenticated requests don't throw.
- After `logout`, call `client.clearStore()` to wipe the Apollo cache. `useLogout` also writes `localStorage.setItem('ttc_logout', Date.now())` to trigger cross-tab logout via the `storage` event.
- Cross-tab logout is handled by `RootLayout` in `App.tsx` — a root route element that wraps all routes and registers a `storage` listener. Must stay inside the router tree to use `useNavigate`.
- `ProtectedRoute` passes `state={{ from: pathname + search }}` to `<Navigate to="/login">`. `LoginPage` reads `state.from` and navigates there on success. `TwoFactorVerifyPage` threads `from` through its own state so 2FA flows also land on the intended path.
- Google OAuth is a full-page redirect (`window.location.href = .../auth/google`), not a GraphQL mutation.
- `Sidebar.tsx` owns the user display, role badge, and sign-out button — do not duplicate these in page components. The username/role block is a `<Link to="/profile/edit">` — clicking it navigates to the edit profile page.
- Protected page components use `max-w-3xl mx-auto px-6 py-8` for consistent padding/max-width. Do not add custom headers with back buttons; sidebar navigation replaces them.
- Nav links in `Sidebar.tsx` use `<NavLink end>` — always pass `end={true}` for the `/` route so it doesn't highlight on every sub-path.
- Sidebar is `flex-row` (horizontal top bar) on mobile, `sm:flex-col sm:w-56` sticky on desktop — controlled by Tailwind `sm:` breakpoint (640px).
- Dark mode is `@media (prefers-color-scheme: dark)` — Tailwind v4's default. Use `dark:` variants; do not add a class-based dark mode toggle.
- **Styling**: use Shadcn semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, `border-border`, `bg-muted`, `text-destructive`, `bg-card`, etc.). Do not use raw `zinc-*` or `violet-*` classes for structural UI — reserve named palette classes only for non-themed values (e.g. `text-emerald-600` for success states that have no semantic token). Use `cn()` from `@/lib/utils` for conditional classes.
- **Path alias**: `@/*` resolves to `./src/*`. Use it for cross-directory imports (e.g. `@/components/ui/button`, `@/lib/utils`). Relative imports are fine for same-directory siblings.
- **Shadcn components**: import from `@/components/ui/<name>`. Add new ones via `pnpm dlx shadcn@latest add <name> --yes`. The CLI places files in `src/components/ui/` — verify after running since the CLI previously placed them in a literal `@/` directory.
- **TypeScript 6 constraints**: `erasableSyntaxOnly` bans parameter properties. Declare class fields explicitly: `readonly x: T; constructor(x: T) { this.x = x; }`. `baseUrl` is deprecated — use `paths` alone in `tsconfig.app.json`.
- Do not call `setState` synchronously inside `useEffect` bodies — the React Compiler lint rule flags this. For live timers, store the display string as state and update it inside `setInterval`: `setInterval(() => setDisplay(format(startIso)), 1000)`. Do NOT use a tick-counter (`setTick`) and compute during render — the compiler memoizes expressions like `format(startIso)` because `startIso` never changes, freezing the display. The interval callback is async (not render-phase), so `setDisplay(...)` inside it is allowed.
- Do not read `ref.current` during render — the React Compiler lint rule `react-hooks/refs` flags this.

## TimeTrackerPage (`src/pages/TimeTrackerPage.tsx`)

Internal component hierarchy:

```
TimeTrackerPage
├── SetupView          — API key form + workspace picker (shown when not connected)
└── TrackerView        — shown when connected; owns all TanStack Query hooks
    ├── ActiveTimer    — new-entry form + running timer display (stop button)
    └── DayGroup[]     — one per calendar day, collapsed by default
        └── DescriptionGroup | EntryRow   — per description bucket
            └── EntryRow[]               — individual entries (inside DescriptionGroup when expanded)
```

**Component responsibilities:**

| Component          | Purpose                                                                                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BillableToggle`   | `$` button, green when billable                                                                                                                                                                                                                                        |
| `ProjectSelect`    | Native `<select>` with "No project" option                                                                                                                                                                                                                             |
| `TagChips`         | Tag chips with ×, text input for search/add/create                                                                                                                                                                                                                     |
| `EntryRow`         | Single time entry row: description, project, tags, billable, time range, resume ▶, delete ✕                                                                                                                                                                            |
| `DescriptionGroup` | Merged row for 2+ same-description entries in a day; `▶` expands to individual `EntryRow`s                                                                                                                                                                             |
| `DayGroup`         | Day accordion (collapsed by default); header shows date/count/time-span/total; body groups by description                                                                                                                                                              |
| `ActiveTimer`      | Shows running timer info + Stop button when active; shows new-entry form when idle                                                                                                                                                                                     |
| `TrackerView`      | Owns `useClockifyProjects`, `useClockifyEntries`, `useClockifyTags`, `useDeleteEntry`, `useStartEntry`, `useUpdateEntry`; holds `startDate`/`endDate` state (defaults: 30 days ago → today); renders date range filter, project filter, `ActiveTimer`, `DayGroup` list |

**Key rules:**

- `TagChips` takes `workspaceId` as prop and calls `useCreateTag(workspaceId)` internally — it is self-contained for both selecting and creating tags.
- Dropdown items in `TagChips` use `onMouseDown` (not `onClick`) so they fire before the `onBlur` timeout (150 ms) that closes the dropdown. Never change to `onClick` — the item won't register.
- `DayGroup` groups entries by description via `groupByDescription()` helper. The map key is `desc || projectId || "__no_desc__"` — entries with the same non-empty description group together regardless of project; entries with an empty description are split by project so they don't all collapse into one group. Unique keys (after grouping) render as plain `EntryRow`.
- Render call-site extracts `desc` from `group[0].description?.trim() ?? ""` — never use the map key as the display description, since the key may be a projectId when description is empty.
- `EntryRow.patch()` constructs a full `UpdateEntryInput` from `entry` + a partial override — always passes all required fields (`start`, `billable`, `tagIds`) so the Clockify `PUT` never receives a partial body.
- `workspaceId` must be threaded through `TrackerView → DayGroup → EntryRow → TagChips` and `ActiveTimer → TagChips`. All four components have it as a required prop.
- `useClockifyActiveEntry` stops polling only when the error is `ApiError` with `status === 401`. Transient errors (500, network failure) keep the 10 s interval — check `err instanceof ApiError && err.status === 401` in `refetchInterval`. Never change back to stopping on any error.
- Date range filter in `TrackerView`: `startDate`/`endDate` state holds `YYYY-MM-DD` strings. `toStartIso`/`toEndIso` module-level helpers convert them to local-timezone ISO for the API (`T00:00:00` / `T23:59:59.999`). The two `<input type="date">` fields have `max`/`min` constraints to prevent invalid ranges.

**Apollo Client v4 import rules** — v4 no longer exports everything from `@apollo/client`. Use the correct subpackage or Vite will throw a missing-export error at runtime:

| What                                                             | Import from                 |
| ---------------------------------------------------------------- | --------------------------- |
| `ApolloClient`, `InMemoryCache`, `HttpLink`, `ApolloLink`, `gql` | `@apollo/client/core`       |
| `useQuery`, `useMutation`, `useApolloClient`, `ApolloProvider`   | `@apollo/client/react`      |
| `ErrorLink`                                                      | `@apollo/client/link/error` |
| `CombinedGraphQLErrors`, `ServerError`                           | `@apollo/client/errors`     |
| `Observable`                                                     | `@apollo/client/utilities`  |
| `TypedDocumentNode`                                              | `@apollo/client/core`       |

- `from(links)` is **deprecated** — use `ApolloLink.from(links)` instead.
- `onError(handler)` is **deprecated** — use `new ErrorLink(handler)` instead.
- `ErrorLink.ErrorHandler` receives `{ error, result, operation, forward }` — not `{ graphQLErrors, networkError }`. Use `CombinedGraphQLErrors.is(error)` and `ServerError.is(error)` to type-narrow.
- All GraphQL operations in `src/graphql/auth.operations.ts` are typed with `TypedDocumentNode<Result, Vars>` so `useQuery`/`useMutation` infer data shapes automatically.

## Status & Known Gaps

- **Clockify API key and HubSpot tokens**: encrypted at rest with AES-256-GCM when `APP_ENCRYPTION_KEY` is set (see backend CLAUDE.md).
- **Google OAuth persistent redirect**: `from` path not preserved before the full-page OAuth redirect. Requires storing in `sessionStorage` before `window.location.href = /auth/google` and reading it back after callback.
- **HubSpot pagination**: ~~only loaded first page~~ — resolved. All three tabs use `useInfiniteQuery`; "Load more" button fetches next cursor page.
- **HubSpot OAuth CSRF**: ~~state was bare userId~~ — resolved on backend (#12). OAuth state is now HMAC-SHA256 signed with a nonce and 10-min expiry.

## Docs

Implementation logs live in `../../docs/implementations/`:

- `auth-implementation.md` — backend auth system
- `auth-ui.md` — frontend auth pages and routing
- `auth-remaining.md` — persistent redirect, cross-tab logout, resolver guards, disable 2FA, Apollo token refresh

Plans live in `../../docs/plans/`:

- `clockify-integration.md` — Clockify REST integration design
- `auth-remaining.md` — plan for the auth follow-up items above

## Auth Hooks (`src/hooks/useAuth.ts`)

| Hook                    | Description                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCurrentUser()`      | Returns `{ user, loading, isAuthenticated }`. Polls `me` every 60 s (`pollInterval: 60_000`). `errorPolicy: 'ignore'` — auth errors are handled by the Apollo `onError` link which redirects to `/login`. |
| `useLogin()`            | Returns `{ login(email, password), loading, error }`. Check `data.login.requiresTwoFactor` to detect 2FA flow.                                                                                            |
| `useRegister()`         | Returns `{ register(email, password, name?), loading, error }`.                                                                                                                                           |
| `useLogout()`           | Calls logout mutation + clears Apollo cache + writes `ttc_logout` timestamp to localStorage (triggers cross-tab logout via `storage` event).                                                              |
| `useUpdateMe()`         | Returns `{ updateMe({ name?, email? }), loading, error }`. Updates current user; refetches `me` query.                                                                                                    |
| `useSetupTwoFactor()`   | Returns QR code URL and base32 secret for display.                                                                                                                                                        |
| `useEnableTwoFactor()`  | Confirms 2FA setup with a TOTP code.                                                                                                                                                                      |
| `useVerifyTwoFactor()`  | Completes login when 2FA is required — pass `tempToken` from login response + user code.                                                                                                                  |
| `useDisableTwoFactor()` | Disables 2FA — sends TOTP code for verification; refetches `me` on success.                                                                                                                               |

## Clockify Hooks (`src/hooks/useClockify.ts`)

All hooks use TanStack Query against the backend REST endpoints at `/clockify/*`.

| Hook                                            | Type                                            | Endpoint                                                                       |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `useClockifyStatus()`                           | query                                           | `GET /clockify/status` → `{ connected, workspaceId }`                          |
| `useSetClockifyCredentials()`                   | mutation                                        | `POST /clockify/credentials` — validates key via Clockify then saves           |
| `useSetClockifyWorkspace()`                     | mutation                                        | `PATCH /clockify/workspace` — updates workspace pref without re-validating key |
| `useClockifyWorkspaces()`                       | query                                           | `GET /clockify/workspaces`                                                     |
| `useClockifyProjects(workspaceId)`              | query                                           | `GET /clockify/workspaces/:id/projects`                                        |
| `useClockifyEntries(workspaceId, start?, end?)` | query                                           | `GET /clockify/workspaces/:id/entries`                                         |
| `useClockifyActiveEntry(workspaceId)`           | query, refetchInterval: 10s (stops only on 401) | `GET /clockify/workspaces/:id/entries/active`                                  |
| `useStartEntry(workspaceId)`                    | mutation                                        | `POST /clockify/workspaces/:id/entries`                                        |
| `useStopEntry(workspaceId)`                     | mutation, no args                               | `PATCH /clockify/workspaces/:id/entries/stop` — stops running timer            |
| `useDeleteEntry(workspaceId)`                   | mutation                                        | `DELETE /clockify/workspaces/:id/entries/:eid`                                 |
| `useClockifyTags(workspaceId)`                  | query                                           | `GET /clockify/workspaces/:id/tags`                                            |
| `useCreateTag(workspaceId)`                     | mutation                                        | `POST /clockify/workspaces/:id/tags` — creates tag in Clockify workspace       |
| `useUpdateEntry(workspaceId)`                   | mutation                                        | `PATCH /clockify/workspaces/:id/entries/:eid` — full entry update (PUT to CW)  |

`QueryClientProvider` is wired in `main.tsx` alongside `ApolloProvider`.

## HubSpot Hooks (`src/hooks/useHubspot.ts`)

All hooks use TanStack Query against the backend REST endpoints at `/hubspot/*`.

| Hook                                  | Type                                  | Endpoint                                                                                  |
| ------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `useHubspotStatus()`                  | query                                 | `GET /hubspot/status` → `{ connected, portalId }`                                         |
| `useDisconnectHubspot()`              | mutation                              | `DELETE /hubspot/disconnect`                                                              |
| `useInfiniteHubspotContacts(limit?)`  | infinite query                        | `GET /hubspot/contacts?limit=&after=` — pages via `paging.next.after`                     |
| `useInfiniteHubspotCompanies(limit?)` | infinite query                        | `GET /hubspot/companies?limit=&after=`                                                    |
| `useInfiniteHubspotDeals(limit?)`     | infinite query                        | `GET /hubspot/deals?limit=&after=`                                                        |
| `useSearchHubspotContacts(query)`     | query, `enabled` when query non-empty | `POST /hubspot/contacts/search` — `CONTAINS_TOKEN` filter across email/firstname/lastname |
| `useCreateContact()`                  | mutation                              | `POST /hubspot/contacts`                                                                  |
| `useUpdateContact()`                  | mutation                              | `PATCH /hubspot/contacts/:id`                                                             |
| `useCreateDeal()`                     | mutation                              | `POST /hubspot/deals`                                                                     |
| `useUpdateDeal()`                     | mutation                              | `PATCH /hubspot/deals/:id`                                                                |

**Key rules:**

- All three list tabs use `useInfiniteQuery`. Flatten results with `data.pages.flatMap(p => p.results)`. "Load more" button appears when `hasNextPage`.
- `ContactsTab` has a search input that debounces 300 ms (`useEffect` + `setTimeout`). When `debouncedSearch` is non-empty, renders search results from `useSearchHubspotContacts`; otherwise renders infinite list. "Load more" is hidden while searching.
- The original `useHubspotContacts/Companies/Deals` hooks (plain `useQuery`) are kept for backwards compatibility — only the infinite variants are used in `HubspotPage`.
