# Frontend Engineering Issues

Audit of `ttc-front/src` against engineering principles documented in backend `CLAUDE.md` (KISS, DRY, SOLID, DDD). Ranked most severe first.

## 1. ~~DRY — admin CRUD tables (7 files, ~350-500 lines each), copy-paste~~ RESOLVED

**Status:** Done

`components/admin/{projects,clients,invoices,rates,users}/*Table.tsx`, `admin/timeEntries/AdminTimeEntriesTable.tsx`. Search+filter+CSV+bulk-delete+edit-dialog reimplemented per file. Bug in one (e.g. `AdminProjectsTable.tsx:196-199` fires N un-awaited deletes, no `Promise.all`) stays broken in others.

**Outcome**: extracted composable shared primitives (not a monolithic `AdminCrudTable<T>` — columns/forms varied too much per entity to force through one generic table): `hooks/admin/useBulkSelection.ts` + `components/admin/shared/{BulkDeleteBar,RowDeleteButton,ExportCsvButton,AdminPageHeader,AdminTableChrome}.tsx`. The bulk-delete await bug is now fixed centrally in `BulkDeleteBar` (`await Promise.allSettled(...)` before clearing selection) for all 6 tables at once. Columns, badge maps, CSV row-shaping, and create/edit forms (`ClientForm`/`RateForm`/inline fields) stayed untouched per-file, as they were genuinely different. `components/admin/users/UsersTable.tsx` confirmed unrouted dead code (only `AdminUsersTable` is imported by any page) — excluded, flagged as a separate cleanup candidate, not deleted here.

## 2. ~~DRY — hand-rolled mutation boilerplate, systemic (~165 hooks)~~ RESOLVED

**Status:** Done

`hooks/{tasks,clients,invoices,time,activities,rates,tags,rate-sheets,admin}/*.ts`. Every hook repeats same `useMutation({...}).then(unwrap)` shape despite `lib/apollo.ts` already centralizing transport. Cross-cutting change (error toast, retry, telemetry) needs 60+ edits.

**Outcome**: extracted `lib/{gqlQuery,gqlMutation,cachePatch}.ts` and migrated ~20 hook files across `hooks/{clients,projects,tasks,time,invoices,rates,tags,rate-sheets,activities,admin,account}/*.ts` onto them (batched by pattern: plain queries → invalidate-only mutations → flat-array cache patches → connection cache patches → cursor pagination → nested-field patches). A few hooks with genuinely bespoke cache logic (`useUpdateClient`'s cross-filter cache walk, `useRates`'s multi-key patch) kept hand-written `onSuccess` bodies calling the shared cache-patch functions directly rather than being forced through a generic dispatcher.

## 3. ~~SRP — `components/projects/modals/TaskDetailModal.tsx` (705 lines), 4+ concerns jammed in one file~~ RESOLVED

**Status:** Done

Modal shell + title rename + description autosave + add-menu dropdown via `setTimeout(...click())` ref hacks (lines 240-270) + full time-tracking subsystem (7 hooks, lines 368-529) + attachment CRUD (lines 536-705).

**Outcome**: extracted `TaskTimeSection.tsx` (time-tracking subsystem, props `{taskId, projectId, taskTitle}`) and `AttachmentList.tsx` (attachment CRUD, props `{taskId, attachments, onAdd}`) into their own files alongside the other already-extracted modal sub-components (`TaskChecklist`, `TaskLabelPicker`, etc.). `TaskDetailModal.tsx` is now just the shell (~325 lines). Each new file has its own test file; the original `TaskDetailModal.test.tsx` needed no changes since it exercised the modal as a black box.

## 4. ~~KISS — fragile ref-click dropdown coupling~~ RESOLVED

**Status:** Done

`TaskDetailModal.tsx:239-270`. `setTimeout(() => ref.current?.click(), 80)` to open sibling pickers — timing-based, silently breaks if render slips past 80ms.

**Outcome**: `TaskLabelPicker`/`TaskDatePicker` gained an optional controlled `open`/`onOpenChange` prop pair (hybrid — falls back to internal `useState` when omitted, so their own existing uncontrolled tests needed no changes). `TaskDetailModal` now lifts `labelPickerOpen`/`datePickerOpen` state and passes it down directly; the checklist and attachment dropdown items call their setters synchronously. All `setTimeout`/ref-click indirection removed. New tests in `TaskDetailModal.test.tsx` assert each dropdown item opens its target synchronously (no timer).

## 5. DIP — "dead/wrong cache write" — investigated, not a bug

**Status:** Invalid — not a bug

`components/projects/tabs/TasksTab.tsx:81-95`. Originally reported: writes to TanStack `queryClient.setQueryData(["tasks",...])` on drag-drop, but tasks are Apollo-backed — key doesn't exist, call does nothing. Misleads reader into thinking drag-drop is optimistic.

**Correction**: this premise is factually wrong. `lib/apollo.ts` configures Apollo with `fetchPolicy: "no-cache"` for both query and watchQuery — Apollo's `InMemoryCache` is never read from anywhere in this app. **TanStack Query is the real cache**, keyed `["tasks", projectId]` by `useTasks`. The `setQueryData(["tasks", projectId], ...)` call writes into that exact live cache entry, is asserted by an existing passing test (`TasksTab.test.tsx`, "optimistically updates the cached task list on a status-changing drop"), and is a genuinely working optimistic update for cross-column (status-changing) drops. See issue #15 for the real gap found during this investigation.

## 6. ~~SRP — `hooks/projects/useProjectTaskList.ts` god hook (125 lines)~~ RESOLVED

**Status:** Done

Mixes fetch/CRUD + bulk-select state + drag-reorder shadow-cache + create-form UI state.

**Outcome**: `useProjectTaskList` shrunk to fetch/CRUD + status-filter state only. Drag-reorder extracted to new `hooks/projects/useTaskDragReorder.ts`. Selection reuses the existing `hooks/admin/useBulkSelection.ts` directly (no bespoke `useTaskSelection` written — mirrors its 6-admin-table precedent instead of duplicating its shape). Create-form state and bulk-action orchestration (`handleBulkDelete`/`handleBulkStatus`) moved into `components/projects/lists/ProjectTaskList.tsx`, which is now the composition root wiring all three hooks together. Test coverage moved with the logic: new `useTaskDragReorder.test.ts`, shrunk `useProjectTaskList.test.ts`, and `ProjectTaskList.test.tsx` gained real coverage for the create-form/bulk-action/status-filter behavior that used to live in the hook's tests.

## 7. ~~DRY — Connection type duplicated 5x~~ RESOLVED

**Status:** Done

`ClientConnection`, `ProjectConnection`, `InvoiceConnection`, `TaskConnection`, `TimeEntryConnection` all separately declare `{items, nextCursor, total}` shape — `admin.types.ts` already has generic `AdminConnection<T>` doing this once. New pagination field = 5 edits, easy miss.

**Outcome**: hoisted `types/common.types.ts`'s `Connection<T>`; all 6 domain types (including `AdminConnection<T>`) are now thin `export type X = Connection<Y>;` aliases, keeping every existing type name so none of the ~25 consumer files needed changes. Also found and fixed a previously-unreported second instance of the same duplication: `lib/gqlQuery.ts` had its own near-identical `Connection<T>` (only difference: optional `nextCursor`) — now imports the shared one instead.

## 8. ~~DRY — duplicate status constant/badge maps~~ RESOLVED

**Status:** Done

`constants/invoices.ts:11-20` vs `:39-48` — `STATUS_BADGE`/`INVOICE_STATUS_COLORS` byte-identical, different components use different one (badge color fix misses half UI). `constants/admin.ts:56-64` also re-lists `constants/projects.ts` STATUSES independently.

**Outcome**: deleted `INVOICE_STATUS_COLORS`; its one caller (`components/clients/rows/InvoiceRow.tsx`) now imports `STATUS_BADGE`. `constants/admin.ts`'s `PROJECT_STATUSES` is now `export const PROJECT_STATUSES = STATUSES;` (imported from `./projects`) instead of an independent copy — no circular-import risk confirmed beforehand. Left `ADMIN_INVOICE_STATUS_BADGE`/`ADMIN_PROJECT_STATUS_BADGE` untouched (separate maps, not named in this issue); noted that `ADMIN_INVOICE_STATUS_BADGE`'s `PAID` value diverges from `STATUS_BADGE`'s (`"default"` vs `"outline"`) — possibly intentional admin styling, possibly drift, flagged but not silently unified.

## 9. ~~DRY — dead duplicate HubSpot hooks~~ RESOLVED

**Status:** Done

`hooks/integrations/useHubspot.ts:41-98` — plain query variants duplicate infinite variants (CLAUDE.md itself says only infinite ones used).

**Outcome**: deleted `useHubspotContacts`/`useHubspotCompanies`/`useHubspotDeals` (confirmed zero production call sites) plus their dedicated test blocks in `useHubspot.test.ts`. `CLAUDE.md`'s stale "kept for backwards compatibility" note updated to reflect the removal.

## 10. ~~DRY — blob-download pattern duplicated~~ RESOLVED

**Status:** Done

`lib/csv.ts:10-17` vs `hooks/invoices/useInvoiceDetail.ts:28-36` — both hand-roll `createObjectURL→click→revokeObjectURL`.

**Outcome**: extracted `downloadBlob(blob, filename)` into `lib/utils.ts` (TDD'd — tests written first). `csv.ts`'s `exportCsv` and `useInvoiceDetail.ts`'s `handleDownloadPdf` both refactored to call it; each keeps its own blob-construction logic (CSV building vs. the awaited PDF fetch) local. Existing tests for both passed unmodified, confirming no behavior change.

## 11. ~~ISP — `types/projects.types.ts:122-138` `TimeTabProps`~~ RESOLVED

**Status:** Done

15 flat props mixing list pagination + timer control + form ref data.

**Outcome**: `TimeTabProps` reduced to `{ list: EntryListProps; timer: TimerSectionProps }`. Reused the existing `EntryListProps` (`types/shared-ui.types.ts`) rather than inventing a new `TimeListProps`; extracted `TimerSectionProps` from `TimerSection.tsx`'s previously-inline prop type (built on top of the already-existing `TimerStartInputProps`). `TimeTabProps` itself now lives in `shared-ui.types.ts` too, not `projects.types.ts` — keeping it there caused a real circular import (`projects.types.ts` → `shared-ui.types.ts` → `projects.types.ts` via the `Project` type), so it was co-located with its two constituent types instead. `useProjectTimeTab.ts` untouched; only `TimeTab.tsx` and its call site in `ProjectDetail.tsx` changed how props are grouped.

## 12. ~~DDD/naming — `types/clients.types.ts:253-259` exports `FormData`~~ RESOLVED

**Status:** Done

Actually rate-domain shape, shadows DOM `FormData`, belongs in `rates.types.ts`.

**Outcome**: moved to `types/client-rates.types.ts` (alongside the existing client-scoped `ClientRate` interface) renamed `ClientRateFormData` — not merged into `rates.types.ts`'s existing `TranslationRateFormData` since the fields genuinely differ (no `type` field there, `amount` already parsed as `number` vs. this shape's raw-input `string`). Its one consumer, `ClientRatesTab.tsx`, updated.

## 13. minor DRY — `ClientHeader.tsx`/`ProjectHeader.tsx`

**Status:** Reviewed — no action (KISS)

Duplicate read/edit-toggle shell (exactly 2 instances — flag only, no forced abstraction yet per KISS).

**Outcome**: re-investigated — the shared shell is genuinely only ~20 lines out of ~410/~440 total per file (under 5%). Field counts, save-handler signatures, and surrounding logic (one drives a custom `useClientHeaderForm` hook, the other inline `useState`) differ enough that extracting a shared shell would cost more in generic-slot plumbing than it saves. No third instance exists anywhere else in the codebase. Original audit's conclusion confirmed — left as-is.

## 14. ~~Dead code — `components/admin/users/UsersTable.tsx`~~ RESOLVED

**Status:** Done

Unrouted, plain (non-Shadcn) table component discovered while fixing issue #1. Confirmed: only `AdminUsersTable` is imported by any page (`pages/admin/AdminUsersPage.tsx`) — nothing imports `UsersTable`. Uses raw `<table>`/`<tr>`/`<td>` HTML, not Shadcn `Table` primitives — also violates the "Shadcn + Tailwind only" UI law in `CLAUDE.md`. Excluded from issue #1's refactor since it shares none of the bulk-select/CSV/bulk-delete duplication (no such features).

**Outcome**: re-confirmed zero real consumers via repo-wide grep (only its own definition + its own test file matched) plus clean `ts-prune`/`tsc -b` — the reason it stayed hidden from automated dead-export detection is that `ts-prune` counts a component's own co-located test file as a "use." Deleted `UsersTable.tsx` (189 lines) + `UsersTable.test.tsx` (159 lines); no other file referenced them.

## 15. ~~Same-column kanban drag reorder was a complete no-op~~ RESOLVED

**Status:** Done

Found while investigating issue #5. `TasksTab.tsx`'s `handleDragEnd` only handled cross-column (status-changing) drops — its guard `if (targetStatus && task.status !== targetStatus)` meant dropping a task onto another task in the _same_ status column matched but fell through the guard, doing nothing at all: no optimistic UI, no mutation. `CLAUDE.md`'s Status & Known Gaps section incorrectly claimed "Dropping within a column updates sortOrder."

**Outcome**: added an `else if (targetStatus && task.status === targetStatus)` branch using `arrayMove` (from `@dnd-kit/sortable`, same pattern already used in `hooks/projects/useProjectTaskList.ts`) plus new per-column `localOrders` state for the optimistic on-screen reorder, then fires `updateTask({ id, sortOrder: newIndex })`. `CLAUDE.md`'s claim is now accurate.

## 16. ~~Raw non-Shadcn `<button>` elements found~~ RESOLVED

**Status:** Done

Found while working on issues #3/#4. `TaskDetailModal.tsx:196` (modal close ✕ button) and inside `AttachmentList.tsx` (edit ✎ / delete ✕ icon buttons) use raw HTML `<button>` instead of the Shadcn `Button` component — violates the "Shadcn + Tailwind only" UI law in `CLAUDE.md`.

**Outcome**: all 3 raw `<button>`s (modal close, attachment edit, attachment delete) replaced with `<Button variant="ghost" size="icon-xs">`, matching the existing `AdminRatesTable.tsx` icon-button idiom, with `aria-label`s added for accessibility. Existing tests (`TaskDetailModal.test.tsx`, `AttachmentList.test.tsx`) needed no changes since they query by `title` attribute or visible text content, not role/accessible name.

## 17. ~~DIP — `TasksTab.tsx` hand-rolls `setQueryData` instead of using `cachePatch.ts`~~ RESOLVED

**Status:** Done

Found during a re-check of issue #5's area. `TasksTab.tsx:85-99` hand-rolls `queryClient.setQueryData<InfiniteData<TaskConnection>>(["tasks", projectId], ...)` directly in the component to get an optimistic pre-mutation status flip on cross-column drag. But `useUpdateTask`'s `onSuccess` (`hooks/tasks/useTasks.ts:101-107`) already patches that exact cache key correctly via the sanctioned `patchConnection` helper. CLAUDE.md is explicit that cache patching belongs in a hook's `onSuccess` via `cachePatch.ts`, "rather than hand-rolling `setQueryData`/`setQueriesData` calls" — this line does exactly that.

**Outcome**: `useUpdateTask` now hand-writes `useMutation` directly (bypassing `useGqlMutation`, mirroring CLAUDE.md's own documented escape hatch for "genuinely bespoke cache logic") with `onMutate` (optimistic status patch, guarded to skip `sortOrder`-only updates), `onError` (rollback to the pre-mutation snapshot — didn't exist before), and the original `onSuccess` `patchConnection` logic unchanged. TDD'd: 3 new tests in `useTasks.test.ts`. `TasksTab.tsx`'s inline `setQueryData` block and now-dead `useQueryClient`/`InfiniteData`/`TaskConnection` imports removed entirely; its existing optimistic-drag test passed unmodified, proving the hook reproduces the same observable effect.

## 18. ~~DDD/naming — `types/clients.types.ts` exports runtime `STATUS_LABELS`/`INDUSTRY_LABELS`~~ RESOLVED

**Status:** Done

Found during a re-check of issue #13's area. `types/clients.types.ts` exports runtime `Record` constants `STATUS_LABELS`/`INDUSTRY_LABELS`, not types — same class of violation as the already-resolved issue #12 (a runtime value misplaced in a `.types.ts` file). `constants/clients.ts` already exists and already holds other client-domain constants (`EMPTY_CLIENT_FORM`, `STATUS_COLORS`); every other domain (tasks, projects, invoices, admin, rates) keeps `types/*.types.ts` for types only and `constants/*.ts` for runtime values. 5 real consumers: `components/clients/headers/ClientHeader.tsx`, `components/clients/cards/ClientCard.tsx`, `components/clients/forms/NewClientForm.tsx`, `components/dashboard/prospectsToContact/ProspectsToContact.tsx`, `components/clients/boards/ProspectsBoard.tsx`.

**Outcome**: during the fix, found the violation was broader than initially logged — `STATUS_ORDER`, `PROSPECT_COLUMNS`, and `ACTIVE_CONTACT_STATUSES` were the same class of misplaced runtime constant sitting right next to the two named here. Moved all 5 to `constants/clients.ts`; updated all 5 consumer imports.

## 19. ~~DRY — `ProjectHeader.tsx` duplicates form-state construction between init and reset~~ RESOLVED

**Status:** Done

Found during a re-check of issue #13's area. `ProjectHeader.tsx`'s initial `useState(...)` value (lines 67-81) and its `resetForm()` (lines 84-100) construct byte-identical 13-field form-state objects — genuine copy-paste, not just structural similarity. The sibling `ClientHeader.tsx` avoids exactly this pattern via `hooks/clients/useClientHeaderForm.ts`'s `formFromClient(client)` helper, reused for both the initial state and `resetForm` — confirming this is a gap specific to `ProjectHeader.tsx`, not an inherent limit of the pattern.

**Outcome**: extracted a top-level `buildFormState(project)` function in `ProjectHeader.tsx`, mirroring `formFromClient`; used in both the `useState` initializer and `resetForm`.

## 20. ~~Dead validation guard in `ProjectHeader.tsx`'s `handleSave`~~ RESOLVED

**Status:** Done

Found while adding test coverage for `ProjectHeader.tsx`. `handleSave`'s `Number.isNaN(n) || n < 0` guard (showing "Word count and rates must be valid numbers ≥ 0.") is unreachable via the UI: every field it guards already has `type="number" min={0}`, so native HTML5 constraint validation blocks the `submit` event entirely on a button click before React's `onSubmit` ever runs when a value is negative — and the number-input value-sanitization algorithm resets any non-numeric typed value to `""` before it ever reaches JS, so the `Number.isNaN(n)` half is equally unreachable. Confirmed directly: a plain `fireEvent.click` on Save silently no-ops on a negative value; only a directly-dispatched `submit` event (which no real user action or native submit path produces) reaches the branch.

**Outcome**: removed the guard, the `error` state, and its JSX; simplified `parseNonNegative` to `str ? Number(str) : null` (the value-parsing itself was still needed, only the now-unreachable validation branch was dead). Deleted the 3 tests added this session that existed only to exercise the removed branch (via the `fireEvent.submit` bypass) — no replacement tests needed, since native `min={0}` enforcement is browser-guaranteed, not application logic.

---

## Clean

`lib/apollo.ts`/`api.ts`/`schemas.ts` (good DIP, single-responsibility), `ui/*` Shadcn wrappers, `auth/*`, `layout/Sidebar.tsx`, `dashboard/*`, `hooks/tags`, `hooks/rate-sheets`, whole `src/pages/**` (thin wrappers, zero violations — CLAUDE.md's page-layout notes are stale, kanban/tab logic moved into `components/projects/ProjectDetail.tsx`). No DDD boundary violations anywhere — cross-domain access goes through public hook APIs, not internals.
