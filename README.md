# Translator Companion — Frontend

React 19 SPA for the TranslatorAssistant platform. Handles authentication, 2FA setup, and Clockify time tracking. Communicates with the backend via GraphQL (Apollo) for auth/core entities and REST (TanStack Query) for time tracking.

## Stack

- **React 19** with **React Compiler** (automatic memoization — no manual `useMemo`/`useCallback`)
- **Apollo Client v4** — GraphQL communication (`credentials: 'include'` for cookie auth)
- **TanStack Query v5** — REST API calls (Clockify proxy endpoints)
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`
- **Vite 8** — bundler with Rolldown + Babel (React Compiler preset)
- **TypeScript 6** — strict mode

## Prerequisites

- Node.js 18+, pnpm
- Backend running at `http://localhost:3000`

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment** — create `.env` at the project root:

   ```env
   VITE_API_URL=http://localhost:3000/graphql
   ```

3. **Start dev server**

   ```bash
   pnpm run dev
   ```

App runs at `http://localhost:5173`.

## Running

```bash
pnpm run dev        # dev server with HMR
pnpm run build      # type-check then bundle
pnpm run preview    # preview production build locally
```

## Quality checks

```bash
pnpm run typecheck      # TypeScript — tsc --noEmit
pnpm run circular       # circular dependency detection (madge)
pnpm run depcheck       # unused/missing dependencies
pnpm run prune          # unused exports (ts-prune)
pnpm run format         # Prettier write
pnpm run format:check   # Prettier check
pnpm run lint           # ESLint with auto-fix
pnpm run check          # all of the above in sequence
```

## Routes

| Path            | Page                | Auth      |
| --------------- | ------------------- | --------- |
| `/login`        | LoginPage           | public    |
| `/register`     | RegisterPage        | public    |
| `/2fa/verify`   | TwoFactorVerifyPage | public    |
| `/`             | DashboardPage       | protected |
| `/profile/edit` | EditProfilePage     | protected |
| `/settings/2fa` | TwoFactorSetupPage  | protected |
| `/time-tracker` | TimeTrackerPage     | protected |
| `/hubspot`      | HubspotPage         | protected |

## Features

### Authentication

Email/password login with optional 2FA (TOTP). Google OAuth via full-page redirect. Sessions managed via HTTP-only cookies — no tokens in JS.

Login and register forms validate fields on blur — inline error messages appear per field without waiting for submit. The register form shows a password strength bar (Weak / Medium / Strong). The dashboard shows a loading skeleton while the session query is in flight.

### Edit Profile (`/profile/edit`)

Accessible by clicking the username in the sidebar. Two-tab layout:

- **Profile tab** — edit name and email; role shown read-only.
- **Security tab** — 2FA setup (QR code generation and TOTP confirmation) and disable 2FA (TOTP-verified).

### Two-factor authentication

Setup flow: generate QR code → scan in authenticator app → confirm with 6-digit code. Available on the Security tab in Edit Profile. Required on subsequent logins once enabled.

### Time Tracker (`/time-tracker`)

Clockify integration for per-user time tracking:

1. **Connect** — enter your Clockify API key (Profile → API key in Clockify)
2. **Pick workspace** — select which Clockify workspace to track time in
3. **Track** — start/stop timers with description, project, tags, and billable flag

**Entry features:**

- **Billable toggle** — `$` button per entry; green = billable
- **Project** — assign, change, or clear project per entry via inline select
- **Tags** — add tags via text search (filters existing workspace tags); if no match, a "Create `name`" link creates the tag in Clockify and attaches it; remove with ×
- **Resume** — ▶ button restarts a previous entry with its description, project, tags, and billable state

**Calendar view:**

- Entries grouped by day in collapsible accordions (collapsed by default)
- Day header shows date, entry count, earliest–latest time span, and total tracked time
- Within a day, entries sharing the same description are collapsed into one merged row showing description, count (×N), and combined duration; click ▶ to expand individual entries
- Date range filter (From / To date pickers) at the top controls which entries are fetched; defaults to the last 30 days
- Project filter narrows visible entries across all days

Active timer auto-refreshes every 10 seconds; polling stops on auth error (401) and resumes automatically on reconnect.

### HubSpot CRM (`/hubspot`)

HubSpot integration for CRM data via per-user OAuth2:

1. **Connect** — click "Connect HubSpot" to authenticate via HubSpot OAuth
2. **Browse** — tabbed view: Contacts, Companies, Deals; each tab paginates via "Load more"
3. **Search** — search input on the Contacts tab (debounced 300 ms); searches across email, first name, and last name; falls back to full paginated list when cleared
4. **Create** — inline forms to create new contacts and deals

**Tabs:**

- **Contacts** — search input + paginated list (name/email/company/phone) + inline create form
- **Companies** — paginated list with name/domain/phone + "Load more"
- **Deals** — paginated list with name/amount/stage/close date + inline create form + "Load more"

Disconnect button clears all stored tokens. Reconnect via "Connect HubSpot" again.
