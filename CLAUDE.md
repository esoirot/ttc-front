# CLAUDE.md — ttc-front

React 19 SPA. Backend: `../the-translator-companion` (its own `CLAUDE.md`). Workspace map: `../CLAUDE.md`.

## Working rules

- Never start or stop the dev server (`pnpm run dev`); the operator runs it. Don't verify against it unless asked — use tests.
- **Admin is out of scope** until the operator says otherwise: ignore `src/{components,hooks,pages}/admin/`, `src/graphql/admin.operations.ts`, `/admin*` routes — no audit, fix, refactor or restyle, and leave admin findings out of reports. Shared code they consume (`src/components/ui/*`, `useBulkSelection`…) may still change for non-admin reasons.
- Always **pnpm**, never npm/yarn.

## Workflow and done checklist

Test-first (BDD-style titles), then code. A change is done when:

1. Failing test written first (Vitest unit; Playwright in `e2e/` for user-facing flows), then passing.
2. Every touched component has an up-to-date `<name>.stories.tsx` (new component, variant, size or prop) — see **Storybook**.
3. New user-facing text is in `en.ts` **and** `fr.ts` — see **i18n**.
4. Targeted tests pass.
5. `pnpm run check` passes (`scripts/check.mjs`): typecheck, circular, depcheck, prune, format, lint (no fix — fails), audit (known findings ignored in `pnpm-workspace.yaml`, see README), unit, stories, build, e2e, then mutation on the lines changed since `origin/main` (`scripts/mutate-changed.mjs`), which ends by listing the surviving mutants on those lines only. Add a test only for a survivor that guards real behaviour. Skip steps with `--skip a,b` (`--list` for names) — say which steps you skipped and why.

## Commands

```bash
pnpm test                         # all Vitest tests (unit + stories)
pnpm exec vitest run --project='!storybook' <path>   # unit tests for a file/dir (the unit project has no name: --project=unit fails)
pnpm exec vitest run --project=storybook <dir>       # story render tests for a dir
pnpm run test:e2e [e2e/<spec>]    # Playwright (headless; :ui / :headed variants)
pnpm run test:mutation:changed    # Stryker on lines changed since origin/main (part of check)
pnpm run test:mutation --mutate "<file>:<from>-<to>,…" --incremental   # by hand
pnpm run check [--skip a,b] [--list]   # full gate (see checklist)
pnpm run typecheck | lint | format | format:check | circular | depcheck | prune
pnpm run build | preview | storybook | build-storybook
```

- Mutation results: Stryker's console table mixes whole files and earlier runs (`reports/stryker-incremental.json`) — trust the `Changed lines:` summary of `test:mutation:changed`, or filter that JSON by file and `location.start.line`.
- E2E mocks all network traffic with `page.route()` (no backend); helpers in `e2e/helpers/mock.ts` (`mockGraphQL`, `mockClockifyStatus`, `mockClockifyTracker`…).
- `.env`: `VITE_API_URL=http://localhost:3000/graphql`.

## Where things live

One folder per domain (`auth`, `account`, `clients`, `projects`, `tasks`, `time`, `invoices`, `rates`, `rate-sheets`, `occupations`, `tags`, `integrations`/`clockify`/`hubspot`, `dashboard`). Path alias `@/*` → `src/*` for cross-folder imports; relative for siblings.

| What               | Path                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| GraphQL operations | `src/graphql/<domain>.operations.ts` (fields constants like `CLIENT_FIELDS` at the top)                              |
| Types              | `src/types/<domain>.types.ts` (entity, inputs, component props)                                                      |
| Hooks              | `src/hooks/<domain>/use*.ts` — data hooks (`useClients.ts`) and form/page hooks (`useClientHeaderForm.ts`)           |
| Components         | `src/components/<domain>/<role>/` — `forms/`, `headers/`, `rows/`, `cards/`, `tabs/`, `lists/`, `modals/`…           |
| Pages              | `src/pages/<domain>/*Page.tsx` (thin, compose components)                                                            |
| Constants          | `src/constants/<domain>.ts` (status orders, label messages, empty forms)                                             |
| Shared lib         | `src/lib/` — `apollo`, `api`, `gqlQuery`, `gqlMutation`, `cachePatch`, `cacheDeps`, `navigation`, `schemas`, `utils` |
| UI primitives      | `src/components/ui/` (Shadcn)                                                                                        |
| i18n               | `src/i18n/messages/{en,fr}.ts`                                                                                       |
| Test helpers       | `src/test/` — `queryClientWrapper.tsx`, `intlWrapper.tsx`, `authUserFixture.ts`, `fakeEventSource.ts`                |

## Data layer

- **TanStack Query v5 is the only reactive cache**, for GraphQL and REST. Every hook in `src/hooks/**` wraps `useQuery`/`useInfiniteQuery`/`useMutation`. **Apollo Client v4 is transport only**: `gqlFetch`/`gqlMutate` (`src/lib/apollo.ts`), the 401-refresh `ErrorLink`, and `TypedDocumentNode`/`gql` typing. No `ApolloProvider`, no Apollo React hooks; `InMemoryCache` is never read.
- **GraphQL hooks**: reads with `useGqlQuery`/`useGqlConnectionQuery` (`src/lib/gqlQuery.ts`), writes with `useGqlMutation` (`src/lib/gqlMutation.ts`). Never hand-build one or call `fetch`/`apolloClient` from a component.
- **Lists**: `useGqlConnectionQuery` (cursor `useInfiniteQuery`); backend returns `{ items, nextCursor, total }`; hooks expose `{ <items>, total, hasMore, loadMore, loading, error }`. A filter = query variable + entry in the cache key `[root, { ...filters }]`. `useAll*` (limit 1000) only for id→name lookups.
- **Cache after a mutation — `reloadWhereShown`** (`src/lib/cacheDeps.ts`): a mutation hook (1) patches/removes the returned item where already cached (`src/lib/cachePatch.ts`: `patchFlatArray`/`patchConnection`/`patchNestedField`, `removeFrom*`/`appendTo*`), (2) sets its detail cache, (3) calls `reloadWhereShown(qc, "<entity>")`, which invalidates every root in `SHOWN_IN` holding a copy of that entity (lists, detail pages, other domains copying its name/totals — e.g. task titles in time entries, prospects on the dashboard). The server re-applies filters, sort and totals. A page that starts showing an entity's data adds its root to `SHOWN_IN` — never a hand-written `invalidateQueries` in a hook or component. Callers never `refetch()` after a mutation.
- **Pickers**: client/project/task dropdowns use `ClientPicker`/`ProjectPicker`/`TaskPicker` (`SearchSelect` + `useSearchSelectState`): load on open, 20 at a time, server `search`; selected name via `useClient`/`useProject`/`useTask`. Never build them from `useAll*`.
- **REST**: `apiGet`/`apiPost`/`apiPatch`/`apiDelete` (`src/lib/api.ts`), `credentials: 'include'`, typed `ApiError`, base URL = `VITE_API_URL` minus `/graphql`. On 401 they fire `refreshToken` and retry once, else throw `ApiError(401)`. `Content-Type` only when there's a body. Binary: `{ responseType: 'blob' }` (invoice PDF). Wrap in TanStack hooks in `src/hooks/<domain>/`.
- **401 refresh (GraphQL)**: `ErrorLink` first in `ApolloLink.from([errorLink, httpLink])`; on `UNAUTHENTICATED` (`CombinedGraphQLErrors.is`) or HTTP 401 (`ServerError.is`) outside public paths → `tryRefresh()` then `forward(operation)` via `Observable`; refresh fails → `replaceLocation('/login')`.
- **No WebSockets/subscriptions**: the running timer comes by SSE (`src/hooks/time/useTimerSSE.ts`, `EventSource(BASE_URL + '/timer/events', { withCredentials: true })`) → `setQueryData(["activeTimer"], …)`.
- **GraphQL types must match the schema exactly**: NestJS emits `[Int!]` for `[Int]` fields/args; declare `$projectIds: [Int!]`, not `[Int]` — a mismatch makes the server reject the operation with HTTP 400 even when the variable is unused. Check `../the-translator-companion/src/schema.gql` (committed, regenerated when the backend starts — confirm in the resolver's `@Field`/`@Args` if the backend has uncommitted changes).
- **Apollo v4 imports** (wrong subpackage = runtime missing-export error): `ApolloClient`, `InMemoryCache`, `HttpLink`, `ApolloLink`, `gql`, `TypedDocumentNode` from `@apollo/client/core`; `ErrorLink` from `@apollo/client/link/error`; `CombinedGraphQLErrors`, `ServerError` from `@apollo/client/errors`; `Observable` from `@apollo/client/utilities`. Use `ApolloLink.from(...)` and `new ErrorLink(handler)` (`from()`/`onError()` are deprecated); the handler receives `{ error, result, operation, forward }`.

## Adding a field to an entity

Backend first (Prisma schema + migration, GraphQL type + create/update inputs), then mirror the `schema.gql` type. Frontend:

1. **Selection** — add it to the entity's fields constant; every list/detail/create/update operation shares it, so every cache gets it:

   | Entity     | Fields constant                                         | Types                                                                                                   | Edit form (fill → save)                                                                | Create form                                                                                |
   | ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
   | Client     | `CLIENT_FIELDS` (`clients.operations.ts`)               | `Client`, `ClientInput`, `ClientHeaderFormState` (`clients.types.ts`)                                   | `useClientHeaderForm.ts` `formFromClient` → `handleSave`; inputs in `ClientHeader.tsx` | `useNewClientForm.ts` + `EMPTY_CLIENT_FORM` (`constants/clients.ts`) + `NewClientForm.tsx` |
   | Project    | `PROJECT_FIELDS` (`projects.operations.ts`)             | `Project`, `ProjectInput`, `ProjectHeaderProps.onUpdate` (`projects.types.ts`)                          | `ProjectHeader.tsx` `buildFormState` → `handleSave`                                    | `CreateProjectForm.tsx`                                                                    |
   | Task       | `TASK_FIELDS` (`tasks.operations.ts`)                   | `Task`/`TaskDetail`, `CreateTaskInput`, `UpdateTaskInput` (`tasks.types.ts`)                            | `TaskDetailModal.tsx`                                                                  | `ProjectTaskList.tsx` (title only)                                                         |
   | Time entry | `TE_FIELDS` (`time-entries.operations.ts`)              | `TimeEntry`, `UpdateTimeEntryInput` (`time-entries.types.ts`); create input type in `useTimeEntries.ts` | `TtcEntryRow.tsx` (inline)                                                             | `ManualEntryForm.tsx`, `TimerStartInput.tsx` (start timer)                                 |
   | Invoice    | `INV_FIELDS` / `ITEM_FIELDS` (`invoices.operations.ts`) | `Invoice`, `InvoiceItem` (`invoices.types.ts`); input types inline in `useInvoices.ts`                  | `useInvoiceMetaEdit.ts` → `InvoiceMetaCard.tsx`                                        | `CreateInvoiceForm.tsx`, `GenerateInvoiceForm.tsx`                                         |

2. **Types**, **form** (fill from the entity; on save empty → `null`, text → number), **i18n** label, any **display** (cards, overview tabs), **stories**, tests.
3. **Cache: nothing to do.** Touch `SHOWN_IN` only when another domain's query starts copying the field (e.g. time entries select `project { foo }` → add `"timeEntries"` to the `project` row). A new list filter needs only its query variable and cache-key entry.

## UI

- **Shadcn + Tailwind only**: every element is a Shadcn component from `@/components/ui/<name>` (see the folder for what exists) styled with Tailwind. No raw `<button>`/`<input>`/`<label>`/`<select>`, no hand-rolled card/badge/tab/skeleton, no inline `style={}`, no CSS beyond `src/index.css`. Missing component → `pnpm dlx shadcn@latest add <name> --yes`, then check the files landed in `src/components/ui/` (if a literal `@/` folder appears at the root, move them and remove it).
- **Semantic color tokens only** (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-muted`, `bg-card`, `bg-accent`, `border-border`, `text-destructive`…, defined in `src/index.css` via `@theme inline` + `:root`/`.dark`). Never palette classes (`zinc-*`, `slate-*`, `gray-*`…) for structure; named colors only where no token exists (`text-emerald-600` success, `text-amber-500` warning). Conditional classes with `cn()` (`@/lib/utils`).
- `button.tsx` exports `Button` + `buttonVariants` with `// eslint-disable-next-line react-refresh/only-export-components` — keep it, don't split the file.
- **Pages**: full width `w-full px-8 py-8`, no `max-w-*`/`mx-auto`, no custom header/back button (the sidebar navigates).
- **KPIs**: `KpiGrid` + `KpiCard` (`src/components/kpi/KpiCard.tsx`, fixed 14rem cards), numbers through `CompactNumber` (full below 1,000,000, then 8.2M/10B/1T with the full value in `title`). Dashboard tabs: KPIs, then `MonthSelector`, then charts in a wrapping row.
- **Sidebar** (`Sidebar.tsx`) owns user display, role badge, sign-out, theme toggle; username block links to `/profile/edit`. `<NavLink end>` on `/`. Top bar on mobile, `sm:flex-col sm:w-56` sticky from 640px.
- **Dark mode**: class-based (`@custom-variant dark (&:is(.dark *))`), `dark:` variants; `useTheme()` (`src/hooks/useTheme.ts`, `useSyncExternalStore`, no Provider), stored in `localStorage["ttc_theme"]`; inline script in `index.html` sets `.dark` before first paint.
- **Destructive actions** go through `AlertDialog`; `stopPropagation` on triggers inside clickable cards.

## React and TypeScript

- **React Compiler** (via `@rolldown/plugin-babel` in `vite.config.ts` — Babel plugins go there, not `.babelrc`): no manual `useMemo`/`useCallback`/`memo`; keep components and hooks pure.
- No synchronous `setState` in `useEffect` bodies; no reading `ref.current` during render (`react-hooks/refs`).
- Live timers: keep the display string in state and set it inside `setInterval(() => setDisplay(format(startIso)), 1000)`. A tick counter + compute-in-render freezes (the compiler memoizes `format(startIso)`).
- Type-only imports where the module has no runtime value: `import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'` (a value import breaks Vite).
- **TypeScript 6**: strict; `erasableSyntaxOnly` bans constructor parameter properties (declare fields explicitly); no `baseUrl`, `paths` only.

## Routing and auth

- `App.tsx` (`createBrowserRouter`). Public: `/login`, `/register`, `/2fa/verify` (`tempToken` in router state), `/forgot-password`, `/reset-password` (`?token=`). Protected (`ProtectedRoute → AppLayout → page`): `/`, `/profile/edit`, `/settings/2fa`, `/clients`, `/clients/:id`, `/prospects`, `/projects`, `/projects/:id`, `/time`, `/invoices`, `/invoices/:id`, `/rates`, `/occupations`, `/occupations/:id`, `/time-tracker` (`ClockifyPage`), `/hubspot`, `/google-calendar`; `/admin/*` (out of scope, backend returns 403 to non-admins). Unknown → `/`. A new protected page is a child of `AppLayout`. Pages load on first visit, each in its own chunk: `{ path, ...page(() => import("./pages/<domain>/XPage"), "XPage") }` — never a static page import in `App.tsx`. Vendor chunks in `vite.config.ts` `manualChunks` match the package name, never a substring of the module id (pnpm folder names list peer deps).
- `RouteErrorPage` is the `errorElement` on a pathless route around every `AppLayout` page (sidebar kept) and on the root.
- Session = the `me` query (HTTP-only cookies, no tokens in JS). `useCurrentUser()` refetches every 60 s; a 401 on `me` never redirects. Public paths are defined once by `isPublicPath()` (`src/lib/navigation.ts`).
- **Never touch `window.location`** — use `redirectTo`/`replaceLocation`/`currentPathname` (`src/lib/navigation.ts`).
- `ProtectedRoute` sends `state={{ from: pathname + search }}` to `/login`; `LoginForm` returns there; `TwoFactorVerifyForm` threads `from` through.
- Google OAuth is a full-page redirect. `GoogleOAuthButton` stores `sessionStorage.oauth_from = JSON.stringify({ dest, ts })`; `ProtectedRoute`/`LoginForm` accept it within 60 s. `ProtectedRoute` reads it in render, removes it in `useEffect`, and skips `<Navigate>` when `dest` is the current path (same-URL navigate → white screen).
- Logout: `useLogout` clears the TanStack cache and Apollo's store, writes `localStorage.ttc_logout` → `RootLayout` (`App.tsx`, inside the router) logs out other tabs via the `storage` event.

## Testing conventions

- Hook tests: `renderHook(..., { wrapper: createQueryWrapper(queryClient) })`, `createQueryClient()` (`src/test/queryClientWrapper.tsx`). Mock the transport, not the hooks: `const { gqlFetch, gqlMutate } = vi.hoisted(() => ({ gqlFetch: vi.fn(), gqlMutate: vi.fn() })); vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }))` (REST: mock `@/lib/api`). Data from local `make<Entity>(overrides)` factories.
- Cache assertions: seed with `setQueryData`, check `getQueryData` (instant patch) and reloads with `vi.spyOn(queryClient, "invalidateQueries")` → `toHaveBeenCalledWith({ queryKey: ["<root>"] })` or `getQueryState(key)?.isInvalidated`.
- `react-intl` components render in `createIntlWrapper(locale)` (`src/test/intlWrapper.tsx`).
- Unit tests run in Vitest's `vmThreads` pool (`vitest.unit.ts`): `window.location` can't be redefined → `vi.mock("@/lib/navigation")`. Never add a library that any test `vi.mock()`s (`react-router-dom`, `recharts`, `@dnd-kit/core`…) to `deps.optimizer.client.include` there — the mock stops applying.

## Storybook

Every component in `src/components/ui/` has a story next to it; components above get one when built or touched. `.storybook/preview.tsx` imports `src/index.css` (needed for Tailwind) — keep it. Patterns: **variant-driven** (`button.stories.tsx`: `args` per prop/variant) or **composed** (`dialog.stories.tsx`: one `render: () => (...)` composition). Decorators: `QueryClientProvider` for TanStack hooks (`TtcTagChips.stories.tsx`), `MemoryRouter` for router hooks (`LoginPage.stories.tsx`). No network mocking: a component with an ungated query on mount (`useCurrentUser()`) shows its loading/error state — accepted.

`title` prefix = Atomic Design layer (drives the sidebar; never `"ui/..."`):

| Layer     | Prefix        | What                                                                                                                                                                                                       | Example                                   |
| --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Atoms     | `Atoms/*`     | `src/components/ui/` primitive exporting **one** component                                                                                                                                                 | `Atoms/Button`, `Atoms/Input`             |
| Molecules | `Molecules/*` | `src/components/ui/` primitive exporting **several** parts (`Card`/`CardHeader`…, `Dialog`, `Select`, `Tabs`, `Table`, `AlertDialog`…); or a feature unit of 2+ atoms with at most one self-contained hook | `Molecules/Card`, `Molecules/TtcTagChips` |
| Organisms | `Organisms/*` | Feature row/section/panel with domain types and mutation callbacks (never a `ui/` primitive)                                                                                                               | `Organisms/TtcEntryRow`                   |
| Templates | `Templates/*` | Layout shell with a `children` slot, no data                                                                                                                                                               | `Templates/AuthLayout`                    |
| Pages     | `Pages/*`     | `src/pages/**/*Page.tsx`                                                                                                                                                                                   | `Pages/LoginPage`                         |

## i18n

Every user-facing string goes through `react-intl` (`<FormattedMessage id defaultMessage />` / `intl.formatMessage`), ids namespaced by domain (`clients.header.field.website`). Add the key to **both** `src/i18n/messages/en.ts` and `fr.ts`, English identical to the inline `defaultMessage` — `src/i18n/messages.test.ts` fails otherwise.

## Principles

- **Lean** — only what the task needs; delete dead code, unused exports and commented-out blocks on sight; prefer the smaller fix that removes the failure mode.
- **KISS** — `gqlQuery`/`gqlMutation`/`cachePatch` are small composable functions, not a config-driven factory; a hook with bespoke cache logic (`useMoveTask`'s optimistic move + rollback) keeps it hand-written using the shared pieces.
- **DRY** — extract on the second duplication, not before.
- **SOLID** — one job per hook/component (fetch XOR cache XOR business logic XOR presentation); same-shape hooks are interchangeable; slim option objects (`{ mutation, unwrap, onSuccess? }`); depend on the hook layer, never raw `fetch`/Apollo in components.
- **DDD** — `src/{hooks,components,pages}/<domain>/` mirror domains; cross-domain access through the other domain's hooks (`useClientDetail` composes `useProjects`/`useInvoices`/`useTimeEntries`), never its operations.
- **Occupation vs Activity** — `Occupation` (`occupations/`, `/occupations`, `occupations.*` keys) is the user's business line (formerly "Activity"). "Activity" means history only (`TaskActivity`, `TaskActivityFeed`, `ActivityTab`s, admin activity log). Never reuse an `occupations.*` key for history.

## Feature rules (non-obvious)

- **Dashboard deadlines / prospects**: `UrgencyIcon` (`src/components/dashboard/UrgencyIcon.tsx`, `due: string | null`, null = red): past red, ≤ 7 days amber, later green. Rows link to `/projects/:id?task=:taskId`; `ProjectDetail` opens that task's modal and drops `?task=` on close.
- **Words**: time entries carry no words. Task total = `taskWordTotal` (`src/lib/words.ts`): task words + checklist items with `countInTotal`. Project totals read `project.totalTaskWords`.
- **Tasks**: no assignee (removed 2026-10-08). `TaskColorField` wraps the client `ColorField`; swatch in `SortableRow`, not on kanban cards. Kanban drops call `useMoveTask` (`{ id, status, position }`, optimistic, rollback on error, reload after — the server renumbers). Activity tab: `useProjectActivities` (20/page); only `TASK_QUERY` selects activities.
- **Clients list**: always `status: CLIENT`; Companies/All filter `companyName`, Individuals `lastName`/`firstName` (sorted by last name); trimmed, debounced 300 ms, cleared on tab change; `SortControls` (`src/components/sort/`) shared with tasks and contacts. Contacts tab sorts in memory (`sortContacts`, `Intl.Collator` base, empty names last).
- **Prospects**: `/prospects` board = every status except `CLIENT`, `FORMER_CLIENT` first. A newer Contacted At moves the status one step (server); the edit form previews it with `NEXT_STATUS_AFTER_CONTACT` (`src/constants/clients.ts`, mirrors the server). No Follow up 3 (`RETIRED_STATUS_LABEL_MESSAGES` keeps old history labels).
- **URLs** (client website/LinkedIn, contact LinkedIn): `isValidHttpUrl` (error after blur or on save), links only through `toSafeHref` (`src/lib/schemas.ts`).
- **Invoices**: `GenerateInvoiceForm` shows server refusals ("Nothing to invoice") in a destructive `Alert` and stays open.
- **`Project.unitPrice` is legacy** — pricing is `fixedFee`/`hourlyRate`/`perWordRate`.
- Not implemented: Microsoft OAuth. Password-reset emails need `SMTP_HOST` on the backend (else the URL is logged).

## Integrations (`/time-tracker` Clockify, `/hubspot`, `/google-calendar`)

REST hooks in `src/hooks/integrations/` invalidate their whole `["clockify"]`/`["hubspot"]`/`["google-calendar"]` area after a mutation; Clockify import → `reloadWhereShown(qc, "timeEntry")`.

- `useClockifyActiveEntry` stops polling only on `ApiError` 401; other errors keep the 10 s interval.
- Billable toggle locked unless the workspace plan is in `PAID_CLOCKIFY_PLANS` (FREE → HTTP 400).
- `TagChips` (`src/components/clockify/tags/`): items use `onMouseDown`, not `onClick` (must fire before the 150 ms `onBlur` close). `workspaceId` threads `TrackerView → DayGroup → EntryRow → TagChips` and `ActiveTimer → TagChips`.
- `EntryRow.patch()` always sends a full `UpdateEntryInput` (`start`, `billable`, `tagIds`) — Clockify's PUT rejects partial bodies.
- `groupByDescription` (`src/components/clockify/helpers.ts`) keys by `desc || projectId || "__no_desc__"`; display `group[0].description`, never the key.
- HubSpot lists: `useInfiniteQuery`, flatten `pages.flatMap(p => p.results)`; tabs debounce search 300 ms and hide "Load more" while searching.

## Docs

Old layout, hook tables and finished-work history: `../docs/implementations/ttc-front-history.md`. Logs: `../docs/implementations/step*/`. Plans: `../docs/plans/`.
