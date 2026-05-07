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
| `/settings/2fa` | TwoFactorSetupPage  | protected |
| `/time-tracker` | TimeTrackerPage     | protected |

## Features

### Authentication

Email/password login with optional 2FA (TOTP). Google OAuth via full-page redirect. Sessions managed via HTTP-only cookies — no tokens in JS.

### Two-factor authentication

Setup flow: generate QR code → scan in authenticator app → confirm with 6-digit code. Required on subsequent logins once enabled.

### Time Tracker (`/time-tracker`)

Clockify integration for per-user time tracking:

1. **Connect** — enter your Clockify API key (Profile → API key in Clockify)
2. **Pick workspace** — select which Clockify workspace to track time in
3. **Track** — start/stop timers with optional description and project assignment; view recent entries; delete entries

Active timer auto-refreshes every 10 seconds.
