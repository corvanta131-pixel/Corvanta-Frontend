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

Status: NOT STARTED

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

None recorded.

---

# BACKEND DEPENDENCIES

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