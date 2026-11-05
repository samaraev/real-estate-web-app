# ReDom — PROGRESS

Platform: Base44 (React + Vite + Tailwind front-end, entity schemas with row-level security, backend functions).
Default and authoritative language: **ru**. Secondary: **en**.

## Status by phase

| Phase | Status | Notes |
|---|---|---|
| 1. Foundation | **Done** | Full entity schema + RLS, multi-role accounts, ru/en i18n with plural rules, app shell (header, footer, switches, theme), home page, profile/settings, admin shell with user & role management, provider interfaces with working mocks. |
| 2. Listings & search | **Done (minus 2 items)** | Create/edit/archive, moderation queue, gallery, map, favorites, saved searches, natural-language search, price-fairness indicator. **Not automated:** price-drop notifications job, self-service "verified owner" request form (badge is granted by an admin today). |
| 3. Communication & viewings | **Done in app, mocks not scheduled** | Inquiry form, in-app chat with attachments + read receipts + unread counters, viewing request / confirm / cancel, notification centre, per-type channel preferences. **Not automated:** owner-defined viewing slots, reminder scheduler, real email/Telegram delivery (mocked). |
| 4. Rent management | **Done (manual month close)** | `/rent` hub with owner / tenant sides: dashboard KPIs, leases, invoices, meter readings, maintenance requests, 6-month income report with CSV export. Lease creation, contract page with terms/parties/checklists/renew/terminate/sign, invoice generation (single + for the whole month), partial and full online payment through the gateway, owner-recorded cash payments, reminders, tenant join link, meter approvals feeding utilities into the next invoice. |
| 5. Deals & documents | **Done (escrow & e-sign mocked)** | `/deals` pipeline board with drag & drop between stages plus a list view, deal detail with checklist, notes, escrow panel, commission and follow-up date; `/documents` list with type filter, generator (sale contract / tenancy / handover act / deposit receipt in ru+en), document view with parties, sections, signatures, send-to-sign, EN copy and print. |
| 6. Trust, agents, monetization | **Not started** (schema ready) | Review / Report (reports work in admin) / Agency / Lead / Subscription entities exist. |
| 7. Polish & QA | **Partial** | Localized document meta + hreflang + canonical, 404 handling, print styles, mobile-first layouts, translation-key audit. Neighborhood pages, full a11y pass and SEO report not done. |

**Continue from Phase 6.**

## Rent management (phase 4) — how it works

- **Owner side:** create a lease from one of your for-sale/rent listings (`/rent` → «Создать договор»), share the tenant link (`/rent/leases/:id` → «Ссылка для жильца»), generate invoices for one lease or for every active lease of the month, record cash/bank payments, send reminders, approve meter readings with a cost, close maintenance requests with a cost, export the 6-month report to CSV.
- **Tenant side:** accept the lease from the invite link (must be signed in with the email the owner entered), pay an invoice in full or in part, submit meter readings with a photo, create maintenance requests and comment on them.
- **Backend functions:** `rentInvoices` (generate / generateAll / remind), `rentPayments` (pay / markPaid), `rentJoin` (link tenant by email). Money and period helpers live in `base44/shared/rent.ts`.
- **Not automated:** the monthly run is a button, not a scheduled job — a workflow on Builder+ can call `rentInvoices` with `generateAll` once a service identity is available. Late fees are stored on the lease (`late_fee_rule`) but not charged automatically.

## Deals & documents (phase 5) — how it works

- **Pipeline:** a deal is created from one of your listings (object and price prefill), starts at «Заявка» and moves through viewing → offer → deposit → documents → closing → won, or is cancelled. Stages change by dragging a card on the board, from the list view or from the deal page.
- **Deal page:** six-step checklist (passport, title extract, spouse consent, contract, handover act, receipt), escrow panel (open → funds received → release, or refund), notes with timestamps, and the deal's own documents.
- **Documents:** generated from a deal or a lease in Russian (authoritative) or English, stored with a rendered `content` snapshot, signed with the demo e-signature provider (`signatures[]` + status draft → sent → partially signed → signed), printable and duplicable as an English copy.

## What is mocked

| Provider | File | Where to swap |
|---|---|---|
| Payments — checkout in the browser | `src/lib/providers/payments.js` | Kept for reference; the rent flow actually settles server-side. |
| Payments — rent settlement | `base44/functions/rentPayments` | Move to YooKassa / T-Bank API with secrets; the demo gateway always approves. |
| SMS | `src/lib/providers/messaging.js` | Backend function + SMS gateway (e.g. SMS.RU). Demo code: `123456`. |
| Email | `src/lib/providers/messaging.js` | Platform `SendEmail` integration / Resend, rendered in recipient's language. |
| Telegram bot | `src/lib/providers/messaging.js` | Telegram Bot API `sendMessage`. |
| E-signature | `src/lib/providers/esign.js` | Kontur.Signature / Documino. |
| Gosuslugi / Rosreestr verification | `src/lib/providers/verification.js` | Backend function + ESIA / Rosreestr APIs. |
| Maps / geocoding | `src/lib/providers/geo.js` | Yandex Geocoder / 2GIS (map tiles are OpenStreetMap). |
| Escrow / safe settlements | `src/lib/providers/escrow.js` | Bank nominal account API. |
| «Мой налог» receipts | `src/lib/providers/tax.js` | lknpd.nalog.ru OAuth. |

Natural-language search calls an LLM (`base44/functions/nlSearch`) — real. Notification fan-out is `base44/functions/notify` + service-role inserts from the rent functions; delivery beyond in-app is mocked.

## Known limitations

- **Login** uses the platform's secure authentication (email/password or provider). The requested phone + SMS login is represented by phone verification in Settings with the demo code `123456`; the platform owns the auth backend, so a custom SMS login page is not implemented.
- Seeded demo listings are published by the demo agency accounts (`owner_user_id` empty) — they are browsable and searchable, but "message the owner" for them only stores an inquiry. Listings created in the app behave fully.
- A lease can only be linked to a tenant account whose email matches the tenant email on the lease; there is no user directory lookup by email.
- Listing photos are stored publicly (marketing assets); chat attachments, meter photos and maintenance photos are stored privately and opened through signed short-lived URLs.
- No automated price-drop / saved-search alert job yet (badge + matches count only).
- Invoice/contract PDFs are produced via the print stylesheet (Cyrillic-safe) rather than a server PDF generator.

## Roles

`roles` array on the user (buyer, renter, owner, tenant, agent) + built-in `role` (user/admin). Active role is switchable in the header. Permissions are enforced by entity RLS, not only by the UI: leases/invoices/readings/maintenance are readable only by the two parties or an admin; payments are writable by admins/service role only; moderation, verifications, reports and audit log are admin-only.

## Data model

User, Property, Listing, Media, Favorite, SavedSearch, Inquiry, Viewing, Conversation, Message, Notification, Lease, Invoice, Payment, MeterReading, MaintenanceRequest, Deal, Document, Review, Report, Agency, Lead, Subscription, AuditLog, Partner, AppSetting.
`DealStage` is an enum on `Deal`; `LeaseParty` is represented by `owner_user_id` / `tenant_user_id` (+ `split` for co-tenants).