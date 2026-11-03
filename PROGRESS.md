# ReDom — PROGRESS

Platform: Base44 (React + Vite + Tailwind front-end, entity schemas with row-level security, backend functions).
Default and authoritative language: **ru**. Secondary: **en**.

## Status by phase

| Phase | Status | Notes |
|---|---|---|
| 1. Foundation | **Done** | Full entity schema + RLS, multi-role accounts, ru/en i18n with plural rules, app shell (header, footer, switches, theme), home page, profile/settings, admin shell with user & role management, provider interfaces with working mocks. |
| 2. Listings & search | **Done (minus 2 items)** | Create/edit/archive, moderation queue, gallery, map, favorites, saved searches, natural-language search, price-fairness indicator. **Not automated:** price-drop notifications job, self-service "verified owner" request form (badge is granted by an admin today). |
| 3. Communication & viewings | **Done in app, mocks not scheduled** | Inquiry form, in-app chat with attachments + read receipts + unread counters, viewing request / confirm / cancel, notification centre, per-type channel preferences. **Not automated:** owner-defined viewing slots, reminder scheduler, real email/Telegram delivery (mocked). |
| 4. Rent management | **Not started** (schema ready) | Lease / Invoice / Payment / MeterReading / MaintenanceRequest entities and RLS exist; no UI, no invoice generator, no payment flow. |
| 5. Deals & documents | **Not started** (schema ready) | Deal / Document entities exist; no kanban, generator, e-sign or escrow UI. |
| 6. Trust, agents, monetization | **Not started** (schema ready) | Review / Report (reports work in admin) / Agency / Lead / Subscription entities exist. |
| 7. Polish & QA | **Partial** | Localized document meta + hreflang + canonical, 404 handling, print styles, mobile-first layouts, translation-key audit (0 missing keys). Neighborhood pages, full a11y pass and SEO report not done. |

**Continue from Phase 4.**

## What is mocked

| Provider | File | Where to swap |
|---|---|---|
| Payments (card, SBP, refunds) | `src/lib/providers/payments.js` | Move server-side into a backend function, call YooKassa / T-Bank API with secrets. |
| SMS | `src/lib/providers/messaging.js` | Backend function + SMS gateway (e.g. SMS.RU). Demo code: `123456`. |
| Email | `src/lib/providers/messaging.js` | Platform `SendEmail` integration / Resend, rendered in recipient's language. |
| Telegram bot | `src/lib/providers/messaging.js` | Telegram Bot API `sendMessage`. |
| E-signature | `src/lib/providers/esign.js` | Kontur.Signature / Documino. |
| Gosuslugi / Rosreestr verification | `src/lib/providers/verification.js` | Backend function + ESIA / Rosreestr APIs. |
| Maps / geocoding | `src/lib/providers/geo.js` | Yandex Geocoder / 2GIS (map tiles are OpenStreetMap). |
| Escrow / safe settlements | `src/lib/providers/escrow.js` | Bank nominal account API. |
| «Мой налог» receipts | `src/lib/providers/tax.js` | lknpd.nalog.ru OAuth. |

Other mocks: natural-language search calls an LLM (`base44/functions/nlSearch`) — real; viewing reminders, invoice scheduling and notification fan-out are not scheduled (no cron job yet).

## Known limitations

- **Login** uses the platform's secure authentication (email/password or provider). The requested phone + SMS login is represented by phone verification in Settings with the demo code `123456`; the platform owns the auth backend, so a custom SMS login page is not implemented.
- Seeded demo listings are published by the demo agency accounts (`owner_user_id` empty) — they are browsable and searchable, but "message the owner" for them only stores an inquiry. Listings created in the app behave fully.
- Listing photos are stored publicly (marketing assets); chat attachments are stored privately and opened through signed URLs.
- No automated price-drop / saved-search alert job yet (badge + matches count only).
- Invoice/contract PDFs will be produced via the print stylesheet (Cyrillic-safe) rather than a server PDF generator.

## Roles

`roles` array on the user (buyer, renter, owner, tenant, agent) + built-in `role` (user/admin). Active role is switchable in the header. Permissions are enforced by entity RLS, not only by the UI: leases/invoices/readings/maintenance are readable only by the two parties or an admin; payments are writable by admins/service role only; moderation, verifications, reports and audit log are admin-only.

## Data model

User, Property, Listing, Media, Favorite, SavedSearch, Inquiry, Viewing, Conversation, Message, Notification, Lease, Invoice, Payment, MeterReading, MaintenanceRequest, Deal, Document, Review, Report, Agency, Lead, Subscription, AuditLog, Partner, AppSetting.
`DealStage` is an enum on `Deal`; `LeaseParty` is represented by `owner_user_id` / `tenant_user_id` (+ `split` for co-tenants).