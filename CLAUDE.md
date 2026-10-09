# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules

- Never start or stop the dev server (`pnpm run dev`) yourself. The operator runs it. Do not run/verify against it unless the operator explicitly asks — rely on `pnpm run test:e2e`/`pnpm run check` instead.
- **Admin section is out of scope until the operator says otherwise.** Ignore everything under `src/components/admin/`, `src/hooks/admin/`, `src/graphql/admin.operations.ts`, `src/pages/admin/` and `/admin*` routes: do not audit, fix, refactor, or restyle them, and leave admin findings out of reports. Exception: shared code they merely consume (e.g. `src/components/ui/*`, `useBulkSelection` used by non-admin pages) may still change for non-admin reasons.

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
pnpm run test:mutation --mutate <files>  # StrykerJS on changed files only (incremental, unit tests via vitest.stryker.config.ts)
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
- **Shadcn/ui** — component library built on Radix UI primitives. Components generated into `src/components/ui/`. **Always use Shadcn primitives for every UI element** — never write raw `<button>`, `<input>`, `<label>`, `<select>`, or hand-roll card/badge/tab/skeleton patterns. Available: `Button`, `Input`, `Label`, `Card` (`CardHeader`/`CardContent`/`CardTitle`), `Badge`, `Tabs` (`TabsList`/`TabsTrigger`/`TabsContent`), `Skeleton`, `Separator`, `Alert`. Add new components via `pnpm dlx shadcn@latest add <name> --yes`.
- **Storybook** — every component in `src/components/ui/` has a `<name>.stories.tsx` next to it; components above that layer get one too as they're built or touched (see **Storybook Component Taxonomy** below for which layer a component belongs to and its `title` prefix). Two patterns, pick whichever fits the new component: (1) **variant-driven** (`badge.stories.tsx`, `button.stories.tsx`, `input.stories.tsx`) — a `Meta`/`StoryObj` per prop/variant combination via `args`; (2) **compound/composed** (`tabs.stories.tsx`, `dialog.stories.tsx`, `select.stories.tsx`, `table.stories.tsx`) — a single `render: () => (...)` assembling a realistic small composition, since these components have no meaningful default props in isolation. `pnpm run storybook` to browse (localhost:6006), `pnpm run build-storybook` for the static build. `pnpm run test-storybook` (`vitest run --project=storybook`, browser-mode via Playwright) runs every story as a render-smoke test — it's part of `pnpm run check`, so a broken story fails the same gate as a broken unit test. `.storybook/preview.tsx` imports `src/index.css` — required for Tailwind utilities to exist in the Storybook bundle at all; do not remove that import.
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js` needed. Theme is defined in `src/index.css` via `@theme inline` + CSS custom properties (`:root` / `.dark`). **Always use semantic color tokens** (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, `border-border`, `bg-muted`, `text-destructive`, `bg-card`, `text-card-foreground`, `bg-popover`, `text-popover-foreground`, `bg-accent`, `text-accent-foreground`, `bg-secondary`, `text-secondary-foreground`, `ring`, `input`) — never raw `zinc-*`, `violet-*`, `slate-*`, `gray-*`, or other palette classes for structural UI. Reserve named palette classes only for values with no semantic equivalent (e.g. `text-emerald-600` for success).
- **Geist** variable font — imported via `@fontsource-variable/geist` in `src/index.css`; set as `--font-sans` in `@theme`.
- **Vite 8** bundler with `@rolldown/plugin-babel` wiring the React Compiler Babel preset.
- **TypeScript 6** — strict mode via `tsconfig.app.json`. `erasableSyntaxOnly` is enabled: do not use parameter properties (`public readonly x` in constructors) — declare fields explicitly.

## Storybook Component Taxonomy

Stories are organized by Atomic Design layer. A story's `title` prefix is what drives Storybook's sidebar grouping — set it to the matching layer below, not `"ui/..."` (legacy, migrated off of).

| Layer     | `title` prefix | What lives here                                                                                                                                                                                                                                                                                                                                                         | Example                                                       |
| --------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Atoms     | `Atoms/*`      | `src/components/ui/` shadcn primitives with a **single** exported component and no composed sub-parts — no business logic, no data hooks                                                                                                                                                                                                                                | `Atoms/Button`, `Atoms/Badge`, `Atoms/Input`                  |
| Molecules | `Molecules/*`  | Two kinds live here: (1) `src/components/ui/` primitives that export **multiple** named sub-components meant to be composed together (`X`, `XHeader`, `XTitle`, `XContent`, `XFooter`, ...); (2) feature-level units combining 2+ atoms into one interactive piece, may own a single inert/self-contained hook (e.g. a create-mutation) but no page-level data fetching | `Molecules/Card`, `Molecules/Dialog`, `Molecules/TtcTagChips` |
| Organisms | `Organisms/*`  | Composed, feature-specific UI combining molecules/atoms with real domain types and mutation callbacks — the row/section/panel level. Never a `src/components/ui/` primitive, however composed — those are Atoms or Molecules per the rule above, not Organisms.                                                                                                         | `Organisms/TtcEntryRow`                                       |
| Templates | `Templates/*`  | Page-level layout shells with a `children`/content slot but no data of their own — structure only                                                                                                                                                                                                                                                                       | `Templates/AuthLayout`                                        |
| Pages     | `Pages/*`      | Routed page components from `src/pages/`, composing templates + organisms with live hooks                                                                                                                                                                                                                                                                               | `Pages/LoginPage`                                             |

Deciding the layer for a new component:

- Generated by `pnpm dlx shadcn@latest add` (lives in `src/components/ui/`) → check its exports: **one** component, no sub-parts → **Atom** (e.g. `Button`, `Badge`, `Input`, `Label`, `Textarea`, `Checkbox`, `Separator`, `Skeleton`). **Multiple** named sub-components meant to be composed (`Card`/`CardHeader`/`CardContent`/..., `Dialog`/`DialogTrigger`/`DialogContent`/..., same for `Alert`, `Popover`, `Select`, `Tabs`, `Table`, `DropdownMenu`, `AlertDialog`) → **Molecule**. `src/components/ui/` is Atoms + Molecules only — it never contains Organisms, Templates, or Pages.
- Feature-specific composed block with domain types/mutation callbacks (lives in `src/components/<feature>/`, not `ui/`) → combines 2+ atoms into one interactive piece with a single inert hook → **Molecule**; combines molecules/atoms with real domain data and mutation callbacks at the row/section/panel level → **Organism**.
- Layout shell with a `children` slot, no data of its own → **Template**.
- A `src/pages/**/*Page.tsx` route component → **Page**.

Stories above the Atom layer that use TanStack Query hooks need a `QueryClientProvider` decorator (see `TtcTagChips.stories.tsx`, `TtcEntryRow.stories.tsx` for the pattern); ones using `react-router-dom` (`Link`, `useNavigate`, `<Outlet/>`) need a `MemoryRouter` decorator (see `LoginPage.stories.tsx`). No MSW/network mocking is configured yet — a component with an _ungated_ query on mount (fires regardless of props, e.g. `useCurrentUser()`) will render whatever loading/error state it falls into when that fetch fails in Storybook's sandbox. That's an accepted current limitation, not a per-story bug to fix.

## Principles

- **KISS** — simplest thing that works. No speculative abstraction. The shared GraphQL hook helpers (`src/lib/gqlQuery.ts`, `gqlMutation.ts`, `cachePatch.ts`) are deliberately small composable functions, not a config-driven mega-factory — a hook with genuinely bespoke cache logic (e.g. `useUpdateClient`'s cross-filter cache walk, `useRates`'s multi-key patch) keeps its `onSuccess` hand-written and calls the shared pieces directly rather than being forced through a one-size-fits-all abstraction.
- **DRY** — extract shared logic once duplication appears 2+ times, not before. `cachePatch.ts`'s `patchFlatArray`/`patchConnection`/`patchNestedField`/`removeFrom*` functions exist because the same map/filter-by-id cache surgery was copy-pasted across ~40 mutation hooks; do not add a new one for a pattern seen only once.
- **SOLID** — a hook or component does one job: data-fetching XOR cache-patching XOR business logic XOR presentation, not all four in one function (S); extend via new hooks/components, not edits to shared ones, where feasible (O); hooks with the same public shape (e.g. every `use*Connection` list hook returning `{ items, total, hasMore, loadMore, loading, error }`) are interchangeable at the call site (L); slim option objects over fat ones — `useGqlMutation`'s `{ mutation, unwrap, onSuccess? }` rather than a monolithic config (I); components/hooks depend on the hook layer (`useGqlQuery`/`useGqlMutation`/`gqlFetch`/`gqlMutate`), never raw `fetch`/`ApolloClient` calls scattered through components (D).
- **DDD** — module boundaries in `src/{hooks,components,pages}/<feature>/` mirror domain boundaries (Clients, Projects, Tasks, Invoices, Rates, Time, Admin, Occupations...). Cross-domain access goes through a domain's public hook API (e.g. `useClientDetail` composing `useProjects`/`useInvoices`/`useTimeEntries`), never through another domain's GraphQL operations or internals directly.
- **Occupation vs Activity naming** — `Occupation` (`src/{components,hooks,pages}/occupations/`, route `/occupations`, i18n `occupations.*`) is the user's business line (translator, corrector...), renamed from `Activity`. "Activity" now only means history: the task history log (`TaskActivity`, `TaskActivityFeed`, `TaskActivityGroup`, a task's `activities` field), the client/project `ActivityTab`s, and the admin activity log. Never reuse an `occupations.*` i18n key for a history label.
- **Lean Code** — write only code the current task needs, ship it, then cut anything left unused. No speculative flags, config knobs, or extension points for a future that hasn't arrived. Dead code, commented-out blocks, and unused exports get deleted on sight, not left "in case." Prefer deleting/simplifying over adding when fixing a defect — a smaller diff that removes the failure mode beats a larger one that wraps it. Pair with **KISS**/**DRY** above: lean is about not writing it, KISS is about how simply you write what remains.

## Software Development Lifecycle

1. Implement/change the component or feature.
2. **Storybook**: if the change touches any component — new component at any Atomic Design layer, new variant, new size, new prop — add or update its `<name>.stories.tsx` in the same commit, under the right `title` prefix (see **Storybook Component Taxonomy** above). A story left behind a component's actual variants (e.g. a new `Button` `size` or `Badge` `variant` added but never given a story) is stale documentation; don't let it drift. Story-structure patterns to pick from are documented under **Stack** above.
3. Add/update unit tests (Vitest) alongside the change; add/update Playwright E2E coverage (`e2e/`) for user-facing flows.
4. Run `pnpm run check` before considering the change done — it chains `typecheck`, `circular`, `depcheck`, `prune`, `format:check`, `lint`, and `test-storybook` (so a stale/broken story fails this gate the same as a broken unit test).

## Environment

`.env` at the project root:

```
VITE_API_URL=http://localhost:3000/graphql
```

## Architecture

**Pagination**: all 5 list hooks (`useClients`, `useProjects`, `useTasks`, `useTimeEntries`, `useInvoices`) use cursor-based Apollo `fetchMore`. The initial query uses `{ pagination: { limit: N } }`. `loadMore()` calls `fetchMore({ variables: { ...baseVars, pagination: { limit: N, cursor: nextCursor } }, updateQuery })`. `updateQuery` merges pages: `{ ...fetchMoreResult.xxx, items: [...prev.xxx.items, ...fetchMoreResult.xxx.items] }`. The backend returns a Connection type `{ items, nextCursor, total }`. Each hook exposes `{ hasMore: nextCursor !== null, loadMore, total }`. Mutations use `refetchQueries: [{ query: XXX_QUERY, variables: FIRST_PAGE }]` to reset to page 1.

**GraphQL client** (corrected from an earlier, inaccurate version of this doc — see below): `src/lib/apollo.ts` instantiates a real `apolloClient` (`ApolloClient` + `InMemoryCache` + the `ErrorLink`/`HttpLink` chain described below) and exports `gqlFetch`/`gqlMutate`, two thin wrappers calling `apolloClient.query()`/`.mutate()` imperatively. **`ApolloProvider` is not used anywhere in the app** and Apollo's own reactive hooks (`useQuery`/`useMutation` from `@apollo/client/react`) are not used either — every GraphQL hook in `src/hooks/**` instead uses **TanStack Query** (`useQuery`/`useInfiniteQuery`/`useMutation`) as the outer wrapper, calling `gqlFetch`/`gqlMutate` inside `queryFn`/`mutationFn`. TanStack Query's cache is therefore the app's one real reactive cache for both GraphQL and REST data — Apollo's `InMemoryCache` is never read from. Do not build a new GraphQL hook by hand — use `useGqlQuery`/`useGqlConnectionQuery` (`src/lib/gqlQuery.ts`) for reads and `useGqlMutation` (`src/lib/gqlMutation.ts`) for writes, patching the TanStack cache in `onSuccess` via `src/lib/cachePatch.ts`'s `patchFlatArray`/`patchConnection`/`patchNestedField` (and their `removeFrom*`/`appendTo*` counterparts) rather than hand-rolling `setQueryData`/`setQueriesData` calls. Apollo Client is still real and load-bearing for exactly three things: the imperative `query()`/`mutate()` calls inside `gqlFetch`/`gqlMutate`, the `ErrorLink` (from `@apollo/client/link/error`) 401-refresh flow described next, and `TypedDocumentNode`/`gql` typing on every operation in `src/graphql/*.operations.ts`. The `ErrorLink` sits first in the link chain; on `UNAUTHENTICATED` (checked via `CombinedGraphQLErrors.is(error)`) or HTTP 401 (checked via `ServerError.is(error)`) outside public paths it calls `tryRefresh()` (from `api.ts`) and retries the original operation via `forward(operation)` using `Observable` (from `@apollo/client/utilities`). If refresh fails, falls back to `window.location.replace('/login')`. Link chain is `ApolloLink.from([errorLink, httpLink])` — no WebSocket link, no `split()`. **NO WEBSOCKETS**: there are no GraphQL subscriptions; real-time timer updates use SSE via `useTimerSSE` hook.

**REST client**: `src/lib/api.ts` exports `apiGet`, `apiPost`, `apiPatch`, `apiDelete` — thin `fetch` wrappers with `credentials: 'include'` and typed error (`ApiError`). Base URL derived from `VITE_API_URL` by stripping `/graphql`. On 401, automatically fires the `refreshToken` GraphQL mutation and retries the original request once; if refresh also fails, throws `ApiError(401)`. `Content-Type: application/json` is only sent when the request has a body — body-less requests (GET, DELETE) omit it. Use these for all REST endpoints; wrap them in TanStack Query hooks in `src/hooks/`.

**Auth state**: determined by the `me` query. If it returns a user, the session is active. No tokens are managed in JS — auth cookies are HTTP-only and invisible to the frontend.

**File layout**:

```
src/
├── lib/
│   ├── apollo.ts                  — apolloClient + gqlFetch/gqlMutate imperative wrappers (credentials: 'include')
│   ├── gqlQuery.ts                — useGqlQuery, useGqlConnectionQuery (shared TanStack-Query-over-GraphQL read hooks)
│   ├── gqlMutation.ts             — useGqlMutation (shared TanStack-Query-over-GraphQL write hook)
│   ├── cachePatch.ts              — patchFlatArray/patchConnection/patchNestedField + removeFrom*/appendTo* cache-surgery helpers
│   ├── api.ts                     — REST fetch helpers (apiGet/apiPost/apiPatch/apiDelete, ApiError)
│   └── utils.ts                   — cn() helper (clsx + tailwind-merge) for conditional class names
├── graphql/
│   ├── auth.operations.ts         — All auth queries/mutations typed with TypedDocumentNode<Result, Vars> (includes REQUEST_PASSWORD_RESET_MUTATION, RESET_PASSWORD_MUTATION)
│   ├── dashboard.operations.ts    — DASHBOARD_QUERY → DashboardData (metrics, deadlines, recent entries)
│   ├── clients.operations.ts      — Client + CompanyContact CRUD; CLIENT_FIELDS includes contacts sub-selection
│   ├── projects.operations.ts     — Project CRUD + ProjectStatus enum
│   ├── tasks.operations.ts        — Task CRUD + TaskStatus enum
│   ├── time-entries.operations.ts — TimeEntry CRUD + startTimer/stopTimer/activeTimer (no subscription)
│   ├── invoices.operations.ts     — Invoice CRUD + generateInvoice + addInvoiceItem/removeInvoiceItem
│   └── users.operations.ts        — Admin-only: USERS_QUERY, UPDATE_USER_MUTATION, DELETE_USER_MUTATION
├── hooks/
│   ├── useAuth.ts                 — useCurrentUser, useLogin, useRegister, useLogout, useUpdateMe, useSetupTwoFactor, useEnableTwoFactor, useVerifyTwoFactor, useDisableTwoFactor, useRequestPasswordReset, useResetPassword
│   ├── useDashboard.ts            — useDashboard() → { dashboard: DashboardData | null, loading }
│   ├── useClients.ts              — useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient, useCreateCompanyContact(clientId), useUpdateCompanyContact(clientId), useDeleteCompanyContact(clientId)
│   ├── useProjects.ts             — useProjects(status?), useProject, useCreateProject, useUpdateProject, useDeleteProject
│   ├── useTasks.ts                — useTasks(projectId), useCreateTask, useUpdateTask, useDeleteTask
│   ├── useTimeEntries.ts          — useTimeEntries(filters?), useActiveTimer (SSE via useTimerSSE), useStartTimer, useStopTimer, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry
│   ├── time/useTimerSSE.ts        — SSE hook; connects to GET /timer/events; writes to Apollo cache on event
│   ├── useInvoices.ts             — useInvoices(status?), useInvoice, useCreateInvoice, useGenerateInvoice, useUpdateInvoice, useDeleteInvoice, useAddInvoiceItem, useRemoveInvoiceItem
│   ├── useRates.ts                — useRates(type?), useCreateRate, useUpdateRate, useDeleteRate
│   ├── useClockify.ts             — TanStack Query hooks for all Clockify REST endpoints
│   ├── useHubspot.ts              — TanStack Query hooks for all HubSpot REST endpoints (status, contacts, companies, deals, disconnect, infinite lists, contact search)
│   └── useUsers.ts                — Admin-only: useUsers, useUpdateUser, useDeleteUser
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
    │   ├── LoginPage.tsx          — Email/password form; "Forgot password?" link; shows success message from router state after password reset; on requiresTwoFactor → navigate to /2fa/verify
    │   ├── RegisterPage.tsx       — Registration form
    │   ├── TwoFactorVerifyPage.tsx — TOTP code input; reads tempToken from router state; "Use backup code" ghost button toggles to backup code form (`useVerifyTwoFactorBackup`)
    │   ├── TwoFactorSetupPage.tsx — Security settings page: QR setup + enable 2FA; after enable shows backup codes in Alert with 2-col grid + "Copy all" button
    │   ├── ForgotPasswordPage.tsx — Email input; success state never confirms email existence; link back to /login
    │   └── ResetPasswordPage.tsx  — Reads ?token= from URL; validates min-8-char + passwords-match; on success navigates to /login with state.message
    ├── account/
    │   ├── DashboardPage.tsx      — Protected landing page with 2FA prompt
    │   ├── EditProfilePage.tsx    — Profile editor: Profile tab (name/email) + Security tab (2FA setup)
    │   └── AuditLogPage.tsx       — Admin-only: three tabs (Audit log + HubSpot connections + Users table with inline role select + delete)
    ├── clients/
    │   ├── ClientsPage.tsx        — Client list + new client form (company-only: name/legalName/address/city/country/postalCode/vatNumber/email/phone); card shows first contact name or contacts count badge
    │   └── ClientDetailPage.tsx   — Client detail: `ClientHeader` (read/edit toggle — name/legalName/email/phone/address/city/postalCode/country/vatNumber); Contacts tab (default, list + AlertDialog delete + inline add/edit form), Projects tab, Activity tab
    ├── projects/
    │   ├── ProjectsPage.tsx       — Project list: filter section (search input + status tabs inside a `border-b border-border pb-4 mb-6` div inside `Tabs`) clearly above results; inline create form above `Tabs`
    │   └── ProjectDetailPage.tsx  — Project detail: `ProjectHeader` (read/edit toggle — title/description/status/languages/wordCount/fixedFee/hourlyRate/perWordRate/currency/dates); Tasks kanban (@dnd-kit) + Time tab + Overview tab
    ├── tasks/
    ├── time/
    │   └── TimeEntriesPage.tsx    — Active timer banner, start/stop, manual log entry, date range filter
    ├── invoices/
    │   ├── InvoicesPage.tsx       — Invoice list: filter section (search input + status tabs inside `border-b border-border pb-4 mb-6` div inside `Tabs`) clearly above results; create/generate forms between page header and `Tabs`
    │   └── InvoiceDetailPage.tsx  — Line items, status transitions, PDF download
    ├── rates/
    │   └── RatesPage.tsx          — Rate management: type tabs (Overview/Hourly/Per Word/Fixed Fee) in `border-b border-border pb-4 mb-6` filter section inside `Tabs`, clearly above content; full CRUD per type
    └── integrations/
        ├── TimeTrackerPage.tsx    — Clockify time tracker: connect → pick workspace → start/stop/edit timers
        └── HubspotPage.tsx        — HubSpot CRM: OAuth connect flow + tabbed view
```

**Routing** (`App.tsx` — `createBrowserRouter`):

| Route              | Component             | Auth                                                                                                           |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/login`           | `LoginPage`           | public                                                                                                         |
| `/register`        | `RegisterPage`        | public                                                                                                         |
| `/2fa/verify`      | `TwoFactorVerifyPage` | public (has `tempToken` in router state)                                                                       |
| `/forgot-password` | `ForgotPasswordPage`  | public                                                                                                         |
| `/reset-password`  | `ResetPasswordPage`   | public (reads `?token=` from URL)                                                                              |
| `/`                | `DashboardPage`       | protected (inside `AppLayout`)                                                                                 |
| `/profile/edit`    | `EditProfilePage`     | protected (inside `AppLayout`)                                                                                 |
| `/settings/2fa`    | `TwoFactorSetupPage`  | protected (inside `AppLayout`) — linked from `DashboardPage` "Enable 2FA" prompt when `!user.twoFactorEnabled` |
| `/clients`         | `ClientsPage`         | protected (inside `AppLayout`)                                                                                 |
| `/clients/:id`     | `ClientDetailPage`    | protected (inside `AppLayout`)                                                                                 |
| `/projects`        | `ProjectsPage`        | protected (inside `AppLayout`)                                                                                 |
| `/projects/:id`    | `ProjectDetailPage`   | protected (inside `AppLayout`)                                                                                 |
| `/time`            | `TimeEntriesPage`     | protected (inside `AppLayout`)                                                                                 |
| `/invoices`        | `InvoicesPage`        | protected (inside `AppLayout`)                                                                                 |
| `/invoices/:id`    | `InvoiceDetailPage`   | protected (inside `AppLayout`)                                                                                 |
| `/time-tracker`    | `TimeTrackerPage`     | protected (inside `AppLayout`)                                                                                 |
| `/hubspot`         | `HubspotPage`         | protected (inside `AppLayout`)                                                                                 |
| `/rates`           | `RatesPage`           | protected (inside `AppLayout`)                                                                                 |
| `/admin`           | `AuditLogPage`        | protected + ADMIN role (inside `AppLayout`)                                                                    |

The protected route hierarchy is: `ProtectedRoute → AppLayout → [page]`. Adding a new protected page means adding it as a child of `AppLayout` in `App.tsx`. Admin-only pages have no server-side route guard on the frontend — the backend API calls return 403 for non-admins. The sidebar only renders the Admin nav item when `user?.role === "ADMIN"`.

**Key rules:**

- The React Compiler handles memoization — keep components and hooks pure.
- Vite plugins: `tailwindcss()` (first) + `@vitejs/plugin-react` (JSX) + `@rolldown/plugin-babel` (React Compiler). Add Babel plugins to `vite.config.ts` only, not `.babelrc`.
- `useCurrentUser()` uses `errorPolicy: 'ignore'` so unauthenticated requests don't throw.
- After `logout`, call `client.clearStore()` to wipe the Apollo cache. `useLogout` also writes `localStorage.setItem('ttc_logout', Date.now())` to trigger cross-tab logout via the `storage` event.
- Cross-tab logout is handled by `RootLayout` in `App.tsx` — a root route element that wraps all routes and registers a `storage` listener. Must stay inside the router tree to use `useNavigate`.
- `ProtectedRoute` passes `state={{ from: pathname + search }}` to `<Navigate to="/login">`. `LoginPage` reads `state.from` and navigates there on success. `TwoFactorVerifyPage` threads `from` through its own state so 2FA flows also land on the intended path.
- Google OAuth is a full-page redirect (`redirectTo(.../auth/google)`), not a GraphQL mutation.
- **Never touch `window.location` directly** — use `redirectTo` / `replaceLocation` / `currentPathname` from `src/lib/navigation.ts`, and `vi.mock("@/lib/navigation")` in tests. Unit tests run in Vitest's `vmThreads` pool (shared options in `vitest.unit.ts`), where `window.location` is non-configurable, so `Object.defineProperty(window, "location", …)` throws. Pages reachable without a session are defined once, by `isPublicPath()` in the same module (used by both `queryClient.ts` and `apollo.ts`).
- `vitest.unit.ts` pre-bundles heavy libraries (`deps.optimizer.client.include`). Never add a library there that any test `vi.mock()`s (e.g. `react-router-dom`, `recharts`, `@dnd-kit/core`) — the mock stops applying.
- `Sidebar.tsx` owns the user display, role badge, and sign-out button — do not duplicate these in page components. The username/role block is a `<Link to="/profile/edit">` — clicking it navigates to the edit profile page.
- Protected page components are full width, back-office style: `w-full px-8 py-8` — no `max-w-*`/`mx-auto` page cap. Do not add custom headers with back buttons; sidebar navigation replaces them.
- **KPIs** (label + headline number cards) always use `KpiGrid` + `KpiCard` from `src/components/kpi/KpiCard.tsx` — fixed 14rem equal-width cards. Never hand-roll a KPI `Card` or a stretching `grid-cols-N` for KPIs.
- **KPI numbers** go through `CompactNumber` (`src/components/kpi/CompactNumber.tsx`): full value below 1,000,000, short form from there (8.2M, 10B, 1T; `fractionDigits` for money) with the full value in the `title`. Dashboard tabs (project list / project detail) stack KPIs first, then the `MonthSelector`, then the charts in a wrapping row.
- **Client / project / task dropdowns** use `ClientPicker` / `ProjectPicker` / `TaskPicker` (generic `SearchSelect` + `useSearchSelectState`): the list loads only when opened, 20 at a time, and typing searches the backend (`search` arg on `clients`/`projects`/`tasks`) so no record is out of reach. The selected item's name comes from `useClient`/`useProject`/`useTask` by id. Never build such a dropdown from `useAllClients`/`useAllProjects` (capped at 1000) — those remain only for id→name lookups.
- Nav links in `Sidebar.tsx` use `<NavLink end>` — always pass `end={true}` for the `/` route so it doesn't highlight on every sub-path.
- Sidebar is `flex-row` (horizontal top bar) on mobile, `sm:flex-col sm:w-56` sticky on desktop — controlled by Tailwind `sm:` breakpoint (640px).
- Dark mode is class-based via `@custom-variant dark (&:is(.dark *));` in `src/index.css` — use `dark:` variants. Toggled manually by `useTheme()` (`src/hooks/useTheme.ts`, a `useSyncExternalStore` singleton, no Provider needed), persisted in `localStorage["ttc_theme"]`, with a FOUC-prevention inline script in `index.html` applying the `.dark` class before first paint (falls back to `prefers-color-scheme` on first visit). Toggle button lives in `Sidebar.tsx`'s title row.
- **UI law — Shadcn + Tailwind only**: every visual element must use a Shadcn component + Tailwind semantic tokens. No raw HTML interactive elements (`<button>`, `<input>`, `<label>`), no inline `style={}`, no custom CSS files beyond `src/index.css`. If a needed Shadcn component doesn't exist yet, add it with `pnpm dlx shadcn@latest add <name> --yes` before writing UI code.
- **Styling**: always use semantic tokens — see Stack section for the full list. Use `cn()` from `@/lib/utils` for conditional classes. Never write `className="bg-zinc-800"` or similar — always `className="bg-background"` / `className="bg-muted"` etc.
- **Path alias**: `@/*` resolves to `./src/*`. Use it for cross-directory imports (e.g. `@/components/ui/button`, `@/lib/utils`). Relative imports are fine for same-directory siblings.
- **Shadcn components**: import from `@/components/ui/<name>`. Add new ones via `pnpm dlx shadcn@latest add <name> --yes`. The CLI must place files in `src/components/ui/` — verify after running; if the CLI creates a literal `@/` directory at the project root, move the files to `src/components/ui/` and delete the stale `@/` dir. `button.tsx` exports both `Button` (component) and `buttonVariants` (non-component) — this trips the `react-refresh/only-export-components` lint rule. The export line carries `// eslint-disable-next-line react-refresh/only-export-components`; do not remove it or move `buttonVariants` to a separate file.
- **TypeScript 6 constraints**: `erasableSyntaxOnly` bans parameter properties. Declare class fields explicitly: `readonly x: T; constructor(x: T) { this.x = x; }`. `baseUrl` is deprecated — use `paths` alone in `tsconfig.app.json`.
- Do not call `setState` synchronously inside `useEffect` bodies — the React Compiler lint rule flags this. For live timers, store the display string as state and update it inside `setInterval`: `setInterval(() => setDisplay(format(startIso)), 1000)`. Do NOT use a tick-counter (`setTick`) and compute during render — the compiler memoizes expressions like `format(startIso)` because `startIso` never changes, freezing the display. The interval callback is async (not render-phase), so `setDisplay(...)` inside it is allowed.
- Do not read `ref.current` during render — the React Compiler lint rule `react-hooks/refs` flags this.
- **GraphQL list-item nullability**: NestJS code-first generates `[Int!]` (non-null items) for `@Field(() => [Int])` / `@Args({ type: () => [Int] })`. Frontend variable declarations must match: use `$projectIds: [Int!]` not `$projectIds: [Int]`. The mismatch causes Apollo Server to return HTTP 400 for every request containing that operation, even when the variable is not supplied — because Apollo Server validates the variable declaration against the schema argument type. Rule: always check the generated `schema.gql` for the exact type and mirror it in the frontend operation string.
- **`useStopTimer` explicit refetch**: `useStopTimer` includes `refetchQueries: [{ query: ACTIVE_TIMER_QUERY }, "TimeEntries"]`. The string-based `"TimeEntries"` refetch is a best-effort; for guaranteed list update, `TimeEntriesPage` also calls `refetch()` from `useTimeEntries` explicitly after stop resolves: `void stopTimer().then(() => refetch())`. The `refetch()` function returned by `useQuery` is bound to the specific `ObservableQuery` instance with correct variables — more reliable than the string-based lookup. Always use this two-layer pattern (refetchQueries + explicit refetch) when the list must update immediately after a mutation.

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

| What                                                             | Import from                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ApolloClient`, `InMemoryCache`, `HttpLink`, `ApolloLink`, `gql` | `@apollo/client/core`                                                                |
| `useQuery`, `useMutation`, `useApolloClient`, `ApolloProvider`   | `@apollo/client/react`                                                               |
| `ErrorLink`                                                      | `@apollo/client/link/error`                                                          |
| `CombinedGraphQLErrors`, `ServerError`                           | `@apollo/client/errors`                                                              |
| `Observable`                                                     | `@apollo/client/utilities`                                                           |
| `TypedDocumentNode`                                              | `@apollo/client/core`                                                                |
| `split`, `getMainDefinition`                                     | `@apollo/client/core` / `@apollo/client/utilities` — **not used** (no subscriptions) |

- `from(links)` is **deprecated** — use `ApolloLink.from(links)` instead.
- `onError(handler)` is **deprecated** — use `new ErrorLink(handler)` instead.
- `ErrorLink.ErrorHandler` receives `{ error, result, operation, forward }` — not `{ graphQLErrors, networkError }`. Use `CombinedGraphQLErrors.is(error)` and `ServerError.is(error)` to type-narrow.
- All GraphQL operations in `src/graphql/auth.operations.ts` are typed with `TypedDocumentNode<Result, Vars>` so `useQuery`/`useMutation` infer data shapes automatically.

## Core GraphQL Hooks (step 1.3)

All hooks use TanStack Query (`useQuery`/`useInfiniteQuery`/`useMutation`) over `gqlFetch`/`gqlMutate` with `TypedDocumentNode` operations — see the corrected "GraphQL client" note under Architecture. This section's per-hook tables below predate the `useGqlQuery`/`useGqlConnectionQuery`/`useGqlMutation` consolidation and the many hook files added since (occupations, admin, rate-sheets, tags, rates) — treat as a historical snapshot of the return shapes, not an exhaustive or current file list.

### `useClients.ts`

| Hook                                | Returns                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `useClients()`                      | `{ clients, loading, hasMore, loadMore, total }` — limit 20, cursor pagination |
| `useClient(id)`                     | `{ client, loading }` — client includes `contacts: CompanyContact[]`           |
| `useCreateClient()`                 | `{ createClient(input), loading }`                                             |
| `useUpdateClient()`                 | `{ updateClient(input), loading }`                                             |
| `useDeleteClient()`                 | `{ deleteClient(id) }`                                                         |
| `useCreateCompanyContact(clientId)` | `{ createContact(input), loading }` — refetches `CLIENT_QUERY` for `clientId`  |
| `useUpdateCompanyContact(clientId)` | `{ updateContact(input), loading }` — refetches `CLIENT_QUERY` for `clientId`  |
| `useDeleteCompanyContact(clientId)` | `{ deleteContact(id) }` — refetches `CLIENT_QUERY` for `clientId`              |

### `useProjects.ts`

| Hook                   | Returns                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `useProjects(status?)` | `{ projects, loading, hasMore, loadMore, total }` — limit 20; refetches when status changes |
| `useProject(id)`       | `{ project, loading }`                                                                      |
| `useCreateProject()`   | `{ createProject(input), loading }`                                                         |
| `useUpdateProject()`   | `{ updateProject(input), loading }`                                                         |
| `useDeleteProject()`   | `{ deleteProject(id) }`                                                                     |

### `useTasks.ts`

| Hook                       | Returns                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `useTasks(projectId)`      | `{ tasks, loading, hasMore, loadMore, total }` — limit 50 (kanban) |
| `useCreateTask(projectId)` | `{ createTask(input), loading }`                                   |
| `useUpdateTask(projectId)` | `{ updateTask(input), loading }` — invalidates tasks for project   |
| `useDeleteTask(projectId)` | `{ deleteTask(id) }`                                               |

### `useTimeEntries.ts`

| Hook                       | Returns                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `useTimeEntries(filters?)` | `{ entries, loading, hasMore, loadMore, total, refetch }` — limit 20; filters: `{ projectId?, projectIds?: number[], start?, end? }` |
| `useActiveTimer()`         | `{ activeTimer, loading }` — receives updates via SSE (`useTimerSSE`); no polling                                                    |
| `useStartTimer()`          | `{ startTimer(input), loading }`                                                                                                     |
| `useStopTimer()`           | `{ stopTimer(), loading }` — call `stopTimer().then(() => refetch())` at the call site for guaranteed list update                    |
| `useCreateTimeEntry()`     | `{ createTimeEntry(input), loading }`                                                                                                |
| `useUpdateTimeEntry()`     | `{ updateTimeEntry(input), loading }`                                                                                                |
| `useDeleteTimeEntry()`     | `{ deleteTimeEntry(id) }`                                                                                                            |

### `useInvoices.ts`

| Hook                                       | Returns                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `useInvoices(status?, clientId?, search?)` | `{ invoices, loading, hasMore, loadMore, total }` — limit 20            |
| `useInvoice(id)`                           | `{ invoice, loading }`                                                  |
| `useCreateInvoice()`                       | `{ createInvoice(input), loading }`                                     |
| `useGenerateInvoice()`                     | `{ generateInvoice(input), loading }`                                   |
| `useUpdateInvoice(id)`                     | `{ updateInvoice(input), loading }` — takes invoiceId at hook call site |
| `useDeleteInvoice()`                       | `{ deleteInvoice(id) }`                                                 |
| `useAddInvoiceItem(invoiceId)`             | `{ addItem(input), loading }` — refetches invoice on success            |
| `useUpdateInvoiceItem(invoiceId)`          | `{ updateItem(input) }` — updates description/qty/unitPrice; refetches  |
| `useRemoveInvoiceItem(invoiceId)`          | `{ removeItem(itemId) }` — refetches invoice on success                 |

## Status & Known Gaps

- **Clockify API key and HubSpot tokens**: encrypted at rest with AES-256-GCM when `APP_ENCRYPTION_KEY` is set (see backend CLAUDE.md).
- **Google OAuth persistent redirect**: ~~`from` path not preserved before full-page redirect~~ — resolved (#1 ✅). `sessionStorage("oauth_from")` set before redirect; read back in `LoginPage` and `ProtectedRoute` after callback. **White screen bug fixed (#66 ✅)**: backend always redirects to `FRONTEND_URL` (`/`). When user logged in from `/login` (no prior path), `oauth_from = "/"`. `ProtectedRoute` at `/` returned `<Navigate to="/" replace />` — React Router no-ops a same-URL navigate, component stayed as `<Navigate>` (renders nothing) → white screen. Fix: `ProtectedRoute` compares `oauthFrom` to `location.pathname + location.search` before navigating; skips the `<Navigate>` if identical, falls through to `<Outlet />` directly.
- **HubSpot pagination**: ~~only loaded first page~~ — resolved. All three tabs use `useInfiniteQuery`; "Load more" button fetches next cursor page.
- **HubSpot OAuth CSRF**: ~~state was bare userId~~ — resolved on backend (#12). OAuth state is now HMAC-SHA256 signed with a nonce and 10-min expiry.
- **Microsoft OAuth**: not yet implemented — no button, no route, no strategy.
- **Password reset**: `ForgotPasswordPage` (`/forgot-password`) + `ResetPasswordPage` (`/reset-password`) implemented (#31 ✅). Email delivery requires `SMTP_HOST` on backend; without it the reset URL is logged to console. `LoginPage` shows `state.message` success banner after redirect from `ResetPasswordPage`.
- **Clockify → TTC import**: "Import from Clockify" button on `TimeEntriesPage` (visible only when Clockify connected). Date range picker; on success shows `"Imported N, skipped M"` alert (#35 ✅). **Apollo refetch bug fixed**: `useImportClockifyEntries.onSuccess` previously called `qc.invalidateQueries({ queryKey: ["timeEntries"] })` — dead code because TTC time entries are Apollo-managed, not TanStack Query. Removed. `TimeEntriesPage.handleImport` now calls `void refetch()` after `mutateAsync` resolves to force Apollo to reload the visible date range.
- **HubSpot contact import**: "Import as client" button per contact row in `ContactsTab`. Per-row `ImportButton` component flips to "Imported" badge on success. Idempotent — re-importing same contact returns existing TTC client (#36 ✅).
- **Invoice PDF**: downloaded via `apiGet<Blob>('/invoices/:id/pdf', { responseType: 'blob' })` — `apiGet` accepts an optional second arg `{ responseType?: 'blob' }`; when `'blob'`, `request()` calls `res.blob()` instead of `res.json()`. Always pass `{ responseType: 'blob' }` for binary endpoints. PDF is multi-page; includes logo from `user.logoUrl` if set and SSRF-safe.
- **generateInvoice unit prices**: `InvoicesPage` generate form now has a "Hourly rate" input. Auto-fills from selected project's `unitPrice`. If left blank, backend falls back to `project.unitPrice` then `0`. `GENERATE_INVOICE_MUTATION` accepts `hourlyRate?: number` (#38 ✅).
- **SSE timer events** (#44 ✅): `useTimerSSE` (`src/hooks/time/useTimerSSE.ts`) opens `EventSource(BASE_URL + '/timer/events', { withCredentials: true })`. On `onmessage`, parses `TimeEntry | null` and calls `client.writeQuery({ query: ACTIVE_TIMER_QUERY, ... })` to update Apollo cache. Browser auto-reconnects on drop. No WebSockets — `apollo.ts` has no WS link, no `split()`.
- **Invoice item inline edit**: clicking description/qty/unit price on a row enters edit mode — three `Input` fields with live total preview. ✓/Enter saves; ✕/Escape cancels. `useUpdateInvoiceItem(invoiceId)` hook calls `UPDATE_INVOICE_ITEM_MUTATION` (#45 ✅).
- **Invoice logo**: `User.logoUrl` (optional, HTTPS only) set from `EditProfilePage` Profile tab. Logo preview shown in `InvoiceDetailPage` header (right-aligned, max 110×50 px). Backend embeds logo in PDF top-right corner on PDF generation.
- **Route error page**: `RouteErrorPage` (`src/components/layout/RouteErrorPage.tsx`) is the router `errorElement`, on a pathless route wrapping every `AppLayout` page (crash shows inside the layout, sidebar kept) and on the root route as a last resort. Shows "Something went wrong" with Reload (`navigate(0)`) and Back to dashboard.
- **Dashboard deadlines**: `UpcomingDeadlines` shows each row's urgency from local calendar days: before today = red `TriangleAlert` ("Late"), today to 7 days = yellow `Clock` (`text-amber-500`), later = green `Calendar` (`text-emerald-600`); icons carry an `aria-label`. Rows link to `/projects/:id`, or `/projects/:id?task=:taskId` for tasks and checklist items: `ProjectDetail` opens that task's modal from `?task=` and drops the parameter when the modal closes.
- **Task colour**: `TaskColorField` (task modal) wraps the client `ColorField` (`src/components/clients/form-fields/ColorField.tsx`, 8 presets + hex input): a preset saves at once, typed text only once it is a full `#rrggbb`, an emptied field clears it. `SortableRow` (project Tasks list) shows it as the same square as client cards (`data-testid="task-color-swatch"`); kanban cards don't.
- **Project Activity tab**: `ActivityTab({ projectId })` pages `projectActivities` through `useProjectActivities` (newest first, 20 per page, Load more) and groups events by `activity.task`. `TASKS_QUERY` doesn't select activities; only the task modal's `TASK_QUERY` does.
- **Invoice generation**: `GenerateInvoiceForm` shows the server's refusal (e.g. "Nothing to invoice") in a destructive `Alert` and stays open.
- **ProjectDetailPage kanban**: drag-and-drop uses `@dnd-kit/core` + `@dnd-kit/sortable`. Every drop calls `moveTask({ id, status, position })` (`useMoveTask`): dropped on a card it takes that card's place, dropped on empty column space it goes last; the server renumbers the columns, so the hook shows the new column optimistically, rolls back on error and refetches the tasks after. `DragEndEvent` is a type-only export from `@dnd-kit/core` — always import it with `import type { DragEndEvent } from '@dnd-kit/core'`. A regular import causes Vite to throw `does not provide an export named 'DragEndEvent'` because the ESM bundle has no runtime value for it.
- **Confirm dialogs** (#51 ✅): Shadcn `AlertDialog` added (`src/components/ui/alert-dialog.tsx`). Wraps destructive deletes in `ClientsPage` (per-row ✕ button + confirm), `ProjectsPage` (same), `InvoiceDetailPage` (Delete button for DRAFT invoices only, navigates to `/invoices` after), `AuditLogPage` UsersTable (Delete user button). Stop propagation on trigger buttons inside clickable cards.
- **Invoice total in list** (#52 ✅): `InvoicesPage` already calculates `invTotal = inv.items.reduce(...)` and shows `{invTotal.toFixed(2)} {inv.currency}` — no change needed.
- **Audit log pagination** (#53 ✅): `useAuditLog` converted from `useQuery` to `useInfiniteQuery<AuditPage>`. Flattens pages; "Load more" button in `AuditTable` when `hasNextPage`. Backend returns `{ items, nextCursor }`.
- **Clockify disconnect** (#54 ✅): `useDisconnectClockify` hook calls `DELETE /clockify/credentials`. "Disconnect Clockify" button added to `TimeTrackerPage` footer (below "Update API key" details). Invalidates `["clockify"]` on success.
- **Task assignees removed (2026-10-08)**: tasks have no assignee any more (backend dropped `Task.assigneeId`, `myTasks` and `members`). Only the project owner sees and edits a project's tasks. Old `ASSIGNED` history rows render through `TaskActivityFeed`'s generic fallback. Due date stays: `SortableTask` shows it in view mode.
- **Kanban delete confirm** (#57 ✅): Delete `✕` button in `SortableTask` wrapped in `AlertDialog` — "Delete [title]? This cannot be undone." `e.stopPropagation()` on trigger.
- **Clockify disconnect confirm** (#58 ✅): "Disconnect Clockify" button in `TimeTrackerPage` wrapped in `AlertDialog` with destructive warning.
- **Client activity time entries** (#59 ✅): `ClientDetailPage` computes `clientProjectIds`; calls `useTimeEntries({ projectIds: clientProjectIds })` (guarded when empty). Sums `durationSeconds`; shows "Time logged" section with `formatDuration(h/m)` or "No time logged" / "No projects linked".
- **useTimeEntries projectIds** (#59 ✅): `useTimeEntries(filters?)` now accepts `projectIds?: number[]`. `TIME_ENTRIES_QUERY` vars include `$projectIds: [Int]`. Hook spreads `projectIds` into `baseVars` when provided.
- **Client activity invoice links** (#59 ✅): `InvoiceRow` in `ClientDetailPage` has `cursor-pointer hover:bg-accent/30` and calls `onClick` → `navigate('/invoices/:id')`.
- **Invoice text search** (#60 ✅): `InvoicesPage` has debounced search input (300 ms). `useInvoices(status?, clientId?, search?)`. `INVOICES_QUERY` accepts `$search: String`. `debouncedSearch || undefined` avoids sending empty string.
- **Client/project text search** (#55 ✅): `ClientsPage` and `ProjectsPage` have debounced search inputs. `useClients({ search, clientType, status, excludeStatus, industry, limit })` (options object) and `useProjects(status?, search?)` pass them through GQL vars. Client search matches company name or first/last name (server side).
- **Client list filters**: All/Companies tabs show a "Company name" field (`companyName`), the Individuals tab "Last name" + "First name" fields (`lastName`, `firstName`, sorted by last name); values are trimmed and debounced 300 ms, and switching tab clears them at once. Sort + Order controls (`SortControls`, `src/components/sort/`, the generic pair also behind `TaskSortControls`): Companies/All sort by Company name, Individuals by Last name or First name, A→Z by default and reset on tab change. Plus an Industry `Select` ("All industries" + `INDUSTRY_LABEL_MESSAGES`, incl. Translation agency / Agence de traduction). The list is always `status: CLIENT`.
- **Client LinkedIn URL**: `linkedinUrl` sits right under Website in both the client edit form (`ClientHeader` / `useClientHeaderForm`) and `NewClientForm`, with the same `isValidHttpUrl` check (error after leaving the field or on Save). The header shows a "LinkedIn" link (new tab) only when `toSafeHref` accepts it.
- **Contact LinkedIn URL**: `ContactsTab` (add) and `ContactRow` (inline edit) have a LinkedIn field after Job title, checked with `isValidHttpUrl` (error after leaving the field or on save, reset when the form reopens); the row shows a "LinkedIn" link (new tab) when `toSafeHref` accepts it.
- **Former clients**: status `FORMER_CLIENT` ("Former client" / "Ancien client") is first in `STATUS_ORDER`, so it's the first column on `/prospects` and never on `/clients`. `useUpdateClient` drops a client from cached lists whose status or industry filter it no longer matches.
- **HubSpot company/deal search** (#50 ✅): `CompaniesTab` and `DealsTab` mirror `ContactsTab` debounced search pattern.
- **Rates** (#62 ✅): `RatesPage` at `/rates`. Four tabs: Overview (at-a-glance dashboard of all 3 types), Hourly, Per Word, Fixed Fee. Each rate tab has full CRUD via `RateList` component. `RateRow` — name, description, amount (font-mono, 4dp for PER_WORD), currency badge, Edit, AlertDialog-wrapped delete. `RateForm` — name, amount (step 0.0001), currency Select (EUR/USD/GBP/CHF/CAD/AUD/JPY), description. Overview section shows counts and all rates grouped by type; empty state guides to tabs.
- **Client as Company + Contact** (#63 ✅): `Client` extended with company fields (`legalName`, `city`, `country`, `postalCode`, `vatNumber`). Superseded by #64.
- **CompanyContact separation** (#64 ✅): `CompanyContact` interface added to `clients.operations.ts` (`id, clientId, firstName?, lastName?, email?, phone?`). `CLIENT_FIELDS` now includes `contacts { id clientId firstName lastName email phone ... }`. New mutations: `CREATE_COMPANY_CONTACT_MUTATION`, `UPDATE_COMPANY_CONTACT_MUTATION`, `DELETE_COMPANY_CONTACT_MUTATION`. Contact hooks take `clientId` at call site and refetch `CLIENT_QUERY` on success. `ClientsPage` form is company-only (no contact person fields); card shows first contact's name or a count badge when 2+. `ClientDetailPage`: Contacts tab is default — lists contacts with AlertDialog per-row delete + inline add-contact form (firstName/lastName/email/phone). Company info moves to a single-column block in the header.
- **Filter section above results** (#65 ✅): `ProjectsPage`, `InvoicesPage`, `RatesPage` — filter controls (search input + status/type `TabsList`) moved inside `Tabs` component and wrapped in `<div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">` (search+tabs) or `<div className="pb-4 border-b border-border mb-6">` (tabs only). Creates a visually distinct filter bar clearly above results. `TabsContent` uses `className="mt-0"` since spacing is owned by the filter section wrapper.
- **CompanyContact inline edit** (#67 ✅): `ContactRow` now has a `✎` Edit button per row. Clicking initializes local `editForm` from the contact's current fields and renders a 2×2 inline form (firstName/lastName/email/phone). Save coerces empty strings to `undefined` and calls `updateContact`. Cancel reverts. `useUpdateCompanyContact(clientId)` already existed; no backend change.
- **Throttler WS shared bucket** (#68 ✅): `GqlThrottlerGuard` now overrides `canActivate` — detects WS subscription context (`context.getType() === 'graphql'` + `!ctx?.req`) and returns `true` immediately. Subscriptions bypass throttling entirely; all HTTP GQL operations and REST routes still go through `super.canActivate`.
- **createContact TOCTOU** (#69 ✅): Backend fix — `PrismaClientRepository.createContact` now accepts `userId` and wraps ownership check + insert in `prisma.$transaction`. Same for `updateContact` and `deleteContact`. `ClientsService.createContact` no longer calls `findById` separately. See backend CLAUDE.md for full detail.
- **oauth_from dual-consumer** (#70 ✅): Changed `oauth_from` sessionStorage format from bare string to `JSON.stringify({ dest, ts: Date.now() })`. Both `ProtectedRoute` and `LoginPage` parse + validate TTL (`Date.now() - ts < 60_000`). Keys older than 60 s silently discarded. `catch {}` handles legacy bare-string values. `GoogleOAuthButton` stores the new format.
- **Tabs data-horizontal latent bug** (#71 ✅): Fixed in `src/components/ui/tabs.tsx`. Changed `data-horizontal:flex-col` → `data-[orientation=horizontal]:flex-col` and all `group-data-horizontal/tabs:*` → `group-data-[orientation=horizontal]/tabs:*` variants. Removed per-page `className="flex-col"` workarounds from `ProjectsPage`, `InvoicesPage`, `RatesPage`, `EditProfilePage`.
- **`ProtectedRoute` oauth_from side effect** (#75 ✅): moved `sessionStorage.removeItem` out of render body into `useEffect`. During render: `sessionStorage.getItem` (read-only) derives `pendingOAuthDest`; if set, renders `null` instead of `<Outlet>`. `useEffect([isAuthenticated, location.pathname, location.search, navigate])`: re-reads, removes item (always — cleans stale items), navigates if valid dest. Safe for StrictMode / Concurrent Mode double-render.
- **ClockifyTab workspace picker for connected users** (#76 ✅): added `WorkspacePicker` inside the `<details>` "Update API key or workspace" block in `ClockifyTab` (`EditProfilePage.tsx`), after `ConnectForm`. Sub-label "Switch workspace". Users can now change workspace without disconnecting. No new hooks or backend changes.
- **Rates "No rates yet" after create (#78 ✅)**: Apollo caches `RATES_QUERY({})` (Overview) and `RATES_QUERY({ type })` (tab) separately. All three mutation hooks (`useCreateRate`, `useUpdateRate`, `useDeleteRate`) now accept `type?: RateType` and always refetch both cache variants via `refetchQueries`. `RateList` passes `type` to all three hooks.
- **Rates Overview inline edit + create (#79/#80 ✅)**: `OverviewSection` gained full CRUD — `useCreateRate(type)` + `useUpdateRate(type)` inside the component; `editingId` state for inline `RateForm`; "+ Add" button right-aligned in the section header (`ml-auto`).
- **Clockify EntryRow description inline edit (#81 ✅)**: description `<p>` is now click-to-edit — `editingDesc`/`descValue` state + `descInputRef`; Enter/blur saves (calls `patch({ description })`), Escape cancels. `patch()` always sends full `UpdateEntryInput`.
- **Clockify billable toggle plan detection (#82/#83 ✅)**: FREE-tier Clockify accounts get HTTP 400 on billability updates. `featureSubscriptionType` added to `ClockifyWorkspace` type. `TrackerView` calls `useClockifyWorkspaces()` (cached), computes `billabilityLocked` via allowlist: `PAID_CLOCKIFY_PLANS = new Set(["BASIC","STANDARD","PRO","ENTERPRISE"])` — anything not in the set locks the button. Prop threaded to `ActiveTimer` and all `EntryRow` instances. `BillableToggle` gains `disabled` prop. Running entries filtered from day list (no PUT on active timer).
- **Clockify plan badge in title (#84 ✅)**: `TimeTrackerPage` calls `useClockifyWorkspaces(status?.connected)` (cache hit — same query key as `TrackerView`). Extracts `featureSubscriptionType` for active workspace. Title row is `flex justify-between` — non-clickable `<Badge variant="secondary" className="font-mono">` on the right shows plan tier ("FREE", "BASIC", etc.). Hidden when plan unknown.
- **TOTP backup codes (#103 ✅)**: `useEnableTwoFactor` now returns `backupCodes: string[] | null` from mutation data (8 one-time codes). `TwoFactorSetupPage` shows post-enable `Alert` with 2-column grid of monospace codes + "Copy all codes" button + "won't be shown again" warning. `TwoFactorVerifyPage` gained a "Lost access to authenticator? Use backup code" ghost button that toggles to a backup code text input backed by `useVerifyTwoFactorBackup`. `ENABLE_TWO_FACTOR_MUTATION` now selects `{ backupCodes }` instead of scalar Boolean. `VERIFY_TWO_FACTOR_BACKUP_MUTATION` added.
- **SortableTask constants extracted**: `TASK_STATUSES` and `STATUS_LABELS` moved from `SortableTask.tsx` to `src/components/projects/taskConstants.ts` to satisfy `react-refresh/only-export-components` lint rule. `TasksTab` imports from `taskConstants`. `SortableTask.tsx` now exports component only.
- **TabsList/TabsTrigger styling**: `TabsList` base class has `gap-2` between triggers; background removed from the list container. `TabsTrigger` gets `cursor-pointer` and `group-data-[variant=default]/tabs-list:bg-muted` so `bg-muted` applies per-trigger (not the whole strip) for the default variant; `line` variant triggers stay transparent.
- **Client inline edit**: `ClientHeader` component (`src/components/clients/ClientHeader.tsx`) has a read/edit toggle — "Edit" button reveals a 2-column form for all company fields. `useClientDetail` now exposes `updateClient`/`updatingClient` from `useUpdateClient`. `ClientDetailPage` passes `onUpdate`/`saving` to `ClientHeader`.
- **Project inline edit**: `ProjectHeader` component (`src/components/projects/ProjectHeader.tsx`) has a read/edit toggle — "Edit" button reveals a 2-column form (title, description, status Select, languages, wordCount, fixedFee/hourlyRate/perWordRate, currency, startDate, deadline). `ProjectDetailPage` imports `useUpdateProject` and passes `onUpdate`/`saving` to `ProjectHeader`.
- **`Project.unitPrice` deprecated (2026-08-10)**: no frontend write path exists for it anywhere — `ProjectHeader`'s edit form uses `fixedFee`/`hourlyRate`/`perWordRate` only; `AdminProjectsTable.tsx` keeps `unitPrice` in local form state but never renders an `<Input>` for it or sends it in `createProject`/`updateProject` (dead field). `OverviewTab.tsx`'s old "Unit price"/"Est. revenue" cards (which read `project.unitPrice`) were replaced by a single "Pricing" card showing `fixedFee`/`hourlyRate`/`perWordRate`, each line conditional on `!= null`, card hidden when all three are unset. Don't build new UI against `project.unitPrice` — treat it as legacy/stale data for translation activity going forward.

## Docs

Implementation logs live in `../../docs/implementations/`:

| Step     | File                                                                                      | Contents                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| step1.2  | `step1.2/auth-implementation.md`                                                          | Backend auth system (Passport strategies, JWT, cookies, schema)                                                                       |
| step1.2  | `step1.2/auth-ui.md`                                                                      | Frontend auth pages and routing                                                                                                       |
| step1.2  | `step1.2/auth-remaining.md`                                                               | Persistent redirect, cross-tab logout, resolver guards, disable 2FA, Apollo token refresh                                             |
| step1.2  | `step1.2/shadcn-apollo-ts6-migration.md`                                                  | Apollo v4 fixes, TypeScript 6 compat, Shadcn/ui adoption                                                                              |
| step1.3  | `step1.3/implementation.md`                                                               | Core admin modules: Clients, Projects, Tasks, TimeEntries, Invoices                                                                   |
| step1.3  | `step1.3/extensions.md`                                                                   | User admin panel, GraphQL pagination, audit log coverage, Shadcn Select migration                                                     |
| step1.5  | `step1.5/implementation.md`                                                               | Dashboard real data, GraphQL subscriptions (real-time timer), invoice PDF enhancements                                                |
| step1.4  | `step1.4/hubspot-integration.md`                                                          | HubSpot OAuth, CRM proxy, webhooks, audit log, admin controls                                                                         |
| step1.4  | `step1.4/step1.4-remaining.md`                                                            | HubSpot company writes, audit log module, admin connection controls                                                                   |
| step1.4b | `step1.4b/clockify-integration.md`                                                        | Clockify REST proxy, time tracking, encryption                                                                                        |
| step1.6  | `step1.6/clockify-import-hubspot-sync.md`                                                 | #35 Clockify → TTC import + #36 HubSpot contact → TTC client sync                                                                     |
| step1.6  | `step1.6/invoice-pdf-multipage-logo.md`                                                   | #32 PDF multi-page + #33 invoice logo (frontend: EditProfilePage + InvoiceDetailPage)                                                 |
| step1.8  | `step1.8/env-validation-confirm-dialogs-audit-pagination-clockify-disconnect.md`          | #46 env validation + #51 confirm dialogs + #52 (already done) + #53 audit pagination + #54 clockify disconnect                        |
| step1.9  | `step1.9/task-assignee-due-date-client-activity-hubspot-search-text-search.md`            | #47 task assignee + #48 due date kanban + #49 client invoices + #50 HubSpot search + #55 text search                                  |
| step1.10 | `step1.10/task-edit-clockify-disconnect-client-activity-invoice-search-env-validation.md` | #56 task inline edit + #57 delete confirm + #58 Clockify confirm + #59 client time entries + #60 invoice search + #61 env min lengths |
| step1.11 | `step1.11/rates.md`                                                                       | #62 Rates management: HOURLY / PER_WORD / FIXED — full CRUD + overview                                                                |
| step1.16 | `step1.16/qa-and-ux-fixes.md`                                                             | #75 ProtectedRoute oauth_from Concurrent Mode fix + #76 ClockifyTab workspace picker + #77 Prisma P2025                               |
| step1.17 | `step1.17/contact-inline-edit.md`                                                         | #67 CompanyContact inline edit — `✎` button + inline 2×2 form per row                                                                 |
| step1.18 | `step1.18/clockify-rates-tracker-ux.md`                                                   | #78–84 Rates cache fix, Overview CRUD, Clockify desc edit, billable plan detection + allowlist, plan badge                            |
| step1.20 | `step1.20/security-fixes-97-103.md`                                                       | #103 TOTP backup codes: TwoFactorSetupPage shows codes post-enable, TwoFactorVerifyPage adds backup code mode                         |

Plans live in `../../docs/plans/`:

| Step     | File                                     | Contents                                                                             |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| step1.2  | `step1.2/AUTH-PLAN.md`                   | Auth system design                                                                   |
| step1.2  | `step1.2/auth-remaining.md`              | Plan for auth follow-up items                                                        |
| step1.3  | `step1.3/plan.md`                        | Core admin modules plan                                                              |
| step1.4  | `step1.4/hubspot-integration.md`         | HubSpot integration design                                                           |
| step1.4  | `step1.4/hubspot-upgrades.md`            | HubSpot security, retry, refresh lock, webhook upgrades                              |
| step1.4  | `step1.4/step1.4.md`                     | HubSpot company writes, audit log, admin sync controls plan                          |
| step1.4b | `step1.4b/clockify-integration.md`       | Clockify integration design                                                          |
| step1.6  | `step1.6/ws-subscription-auth.md`        | #29 WebSocket subscription auth plan                                                 |
| step1.6  | `step1.6/forgot-password.md`             | #31 Forgot password / email reset plan                                               |
| step1.6  | `step1.6/rate-limiting.md`               | #34 NestJS throttler rate limiting plan                                              |
| step1.6  | `step1.6/clockify-import.md`             | #35 Clockify → TTC time entry import plan                                            |
| step1.6  | `step1.6/hubspot-client-sync.md`         | #36 HubSpot contact → TTC client sync plan                                           |
| step1.8  | `step1.8/confirm-dialogs.md`             | #51 Confirm dialog for destructive deletes plan                                      |
| step1.8  | `step1.8/audit-pagination.md`            | #53 Audit log cursor pagination plan                                                 |
| step1.8  | `step1.8/clockify-disconnect.md`         | #54 Clockify disconnect plan                                                         |
| step1.9  | `step1.9/gaps-improvements.md`           | #47-50, #55 gaps and improvements plan                                               |
| step1.10 | `step1.10/gaps-improvements.md`          | #56-61 gaps and improvements plan                                                    |
| step1.11 | `step1.11/rates.md`                      | #62 Rates management plan                                                            |
| step1.12 | `step1.12/clients-company-contact.md`    | #63 Client as Company + Contact person plan                                          |
| step1.12 | `step1.12/company-contact-separation.md` | #64 CompanyContact as separate model (many contacts/client)                          |
| step1.16 | `step1.16/qa-and-ux-fixes.md`            | #75 ProtectedRoute oauth_from Concurrent Mode fix + #76 ClockifyTab workspace picker |
| step1.17 | `step1.17/contact-inline-edit.md`        | #67 CompanyContact inline edit — `✎` button + inline 2×2 form per row                |

## Auth Hooks (`src/hooks/useAuth.ts`)

| Hook                         | Description                                                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCurrentUser()`           | Returns `{ user, loading, isAuthenticated }`. Polls `me` every 60 s (`pollInterval: 60_000`). `errorPolicy: 'ignore'` — auth errors are handled by the Apollo `onError` link which redirects to `/login`. |
| `useLogin()`                 | Returns `{ login(email, password), loading, error }`. Check `data.login.requiresTwoFactor` to detect 2FA flow.                                                                                            |
| `useRegister()`              | Returns `{ register(email, password, name?), loading, error }`.                                                                                                                                           |
| `useLogout()`                | Calls logout mutation + clears Apollo cache + writes `ttc_logout` timestamp to localStorage (triggers cross-tab logout via `storage` event).                                                              |
| `useUpdateMe()`              | Returns `{ updateMe({ name?, email? }), loading, error }`. Updates current user; refetches `me` query.                                                                                                    |
| `useSetupTwoFactor()`        | Returns QR code URL and base32 secret for display.                                                                                                                                                        |
| `useEnableTwoFactor()`       | Confirms 2FA setup with TOTP code. Returns `{ backupCodes: string[] \| null }` — 8 one-time recovery codes, only available immediately after enable.                                                      |
| `useVerifyTwoFactor()`       | Completes login when 2FA is required — pass `tempToken` from login response + user TOTP code.                                                                                                             |
| `useVerifyTwoFactorBackup()` | Completes login using a backup code — pass `tempToken` + one unused backup code. Used in `TwoFactorVerifyPage` backup mode.                                                                               |
| `useDisableTwoFactor()`      | Disables 2FA — sends TOTP code for verification; refetches `me` on success.                                                                                                                               |
| `useRequestPasswordReset()`  | Returns `{ requestReset(email), loading }`. Calls `requestPasswordReset` mutation. Always succeeds (server never reveals if email exists).                                                                |
| `useResetPassword()`         | Returns `{ resetPassword(token, newPassword), loading }`. Calls `resetPassword` mutation. Throws `BadRequestException` on invalid/expired token.                                                          |

## Clockify Hooks (`src/hooks/useClockify.ts`)

All hooks use TanStack Query against the backend REST endpoints at `/clockify/*`.

| Hook                                            | Type                                            | Endpoint                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `useClockifyStatus()`                           | query                                           | `GET /clockify/status` → `{ connected, workspaceId }`                                                        |
| `useSetClockifyCredentials()`                   | mutation                                        | `POST /clockify/credentials` — validates key via Clockify then saves                                         |
| `useDisconnectClockify()`                       | mutation                                        | `DELETE /clockify/credentials` — clears all Clockify fields; invalidates `["clockify"]`                      |
| `useSetClockifyWorkspace()`                     | mutation                                        | `PATCH /clockify/workspace` — updates workspace pref without re-validating key                               |
| `useClockifyWorkspaces()`                       | query                                           | `GET /clockify/workspaces`                                                                                   |
| `useClockifyProjects(workspaceId)`              | query                                           | `GET /clockify/workspaces/:id/projects`                                                                      |
| `useClockifyEntries(workspaceId, start?, end?)` | query                                           | `GET /clockify/workspaces/:id/entries`                                                                       |
| `useClockifyActiveEntry(workspaceId)`           | query, refetchInterval: 10s (stops only on 401) | `GET /clockify/workspaces/:id/entries/active`                                                                |
| `useStartEntry(workspaceId)`                    | mutation                                        | `POST /clockify/workspaces/:id/entries`                                                                      |
| `useStopEntry(workspaceId)`                     | mutation, no args                               | `PATCH /clockify/workspaces/:id/entries/stop` — stops running timer                                          |
| `useDeleteEntry(workspaceId)`                   | mutation                                        | `DELETE /clockify/workspaces/:id/entries/:eid`                                                               |
| `useClockifyTags(workspaceId)`                  | query                                           | `GET /clockify/workspaces/:id/tags`                                                                          |
| `useCreateTag(workspaceId)`                     | mutation                                        | `POST /clockify/workspaces/:id/tags` — creates tag in Clockify workspace                                     |
| `useUpdateEntry(workspaceId)`                   | mutation                                        | `PATCH /clockify/workspaces/:id/entries/:eid` — full entry update (PUT to CW)                                |
| `useImportClockifyEntries(workspaceId)`         | mutation                                        | `POST /clockify/workspaces/:id/entries/import` — `{ start, end }` ISO range; returns `{ imported, skipped }` |

`QueryClientProvider` is wired in `main.tsx` alongside `ApolloProvider`.

## HubSpot Hooks (`src/hooks/useHubspot.ts`)

All hooks use TanStack Query against the backend REST endpoints at `/hubspot/*`.

| Hook                                  | Type                                  | Endpoint                                                                                                |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `useHubspotStatus()`                  | query                                 | `GET /hubspot/status` → `{ connected, portalId }`                                                       |
| `useDisconnectHubspot()`              | mutation                              | `DELETE /hubspot/disconnect`                                                                            |
| `useInfiniteHubspotContacts(limit?)`  | infinite query                        | `GET /hubspot/contacts?limit=&after=` — pages via `paging.next.after`                                   |
| `useInfiniteHubspotCompanies(limit?)` | infinite query                        | `GET /hubspot/companies?limit=&after=`                                                                  |
| `useInfiniteHubspotDeals(limit?)`     | infinite query                        | `GET /hubspot/deals?limit=&after=`                                                                      |
| `useSearchHubspotContacts(query)`     | query, `enabled` when query non-empty | `POST /hubspot/contacts/search` — `CONTAINS_TOKEN` filter across email/firstname/lastname               |
| `useCreateContact()`                  | mutation                              | `POST /hubspot/contacts`                                                                                |
| `useUpdateContact()`                  | mutation                              | `PATCH /hubspot/contacts/:id`                                                                           |
| `useCreateDeal()`                     | mutation                              | `POST /hubspot/deals`                                                                                   |
| `useUpdateDeal()`                     | mutation                              | `PATCH /hubspot/deals/:id`                                                                              |
| `useCreateCompany()`                  | mutation                              | `POST /hubspot/companies`                                                                               |
| `useUpdateCompany()`                  | mutation                              | `PATCH /hubspot/companies/:id`                                                                          |
| `useAuditLog(userId?, limit?)`        | query (ADMIN)                         | `GET /admin/audit?userId=&limit=` — last N audit entries, ordered newest-first                          |
| `useHubspotAdminConnections()`        | query (ADMIN)                         | `GET /hubspot/admin/connections` — all users + HubSpot status                                           |
| `useForceDisconnectHubspot()`         | mutation (ADMIN)                      | `DELETE /hubspot/admin/connections/:userId` — admin force-disconnect                                    |
| `useImportHubspotContact()`           | mutation                              | `POST /hubspot/contacts/:id/import-client` — imports contact as TTC Client; invalidates `clients` cache |

**Key rules:**

- All three list tabs use `useInfiniteQuery`. Flatten results with `data.pages.flatMap(p => p.results)`. "Load more" button appears when `hasNextPage`.
- `ContactsTab` has a search input that debounces 300 ms (`useEffect` + `setTimeout`). When `debouncedSearch` is non-empty, renders search results from `useSearchHubspotContacts`; otherwise renders infinite list. "Load more" is hidden while searching.
- The plain-`useQuery` `useHubspotContacts/Companies/Deals` hooks were removed (dead code, zero callers) — only the infinite variants (`useInfiniteHubspotContacts/Companies/Deals`) are used, in `HubspotPage`.

## Users Hooks (`src/hooks/useUsers.ts`)

Admin-only hooks. All use Apollo `useQuery`/`useMutation` with `refetchQueries: [USERS_QUERY]` on mutations.

| Hook              | Returns                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `useUsers()`      | `{ users: User[], loading, error }`                                   |
| `useUpdateUser()` | `{ updateUser(input: { id, role?, name?, email? }), loading, error }` |
| `useDeleteUser()` | `{ deleteUser(id: number), loading, error }`                          |

**Key rules:**

- `User.role` values: `'ADMIN' | 'MANAGER' | 'USER'` (exported as `UserRole` type from `users.operations.ts`).
- Delete button must be disabled when `user.id === currentUser.id` — backend does not guard self-delete; frontend prevents accidental lockout.
- No confirm dialog for role change — reversible; inline `Select` is sufficient.
