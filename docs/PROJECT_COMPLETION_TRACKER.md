# Corvanta Frontend: Project Completion Tracker

Statuses: VERIFIED_COMPLETE, IN_PROGRESS, BLOCKED, NOT_IMPLEMENTED.
Rule: nothing is VERIFIED_COMPLETE until `npm run test:run`, `npm run lint` and `npm run build` have actually been run and passed.

Last checkpoint: Stages H, I, J (read-only) and Q implemented; startup bug fixed (nested router + leftover Vite CSS).
Validation status: the authoring sandbox has no network or node_modules, so `npm run test:run`, `lint` and `build` have NOT been run by Claude.
What WAS done: a stubbed type-check of all source under the project's strict tsconfig flags (exactOptionalPropertyTypes, noUncheckedIndexedAccess, noPropertyAccessFromIndexSignature, noImplicitReturns, noUnusedLocals) found and fixed real errors in new code. Library types were stubbed, so this does not replace `npm run build`.
Backend: OpenCode reported running the backend tests (auth-security and stage-n-security-fixes, 15 passing each).

| Stage | Requirement | Status | Evidence | Remaining work | Dependencies | Tests |
|---|---|---|---|---|---|---|
| A-G | Foundations, auth, public site, shell, dashboard, company, services | IN_PROGRESS | Reported complete earlier; not re-run by Claude | Re-run full suite, lint, build | Local node_modules | Existing |
| H | Team / employees | IN_PROGRESS | Implemented against verified backend contract; static check only | Run test:run, lint, build and fix any failures | Backend gaps 1-6 in copilot.md | 4 files, mock-tested |
| I | Customers (list, search, status filter, create, edit, soft-delete, detail, identities, history) | IN_PROGRESS | Implemented against customerService/Customer model/identity routes; static check only | Run validation; verify against live API with a test tenant | Backend: no pagination, no tags/segments/avatar; empty-email conflict | 4 files, mock-tested |
| J/K | Inbox with human handoff (list, search, status, customer context, message history with auto-refresh, take over / hand back to AI, assignment, staff replies, per-conversation drafts) | IN_PROGRESS | Backend: POST /conversations/:id/replies, PATCH handlingMode/assigneeId, new Conversation.assigneeId (10 backend tests, run in the sandbox with stand-in packages); frontend written against it | Run all suites, try end to end with the website widget. Not done: delivering staff replies on channels other than website chat (no provider connectors), attachments, delivery receipts, typing indicators, real-time push (uses polling) | Backend deploy | backend 10 (run), frontend written, not run |
| K | Messaging | NOT_IMPLEMENTED | | Message list/send per messageService | Stage J | none |
| L | AI agents | NOT_IMPLEMENTED | | Read agent validators first | | none |
| M | Channels (web chat only: set up, agent, allowed websites, brand, embed code, rotate key) | IN_PROGRESS | Backend public widget API + embed script (21 passing backend tests run in the sandbox with stand-in packages); frontend Channels page with tests written | Deploy, run migration, set AI + proxy env vars, run all suites, try on a real site. WhatsApp/SMS/Email/Instagram/Messenger have no provider integrations | Backend deploy; OpenAI key | backend 21 (run), frontend written, not run |
| N | Knowledge bases | NOT_IMPLEMENTED | | | | none |
| O | Documents and RAG | NOT_IMPLEMENTED | | No file upload endpoint confirmed; record-based flow only | Backend | none |
| P | Workflows | NOT_IMPLEMENTED | | Read workflow schema first | | none |
| Q | Audit (filters: action, record type, date range; pagination; redacted metadata) | IN_PROGRESS | Backend GET /audit-logs added (services/auditQueryService.js, routes/auditRoutes.js, permission audit:read); frontend AuditPage built | Deploy backend change, run both test suites | Backend deploy | backend + frontend tests written, not run |
| R | Authorization UX | IN_PROGRESS | `can()` honours `*`; owner role slug is now `owner` (backend fix) so `isOwner()` matches; backend GET /roles added and Team form has a role picker | Fix nav permissions that backend never defines (services:read, settings:read) | Backend deploy + migration script | partial |
| S | Settings | BLOCKED | No settings/profile endpoints confirmed | Backend | Backend | none |
| T | Billing | BLOCKED | No billing endpoints | Honest unavailable page only | Backend | none |
| U | Search | NOT_IMPLEMENTED | Per-list local search exists for Team and Customers | Global search | | partial |
| V | UX states | IN_PROGRESS | Toaster mounted; shared ConfirmDialog; consistent states in H and I | Audit remaining pages | | partial |
| W | Analytics | BLOCKED | No analytics endpoint | Backend | Backend | none |
| X | Accessibility / responsive | IN_PROGRESS | Dialog Escape + role; table captions, labelled controls | Full audit | | none |
| Y | Testing / security / performance | NOT_IMPLEMENTED | | | | none |
| Z | Release readiness | NOT_IMPLEMENTED | | | | none |
