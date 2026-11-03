# ReDom

Real-estate platform for the Russian market: buying/selling, renting and rent management in one product.
Russian is the default language, English is optional. All UI, dates (`DD.MM.YYYY`), numbers (`1 234 567`) and money (`₽`, Intl-based) are locale-formatted.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
```

The app runs on the Base44 platform: entities, authentication and backend functions are provided by it. Publish from the editor to get a public URL.

## Stack

- React 18 + Vite, React Router, TanStack Query
- Tailwind CSS with a token design system (`src/index.css` → `tailwind.config.js`)
- shadcn/ui components, lucide-react icons, recharts, react-leaflet (OpenStreetMap tiles)
- Base44 entities with row-level security, backend functions in `base44/functions/*`

## Project structure

```
src/
  api/                 Base44 SDK client
  components/          layout, listings, search, home, common UI
  hooks/               favorites, theme, page meta
  i18n/                i18n/index.jsx + ru.json + en.json
  lib/                 constants, listings helpers, account context, providers/ (mocked integrations)
  pages/               route screens
base44/
  entities/*.jsonc     schema + RLS per entity
  functions/           nlSearch, trackView, notify
```

## Languages

`ru` is the default and the authoritative one (also for legal documents). `en` is a courtesy translation.
Add a language by creating `src/i18n/<code>.json` and registering it in `LOCALES` / `MESSAGES` in `src/i18n/index.jsx` — nothing else changes. The switcher lives in the header and in Settings; the choice is saved on the user profile (localStorage for guests).

## Mocked integrations (swap table)

| Area | Mock | Replace with |
|---|---|---|
| Payments — card, SBP, refunds | `src/lib/providers/payments.js` | YooKassa / T-Bank in a backend function with secrets |
| SMS | `src/lib/providers/messaging.js` | SMS gateway (SMS.RU etc.) |
| Email | `src/lib/providers/messaging.js` | `SendEmail` integration, recipient's language |
| Telegram | `src/lib/providers/messaging.js` | Telegram Bot API |
| E-signature | `src/lib/providers/esign.js` | Kontur.Signature / Documino |
| Gosuslugi / Rosreestr check | `src/lib/providers/verification.js` | ESIA / Rosreestr in a backend function |
| Maps & geocoding | `src/lib/providers/geo.js` | Yandex Geocoder / 2GIS |
| Escrow | `src/lib/providers/escrow.js` | Bank nominal account API |
| «Мой налог» receipts | `src/lib/providers/tax.js` | lknpd.nalog.ru |

Each file documents exactly which function to replace and the response shape to keep. No API keys are needed for the demo; real providers belong in backend functions where secrets live.

## Environment variables

None required for the demo. Future real integrations use secrets stored in the app dashboard (`Secrets`), for example:
`YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `SMS_API_KEY`, `TELEGRAM_BOT_TOKEN`, `YANDEX_GEOCODER_KEY`, `ESIA_CLIENT_SECRET`.
Never place them in the front-end bundle.

## Roles & access

One account holds several roles (buyer, renter, owner, tenant, agent) — switchable in the header. Administrators additionally manage moderation, users, reports and verifications. Access is enforced with entity-level RLS: owners/tenants see their own leases, invoices, readings and requests; listings are public when published; admin-only operations are server-scoped.

## Test checklist (main flows)

1. **Guest** — open `/`, search rent in Moscow, filter by price/rooms/pets, toggle map view, open a listing, share it.
2. **Buyer/renter** — favourite a listing, save a search, send an inquiry, open the chat thread, attach a file, read receipts.
3. **Owner** — create a listing with photos, reorder them, publish (goes to moderation), archive/restore, boost from Pricing.
4. **Owner** — request a viewing from a listing, confirm/cancel it in `/viewings`.
5. **Admin** — log in as an admin, `/admin`: approve a pending listing, reject with a reason, change a user role, resolve a report.
6. **Language** — switch RU/EN in the header; all screens, dates, prices and plurals must follow; reload keeps the choice.
7. **Settings** — change name/phone, verify the phone with `123456`, toggle notification channels, switch theme.

## Docs

`PROGRESS.md` — phase status, mocks and known limitations.