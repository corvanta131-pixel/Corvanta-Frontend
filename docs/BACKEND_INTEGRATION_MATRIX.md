# Backend Integration Matrix

Source of truth: backend source code (routes, controllers, services, models, validators). No endpoint was called live.
Verification column: "code-verified" = read from backend source; "mock-tested" = covered by frontend tests with a mocked API; nothing here is live-verified.

| Feature | Endpoint | Method | Auth / permission | Verified contract | Frontend operation | Verification | Missing backend pieces |
|---|---|---|---|---|---|---|---|
| Employees list | /users/ | GET | users read | `{success,data:[Employee]}`, roleId populated, full list, optional ?status ?department | Team list, local filters | code-verified, mock-tested | pagination |
| Employee detail | /users/:id | GET | employees:read | `{success,data}` | service only | code-verified, mock-tested | |
| Employee create | /users/ | POST | employees:create | name 2-120, email, dept/title 2-100, status active/invited/disabled, managerId | Team add dialog | code-verified, mock-tested | Hardcoded default password; no role assignment UI endpoint; no invite email |
| Employee update | /users/:id | PATCH | employees:update | name and email required even on PATCH | Team edit dialog | code-verified, mock-tested | |
| Employee delete | /users/:id | DELETE | employees:delete | soft delete, returns employee | Team remove dialog | code-verified, mock-tested | |
| Customers list | /customers/ | GET | customers:read | `{success,data:[Customer]}`; filters: status, exact email; no pagination | Customers list, local search | code-verified, mock-tested | pagination, search, sorting |
| Customer create | /customers/ | POST | customers:create | name 2-150, email, phone 2-30, status active/inactive/prospect/archived, notes <=2000 | Add dialog (email required in UI) | code-verified, mock-tested | Second customer without email gets 409 (empty-email duplicate check) |
| Customer update | /customers/:id | PATCH | customers:update | name required on update | Edit dialog | code-verified, mock-tested | |
| Customer delete | /customers/:id | DELETE | customers:delete | soft delete, returns record | Remove dialog | code-verified, mock-tested | |
| Customer detail | /customers/:id | GET | customers:read | `{success,data}` | service only; detail uses list data | code-verified, mock-tested | |
| Identities | /customer-identities/ (?customerId) | GET/POST | customer-identities:read/create | channelType email, whatsapp, instagram, messenger, webchat, sms; externalId 1-255; unique per customer per channel | List and link in detail dialog | code-verified, mock-tested | |
| Identity delete | /customer-identities/:id | DELETE | customer-identities:delete | returns record | Inline confirm remove | code-verified, mock-tested | identity update not wired |
| Customer conversations | /conversations/ (?customerId) | GET | conversations:read | status open/waiting/resolved/archived; fields from Conversation model | Read-only history | code-verified, mock-tested | |

| Roles | /roles/ | GET | roles:read | `{success,data:[{_id,name,slug,permissions,isSystem,createdAt,updatedAt}]}`, company-scoped, platform-admin hidden | Role picker in Team form | NEW backend endpoint; code-verified (written by Claude, not yet deployed), mock-tested | assigning a role requires `roleId` on create/update (supported) |
| Audit logs | /audit-logs/ | GET | audit:read | `{success,data:[{_id,action,entityType,entityId,actor,metadata,createdAt}],pagination:{page,limit,total,totalPages}}`; filters action, entityType, userId, from, to, page, limit (max 100); metadata redacted | Audit page | NEW backend endpoint; mock-tested | read-only by design |
| Conversation list | /conversations/ | GET | conversations:read | `{success,data:[Conversation]}`, no pagination | Inbox list, local search/status filter | code-verified, mock-tested | pagination, server search |
| Staff reply | /conversations/:id/replies | POST | conversations:send | `{body}` (1-5000 chars) -> public message; only when handlingMode is HUMAN and not archived; sets status open->waiting and auto-assigns an unassigned conversation | Inbox reply box | NEW backend endpoint; backend-tested with stubs | delivery to non-widget channels |
| Handoff / assignment | /conversations/:id | PATCH | conversations:update | `handlingMode` AI/HUMAN/HYBRID (AI/HYBRID need an active agent, else 409); `assigneeId` active same-company user or null | Take over, Hand back to AI, Assigned to | NEW backend behaviour; backend-tested with stubs | |
| Conversation status | /conversations/:id | PATCH | conversations:update | `{status}` accepted (open/waiting/resolved/archived) | Status select in Inbox | code-verified, mock-tested | handlingMode/assignment not in allowed update fields |
| Messages | /conversations/:id/messages | GET | conversations:messages:read | latest `limit` (max 100), oldest first; public fields only: senderType, senderId, body, createdAt, metadata(model etc.) | Read-only timeline | code-verified, mock-tested | direction, channel, delivery status are not exposed |

| Widget settings | /channels/:id/widget | GET, PUT | channels:read / channels:update | `{success,data:{channelId,enabled,ready,problems[],widget{key,allowedOrigins,agentId,agentName,agentStatus,title,welcomeMessage,color},embedSnippet}}`; PUT accepts enabled, allowedOrigins (max 10, bare https origins), agentId, title, welcomeMessage, color, rotateKey; the key is generated server-side | Channels page | NEW backend endpoint; backend-tested with stubs, frontend mock-tested | |
| Widget public API | /widget/embed.js, /widget/:key/config, /session, /messages (GET poll, POST send) | GET/POST | none (public key + signed visitor token) | per-channel origin allow-list, rate limits, visitor sees own conversation only | Customer websites | NEW backend endpoints; backend-tested with stubs | real WhatsApp/SMS/email connectors still missing |

## Frontend/backend mismatches found (not yet resolved)
- `src/types/dashboard.ts` `Customer` has tags, avatar, customFields and lastConversationAt that the backend does not provide, and lacks the `prospect` status. Dashboard code still uses it.
- Dashboard hooks send `limit`/`page` to /customers/, which the backend ignores.
- Auth `User.status` type (`inactive`/`pending`) does not match the backend enum (`active`/`invited`/`disabled`).
- Frontend `isOwner()` checks slug `owner`; backend creates the owner role with slug `super-admin`.
