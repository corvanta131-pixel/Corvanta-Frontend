# Corvanta Frontend — Development Control File

This file is the living task and progress file for the Corvanta frontend project.

The permanent project specification is contained in:

`.github/instructions.txt`

Before performing any development work, Kilo must read and understand `.github/instructions.txt`.

This file tracks the current development stage, active tasks, completed stages, known issues, backend dependencies, validation results, and remaining work.

---

# CURRENT DEVELOPMENT STATUS

## Current Stage

Stage H — Team & Employee Management

## Status

IN PROGRESS

## Current Objective

Build Team & Employee Management page for the Corvanta frontend.

Production API:

https://api.campusify.net

---

# ACTIVE STAGE TASKS

## Stage F — Company Management

* [x] Inspect backend contract (GET /companies/, POST /companies/).
* [x] Create company API service (src/services/api/company.ts).
* [x] Create company API hooks (useCompany, useCurrentUser).
* [x] Replace placeholder CompanyPage with full implementation.
* [x] Add permission-aware access control (companies:read).
* [x] Create company overview with avatar/initials.
* [x] Create workspace context showing User → Role → Company.
* [x] Create company info card (read-only).
* [x] Implement loading/error/empty states.
* [x] Add tests (6 tests covering all states).
* [x] Run TypeScript validation.
* [x] Run ESLint.
* [x] Run tests.
* [x] Run the production build.

---

# DEVELOPMENT RULES

1. Always read `.github/instructions.txt` before beginning development work.

2. Work only on the current active stage.

3. Do not automatically begin the next stage.

4. Do not invent backend endpoints.

5. Do not invent backend functionality.

6. Do not create fake successful API responses to hide missing backend functionality.

7. Use the real production API whenever the current stage requires API communication.

8. Reuse existing frontend infrastructure whenever possible.

9. Do not unnecessarily recreate existing services, hooks, providers, components, or utilities.

10. Do not implement functionality belonging to future stages.

11. If a required backend capability does not exist, record it under `BACKEND DEPENDENCIES` or `KNOWN ISSUES` instead of creating a fake frontend implementation.

12. Maintain production-quality TypeScript, React, accessibility, security, error handling, loading states, and responsive behavior.

13. Run the required validation before marking a stage complete.

14. Do not mark a task complete unless it has actually been implemented and verified.

15. Update this file as development progresses.

---

# STAGE STATUS

## Stage A — Production API Integration

Status: COMPLETE

## Stage B — Authentication

Status: COMPLETE

## Stage C — Public Website

Status: COMPLETE

## Stage D — Application Shell

Status: COMPLETE

## Stage E — Customer Portal Dashboard

Status: COMPLETE

## Stage F — Company Management

Status: COMPLETE

## Stage G — Services Architecture

Status: COMPLETE

## Stage H — Team & Employee Management

Status: IMPLEMENTED — AWAITING VALIDATION (code written and statically checked only; `npm run test:run`, `npm run lint`, `npm run build` NOT yet run by Claude because the authoring sandbox had no network/node_modules. Run them locally and record results below before marking COMPLETE.)

## Stage I — Customers

Status: NOT STARTED

## Stage J — Conversations / Inbox

Status: NOT STARTED

## Stage K — Messaging

Status: NOT STARTED

## Stage L — AI Agents

Status: NOT STARTED

## Stage M — Channels

Status: NOT STARTED

## Stage N — Knowledge Bases

Status: NOT STARTED

## Stage O — Knowledge Documents / RAG

Status: NOT STARTED

## Stage P — Workflows

Status: NOT STARTED

## Stage Q — Audit

Status: NOT STARTED

## Stage R — Permissions / Authorization UX

Status: NOT STARTED

## Stage S — Account & Settings

Status: NOT STARTED

## Stage T — Billing / Subscription Architecture

Status: NOT STARTED

## Stage U — Search / Filtering

Status: NOT STARTED

## Stage V — Notifications / UX States

Status: NOT STARTED

## Stage W — Analytics

Status: NOT STARTED

## Stage X — Accessibility / Responsive

Status: NOT STARTED

## Stage Y — Testing / Security / Performance

Status: NOT STARTED

## Stage Z — Production QA / Release

Status: NOT STARTED

---

# COMPLETED STAGES

Stage A — Production API Integration (2026-09-25)

Stage B — Authentication (2026-09-27)

Stage C — Public Website (2026-09-27)

Stage D — Application Shell (2026-09-29)

Stage E — Customer Portal Dashboard (2026-10-07)

Stage F — Company Management (2026-10-07)

---

# KNOWN ISSUES

* Stage H validation commands have not been run yet (see Stage H validation below).
* Frontend `isOwner()` checks role slug `owner`, but the backend creates the company owner's role with slug `super-admin`. Not changed in Stage H; revisit in Stage R.
* Frontend auth `User.status` type is `'active' | 'inactive' | 'pending'`; backend enum is `active | invited | disabled`. Not changed in Stage H (auth stage preserved); fix in Stage R.
* Sidebar references permissions the backend never defines (`services:read`, `audit:read`, `settings:read`) and owners only hold `*` for channels/workflows; `can()` now honours `*`, so these items appear for owners. Revisit nav permissions in Stage R.

---

# BACKEND DEPENDENCIES

Found while auditing the backend for Stage H (backend NOT modified; verify and fix server-side):

1. SECURITY: `POST /users/` without a password sets the hardcoded password `TempPassword123!` (employeeService.createEmployee). Every such account shares a known password.
2. SECURITY (verify live): every registered owner receives a per-company role with slug `super-admin`, and `isPlatformAdmin()` treats that slug as platform admin. `GET /companies/` then returns ALL companies, and `POST /companies/` is open to every owner. Cross-tenant exposure risk.
3. No roles endpoint exists, so the frontend cannot offer a role picker; newly created employees get `roleId: null` (no permissions).
4. Login requires `status === 'active'`; `invited` employees cannot sign in and no invitation email flow exists.
5. `PATCH /users/:id` requires `name` and `email` even for partial updates.
6. `department`/`title` must be 2-100 characters when provided (empty string allowed).
7. `GET /users/` returns the full list (no pagination); supports `?status=` and `?department=` query filters, which the frontend currently does not use (it filters locally).

Record frontend features that cannot be completed because the required backend capability or API does not currently exist.

Current known backend limitations should be taken from the actual backend implementation and `.github/instructions.txt`.

Do not assume that an endpoint exists simply because a frontend feature would logically require one.

---

# BLOCKED WORK

Record any work that cannot proceed because of:

* missing backend functionality
* unavailable API endpoint
* authentication limitation
* infrastructure problem
* environment problem
* external service dependency
* unresolved technical issue

---

# VALIDATION HISTORY

## Stage H (implemented; validation pending)

Verified against backend source: routes, userController, employeeService, domainValidator.validateEmployeeInput, User model.

Files changed: features/users/{types,hooks,employeeUtils}.ts, services/api/employee.ts, components/employees/* (Form, Card, Detail, DeleteConfirmDialog, Filters; new Table, StatusBadge), pages/app/TeamPage.tsx, components/ui/Dialog.tsx (Escape key, role=dialog, relative close button), utils/permissions.ts (`*` wildcard), app/providers/AppProviders.tsx (mount Sonner Toaster).

Tests added: employeeUtils.test.ts, services/api/employee.test.ts, EmployeeForm.test.tsx, TeamPage.test.tsx (mock-tested only, not run).

Supported operations: list, view detail, create, update, soft-delete (own account cannot be removed from the UI). Local search/status/department filtering.

TypeScript: NOT RUN
ESLint: NOT RUN
Tests: NOT RUN
Production Build: NOT RUN
Hosted API verification: NOT DONE (no production mutations were sent)

## Stage A

TypeScript: PASS

ESLint: PASS

Tests: PASS (no tests exist yet - this is a new project)

Production Build: PASS

Production API Verification: PASS

CORS Verification: PASS

## Stage B

TypeScript: PASS

ESLint: PASS

Tests: PASS (no tests exist yet - this is a new project)

Production Build: PASS

Authentication Flow Verification: PASS (login, register, refresh, logout, /auth/me tested against real API)

## Stage C

TypeScript: PASS

ESLint: PASS

Tests: PASS (no tests exist yet - this is a new project)

Production Build: PASS

## Stage D

TypeScript: PASS

ESLint: PASS

Tests: PASS (no tests exist yet - this is a new project)

Production Build: PASS

## Stage E

TypeScript: PASS

ESLint: PASS

Tests: PASS (3 dashboard tests)

Production Build: PASS

## Stage F

TypeScript: PASS

ESLint: PASS

Tests: PASS (6 company page tests, 3 dashboard tests = 9 total)

Production Build: PASS

---

# IMPORTANT IMPLEMENTATION NOTES

The Corvanta frontend is a production-style SaaS customer portal.

The frontend must use the real Corvanta backend and must reflect the actual backend capabilities.

The frontend must not become a collection of disconnected mock screens.

The final product should function as the customer's control center for Corvanta services.

The underlying backend authorization system remains the security boundary.

Owner and Employee are business-facing concepts and must be implemented according to the architecture defined in `.github/instructions.txt`.

Do not expose protected server-side fields or allow clients to modify fields that must remain server-controlled.

---

# CURRENT WORKING RULE

Kilo must:

1. Read `.github/instructions.txt`.
2. Read this file.
3. Determine the current active stage.
4. Execute only that stage.
5. Update the task checklist as work is completed.
6. Run the required validation.
7. Record the results.
8. Report what was changed.
9. Stop when the current stage is complete or blocked.

Kilo must never automatically continue to the next stage.

The next stage may only begin when explicitly instructed.

## Stage I — Customers (implemented; validation pending)

Status: IMPLEMENTED, NOT VALIDATED. Static syntax check only; test:run, lint, build not yet run.

Files: features/customers/{types,hooks,customerUtils}.ts (+test), features/conversations/types.ts, services/api/{customer,envelope}.ts (+customer test), components/customers/*, components/ui/ConfirmDialog.tsx, pages/app/CustomersPage.tsx (+test). services/api/employee.ts now uses the shared envelope helper.

Contract decisions: email required on create in the UI (backend 409s on a second customer with an empty email); status values active/inactive/prospect/archived; search is local (server only filters status and exact email); no pagination exists; detail dialog reads identities and conversations only if the user holds customer-identities:read / conversations:read.

Not supported by backend, therefore not built: tags, segments, avatars, server-side search, pagination, notes history.

See docs/PROJECT_COMPLETION_TRACKER.md and docs/BACKEND_INTEGRATION_MATRIX.md.


## Startup fix (blank screen) — applied
Root causes: (1) `AppProviders` wrapped children in `<BrowserRouter>` while `main.tsx` renders a `RouterProvider` from `createBrowserRouter`; React Router throws "You cannot render a <Router> inside another <Router>". (2) `src/index.css` was leftover Vite starter CSS with Tailwind v3 `@tailwind` directives under Tailwind v4, plus `#root { width: 1126px; text-align: center }`. Fixes: removed `BrowserRouter`; replaced index.css with `@import "tailwindcss"` plus a minimal base. Regression test: `src/app/providers/AppProviders.test.tsx`. Also removed the invalid `--ext` flag from the lint script (ESLint 9 flat config).

## Stage J (Inbox, read-only) and Stage Q (Audit) — implemented, validation pending
Backend added: GET /roles, GET /audit-logs (+ employee role assignment refuses platform-admin). Frontend added: Inbox, Audit page, role picker, shared `hasStringField` helper. Messages are read-only; sending is Stage K. See docs/ for the tracker and matrix.


## Website chat widget (Stage M, web chat only) — implemented, validation pending
Backend: public widget API (`/api/v1/widget/*`), per-channel CORS, visitor-scoped signed sessions, rate limits, `embed.js`, admin endpoints `GET/PUT /channels/:id/widget`. Widget settings live in `Channel.widget`, which the generic channel endpoints cannot write. Frontend: Channels page (setup, agent, allowed websites, brand, embed code, key rotation). Setup guide: docs/WEB_CHAT_SETUP.md. Known limits: staff cannot reply from the Inbox yet; rate-limit counters are per process.


## Inbox: human handoff and replies (Stages J/K) — implemented, validation pending
Backend: `POST /conversations/:id/replies` (HUMAN mode only), `PATCH /conversations/:id` now accepts `handlingMode` and `assigneeId`, `Conversation.assigneeId`. Frontend: take over / hand back, assignment, reply box with per-conversation drafts, auto-refresh (15 s list, 5 s messages, paused in background tabs). Also fixed my own earlier test bugs: table/list helpers that did not wait for loading, a list response given to a single-record call, a search term not present in the fixture.
