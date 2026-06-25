# Freelance Companion — Frontend

React 19 SPA for the FreelanceCompanion platform. Handles authentication, 2FA setup, core business management (clients, projects, tasks, time entries, invoices), Clockify time tracking, and HubSpot CRM. Communicates with the backend via GraphQL (Apollo) for all core entities and REST (TanStack Query) for integrations.

## Stack

- **React 19** with **React Compiler** (automatic memoization — no manual `useMemo`/`useCallback`)
- **Apollo Client v4** — GraphQL communication (`credentials: 'include'` for cookie auth)
- **TanStack Query v5** — REST API calls (Clockify, HubSpot proxy endpoints)
- **React Router v7** — client-side routing
- **Shadcn/ui** — component library (Radix primitives + class-variance-authority); components live in `src/components/ui/`
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`; themed via CSS variables in `src/index.css`
- **Geist** — variable font (`@fontsource-variable/geist`)
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

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Default value (`VITE_API_URL=http://localhost:3000/graphql`) works for local dev — no changes needed unless the backend runs on a different port.

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

| Path            | Page                | Auth                   |
| --------------- | ------------------- | ---------------------- |
| `/login`        | LoginPage           | public                 |
| `/register`     | RegisterPage        | public                 |
| `/2fa/verify`   | TwoFactorVerifyPage | public                 |
| `/`             | DashboardPage       | protected              |
| `/profile/edit` | EditProfilePage     | protected              |
| `/settings/2fa` | TwoFactorSetupPage  | protected              |
| `/clients`      | ClientsPage         | protected              |
| `/clients/:id`  | ClientDetailPage    | protected              |
| `/projects`     | ProjectsPage        | protected              |
| `/projects/:id` | ProjectDetailPage   | protected              |
| `/time`         | TimeEntriesPage     | protected              |
| `/invoices`     | InvoicesPage        | protected              |
| `/invoices/:id` | InvoiceDetailPage   | protected              |
| `/time-tracker` | TimeTrackerPage     | protected              |
| `/hubspot`      | HubspotPage         | protected              |
| `/rates`        | RatesPage           | protected              |
| `/admin`        | AuditLogPage        | protected (ADMIN role) |

## Features

### Clients (`/clients`, `/clients/:id`)

List and manage clients. Table view with inline create form (name, email, phone, company). Detail page has two tabs:

- **Projects** — lists all projects linked to this client
- **Activity** — placeholder for future audit/activity feed

### Projects (`/projects`, `/projects/:id`)

Project management with status filter tabs (All, Draft, Active, Completed). Inline create form lets you pick client, set source/target language, word count, unit price, and deadline.

Detail page shows project overview (languages, word count, unit price, deadline) above three tabs:

- **Tasks** — flat task list with status filter, bulk select/delete/status-change, inline create, and drag-to-reorder. Clicking a row or the ✎ button opens an inline edit form (title, description, status, due date, assignee).
- **Kanban** — Todo / In Progress / Done columns with drag-and-drop across columns via `@dnd-kit`. Dropping a card on a different column updates its status immediately (optimistic cache update). ✎ opens an inline edit form per card.
- **Time** — time entries scoped to this project.

### Time Entries (`/time`)

Unified time tracking page (internal, not Clockify):

- **Active timer banner** — shows running entry with start time; Stop button ends it and computes duration.
- **Start timer** — description input + Start button when no timer is running.
- **Log entry** — manual entry form (description, start date/time, end date/time).
- **Import from Clockify** — visible when Clockify is connected. Date range picker (default: last 7 days); imports Clockify entries into TTC's own DB. Idempotent — already-imported entries are skipped. Shows `"Imported N, skipped M"` result.
- **Date range filter** — defaults to last 30 days; From/To date pickers.
- **Entry list** — duration in `H:MM:SS` format, billable badge, delete button.

### Invoices (`/invoices`, `/invoices/:id`)

Invoice management with status filter tabs (All, Draft, Sent, Paid).

Two creation modes:

- **New invoice** — blank invoice with optional client and due date.
- **Generate from project** — auto-creates line items from all billable, completed time entries for a selected project.

Detail page:

- **Line items table** — description, quantity, unit price, total per line. Inline add/remove items.
- **Status transitions** — buttons for allowed next states (e.g. "Mark SENT", "Mark PAID"). Transitions enforce the workflow: `DRAFT→SENT/CANCELLED`, `SENT→PAID/OVERDUE`, `OVERDUE→PAID`.
- **PDF download** — "Download PDF" triggers `GET /invoices/:id/pdf` and saves the file. PDF is multi-page (items overflow to new pages with repeated column headers; "Page N of M" footer). If a logo URL is set in the user's profile, it is embedded top-right on the first page.
- **Logo preview** — if `user.logoUrl` is set, a small logo image is shown right-aligned above the invoice number.

### Authentication

Email/password login with optional 2FA (TOTP). Google OAuth via full-page redirect. Sessions managed via HTTP-only cookies — no tokens in JS.

Login and register forms validate fields on blur — inline error messages appear per field without waiting for submit. The register form shows a password strength bar (Weak / Medium / Strong). The dashboard shows a loading skeleton while the session query is in flight.

### Edit Profile (`/profile/edit`)

Accessible by clicking the username in the sidebar. Two-tab layout:

- **Profile tab** — edit name, email, and logo URL (HTTPS); logo preview shown inline; role shown read-only.
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

- **Contacts** — search input + paginated list (name/email/company/phone) + inline create form + "Import as client" button per row (imports contact into TTC Clients; idempotent)
- **Companies** — paginated list with name/domain/phone/location + inline create form + "Load more"
- **Deals** — paginated list with name/amount/stage/close date + inline create form + "Load more"

Disconnect button clears all stored tokens. Reconnect via "Connect HubSpot" again.

### Rates (`/rates`)

Rate management for translators. Four-tab layout:

- **Overview** — at-a-glance dashboard showing all defined rates grouped by type with counts. Empty state guides to other tabs.
- **Hourly** — list and manage hourly rates (price per hour). CRUD: add, edit inline, delete with confirm.
- **Per Word** — list and manage per-word rates (price per source/target word). Amounts displayed to 4 decimal places.
- **Fixed Fee** — list and manage fixed-fee services (flat rate per engagement).

Each rate has a **name** (e.g. "Standard EN→FR", "Legal"), **amount**, **currency** (EUR/USD/GBP/CHF/CAD/AUD/JPY), and optional **description**. Editing opens an inline form replacing the row. Deletion requires confirmation via dialog.

### Admin (`/admin`)

Visible in the sidebar for users with `ADMIN` role only. Two tabs:

- **Audit log** — table of all mutating third-party API calls (HubSpot + Clockify). Shows timestamp, user email, action, and resource. Last 100 entries by default.
- **HubSpot connections** — table of all users with their HubSpot connection status (connected badge, portal ID, token expiry). Admins can force-disconnect any user's HubSpot tokens.
