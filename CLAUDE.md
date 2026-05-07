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
```

Always use **pnpm** — never npm or yarn.

No test runner is configured yet.

## Stack

- **React 19** with **React Compiler** enabled — do not add manual `useMemo`/`useCallback`/`memo` wrappers; the compiler handles memoization automatically.
- **Apollo Client v4** (`@apollo/client`) for all GraphQL communication with the backend. Configured with `credentials: 'include'` for HTTP-only cookie auth. v4 splits into subpackages — see import rules below.
- **TanStack Query v5** (`@tanstack/react-query`) — used for all **REST** API calls (Clockify, any future non-GraphQL endpoints). Do not use TanStack Query for GraphQL calls.
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js` needed. Import is `@import "tailwindcss"` in `index.css`. All styling is done with inline Tailwind utility classes; there is no custom CSS.
- **Vite 8** bundler with `@rolldown/plugin-babel` wiring the React Compiler Babel preset.
- **TypeScript 6** — strict mode via `tsconfig.app.json`.

## Environment

`.env` at the project root:

```
VITE_API_URL=http://localhost:3000/graphql
```

## Architecture

**GraphQL client**: `src/lib/apollo.ts` exports a single `apolloClient` instance. `ApolloProvider` wraps the app in `main.tsx`. All GraphQL operations go through Apollo — do not use `fetch` or TanStack Query for GraphQL calls.

**REST client**: `src/lib/api.ts` exports `apiGet`, `apiPost`, `apiPatch`, `apiDelete` — thin `fetch` wrappers with `credentials: 'include'` and typed error (`ApiError`). Base URL derived from `VITE_API_URL` by stripping `/graphql`. Use these for all REST endpoints; wrap them in TanStack Query hooks in `src/hooks/`.

**Auth state**: determined by the `me` query. If it returns a user, the session is active. No tokens are managed in JS — auth cookies are HTTP-only and invisible to the frontend.

**File layout**:

```
src/
├── lib/
│   ├── apollo.ts                  — Apollo client (credentials: 'include')
│   └── api.ts                     — REST fetch helpers (apiGet/apiPost/apiPatch/apiDelete, ApiError)
├── graphql/
│   └── auth.operations.ts         — All auth queries/mutations (ME_QUERY, LOGIN_MUTATION, etc.)
├── hooks/
│   ├── useAuth.ts                 — useCurrentUser, useLogin, useRegister, useLogout, useSetupTwoFactor, useEnableTwoFactor, useVerifyTwoFactor
│   └── useClockify.ts             — TanStack Query hooks for all Clockify REST endpoints
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx         — Shared card wrapper for public auth pages
│   │   ├── GoogleOAuthButton.tsx  — Full-page redirect to /auth/google (OAuth cannot use GraphQL)
│   │   └── ProtectedRoute.tsx     — Redirects to /login when unauthenticated; shows loading state
│   └── layout/
│       ├── AppLayout.tsx          — App shell: renders <Sidebar /> + <Outlet /> side by side
│       └── Sidebar.tsx            — Sticky sidebar with nav links, user info, and sign-out button
└── pages/
    ├── LoginPage.tsx              — Email/password form; on requiresTwoFactor → navigate to /2fa/verify
    ├── RegisterPage.tsx           — Registration form
    ├── TwoFactorVerifyPage.tsx    — TOTP code input; reads tempToken from router state
    ├── TwoFactorSetupPage.tsx     — Security settings page: QR setup + enable 2FA
    ├── DashboardPage.tsx          — Protected landing page with 2FA prompt
    └── TimeTrackerPage.tsx        — Clockify time tracker: connect → pick workspace → start/stop timers
```

**Routing** (`App.tsx` — `createBrowserRouter`):
| Route | Component | Auth |
|---|---|---|
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/2fa/verify` | `TwoFactorVerifyPage` | public (has `tempToken` in router state) |
| `/` | `DashboardPage` | protected (inside `AppLayout`) |
| `/settings/2fa` | `TwoFactorSetupPage` | protected (inside `AppLayout`) |
| `/time-tracker` | `TimeTrackerPage` | protected (inside `AppLayout`) |

The protected route hierarchy is: `ProtectedRoute → AppLayout → [page]`. Adding a new protected page means adding it as a child of `AppLayout` in `App.tsx`.

**Key rules:**

- The React Compiler handles memoization — keep components and hooks pure.
- Vite plugins: `tailwindcss()` (first) + `@vitejs/plugin-react` (JSX) + `@rolldown/plugin-babel` (React Compiler). Add Babel plugins to `vite.config.ts` only, not `.babelrc`.
- `useCurrentUser()` uses `errorPolicy: 'ignore'` so unauthenticated requests don't throw.
- After `logout`, call `client.clearStore()` to wipe the Apollo cache.
- Google OAuth is a full-page redirect (`window.location.href = .../auth/google`), not a GraphQL mutation.
- `Sidebar.tsx` owns the user display, role badge, and sign-out button — do not duplicate these in page components.
- Protected page components use `max-w-3xl mx-auto px-6 py-8` for consistent padding/max-width. Do not add custom headers with back buttons; sidebar navigation replaces them.
- Nav links in `Sidebar.tsx` use `<NavLink end>` — always pass `end={true}` for the `/` route so it doesn't highlight on every sub-path.
- Sidebar is `flex-row` (horizontal top bar) on mobile, `sm:flex-col sm:w-56` sticky on desktop — controlled by Tailwind `sm:` breakpoint (640px).
- Dark mode is `@media (prefers-color-scheme: dark)` — Tailwind v4's default. Use `dark:` variants; do not add a class-based dark mode toggle.
- Color palette: `violet-*` for accent, `zinc-*` for neutrals, `emerald-*` for success states, `red-600` for errors. Do not introduce other accent colors.
- There is no custom CSS file — do not create one. If a style cannot be expressed with Tailwind utilities, use inline `style={{}}` as a last resort.
- Do not call `setState` synchronously inside `useEffect` bodies — the React Compiler lint rule flags this. Use a tick-counter pattern for live timers: `setInterval(() => setTick(t => t + 1), 1000)` and compute display value during render.

**Apollo Client v4 import rules** — v4 no longer exports everything from `@apollo/client`. Use the correct subpackage or Vite will throw a missing-export error at runtime:

| What                                                           | Import from               |
| -------------------------------------------------------------- | ------------------------- |
| `ApolloClient`, `InMemoryCache`, `HttpLink`, `from`, `gql`     | `@apollo/client/core`     |
| `useQuery`, `useMutation`, `useApolloClient`, `ApolloProvider` | `@apollo/client/react`    |
| `ApolloLink`, link utilities                                   | `@apollo/client/link/...` |

## Status & Known Gaps

- **Token refresh not wired**: the backend `refreshToken` mutation exists but the frontend never calls it. Needs an Apollo error link that intercepts `UNAUTHENTICATED` errors, calls `refreshToken`, then retries. On refresh failure → redirect to `/login`.
- **No redirect-back after login**: `ProtectedRoute` redirects to `/login` but does not preserve the originally requested path. Store `location.pathname` in router state and restore it after successful login.
- **No disable-2FA flow**: once 2FA is enabled there is no UI or mutation to turn it off.
- **Existing resolvers unguarded**: `users` and `projects` resolvers on the backend still have no `@UseGuards(GqlAuthGuard)`.
- **Clockify API key plaintext**: stored as-is in the DB — consider server-side encryption.

## Docs

Implementation logs live in `../../docs/implementations/`:

- `auth-implementation.md` — backend auth system
- `auth-ui.md` — this frontend auth UI

Plans live in `../../docs/plans/`:

- `clockify-integration.md` — Clockify REST integration design

## Auth Hooks (`src/hooks/useAuth.ts`)

| Hook                   | Description                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `useCurrentUser()`     | Returns `{ user, loading, isAuthenticated }`. Polling `me` query.                                              |
| `useLogin()`           | Returns `{ login(email, password), loading, error }`. Check `data.login.requiresTwoFactor` to detect 2FA flow. |
| `useRegister()`        | Returns `{ register(email, password, name?), loading, error }`.                                                |
| `useLogout()`          | Calls logout mutation + clears Apollo cache.                                                                   |
| `useSetupTwoFactor()`  | Returns QR code URL and base32 secret for display.                                                             |
| `useEnableTwoFactor()` | Confirms 2FA setup with a TOTP code.                                                                           |
| `useVerifyTwoFactor()` | Completes login when 2FA is required — pass `tempToken` from login response + user code.                       |

## Clockify Hooks (`src/hooks/useClockify.ts`)

All hooks use TanStack Query against the backend REST endpoints at `/clockify/*`.

| Hook                                            | Type                        | Endpoint                                                                       |
| ----------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| `useClockifyStatus()`                           | query                       | `GET /clockify/status` → `{ connected, workspaceId }`                          |
| `useSetClockifyCredentials()`                   | mutation                    | `POST /clockify/credentials` — validates key via Clockify then saves           |
| `useSetClockifyWorkspace()`                     | mutation                    | `PATCH /clockify/workspace` — updates workspace pref without re-validating key |
| `useClockifyWorkspaces()`                       | query                       | `GET /clockify/workspaces`                                                     |
| `useClockifyProjects(workspaceId)`              | query                       | `GET /clockify/workspaces/:id/projects`                                        |
| `useClockifyEntries(workspaceId, start?, end?)` | query                       | `GET /clockify/workspaces/:id/entries`                                         |
| `useClockifyActiveEntry(workspaceId)`           | query, refetchInterval: 10s | `GET /clockify/workspaces/:id/entries/active`                                  |
| `useStartEntry(workspaceId)`                    | mutation                    | `POST /clockify/workspaces/:id/entries`                                        |
| `useStopEntry(workspaceId)`                     | mutation                    | `PATCH /clockify/workspaces/:id/entries/:eid/stop`                             |
| `useDeleteEntry(workspaceId)`                   | mutation                    | `DELETE /clockify/workspaces/:id/entries/:eid`                                 |

`QueryClientProvider` is wired in `main.tsx` alongside `ApolloProvider`.
