# 📚 SomaLibrary

> 🇸🇴 Soomaali | 🇬🇧 English
> Digital Library & PDF Book Store for Somalia
> Status: 🧪 **Working frontend prototype** (v0.1.0) + backend scaffold

**SomaLibrary** is a bilingual (Somali/English) digital platform for the Somali market, combining a **subscription-based digital library** with a **PDF book store**. 100% digital — no shipping, no returns, no physical inventory.

```
                 SOMALIBRARY
                     │
          ┌──────────┴──────────┐
          │                     │
      📚 LIBRARY             🛒 STORE
          │                     │
     Pay Monthly              Buy PDF
          │                     │
   Temporary Access       Purchased Access
          │                     │
      Read PDF              Read PDF
          │                     │
       EXPIRES              MY BOOKS
```

## 📦 What's in the repo

| Area | Status | Details |
|---|---|---|
| `frontend/` | ✅ **Working prototype** | 15 user screens + 9 admin screens, Soomaali/English i18n, localStorage mock DB with seed data — runs with `npm run dev` |
| `backend/` | 🟡 Runnable API | Express + TS app (`app.ts`/`server.ts`, `routes/books.ts`), auth/error middleware, multer PDF uploads. Endpoints: health, admin PDF upload, token-gated reader file. No DB schema yet |
| `docs/design/` | ✅ Design kit | Design system + screen inventory + Stitch prompts (see note on implemented theme below) |
| `database/` | ⏳ Planned | MySQL: `schema.sql`, `migrations/`, `seeds/` — not started |
| `storage/` | ✅ In use | Private PDF storage at `backend/storage/` (gitignored, never public). Demo PDFs are tracked in `backend/fixtures/pdfs/` and copied in on the first dev boot |

## 🖥️ Frontend screens (24 total — routes are the source of truth)

**User app (15):**

| Screen | Route |
|---|---|
| Home | `/` |
| Library | `/library` |
| Store | `/store` |
| Book Details | `/book/:id` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Payment Result | `/payment-result` |
| My Books | `/my-books` |
| Reader (immersive, own chrome) | `/read/:id` |
| Plans | `/plans` |
| Login | `/login` |
| Register | `/register` |
| Profile | `/profile` |
| Search | `/search` |
| Notifications | `/notifications` |

**Admin (9, role-gated via `AdminGate` — non-admins redirect to `/`):**

| Screen | Route |
|---|---|
| Dashboard | `/admin` |
| Manage Books | `/admin/books` |
| Add Book | `/admin/books/new` |
| Edit Book | `/admin/books/:id` |
| Manage Users | `/admin/users` |
| Manage Subscriptions | `/admin/subscriptions` |
| Payments | `/admin/payments` |
| Reports | `/admin/reports` |
| Audit Logs | `/admin/audit` |
| Settings | `/admin/settings` |

Language toggle `[ Soomaali | English ]` across the whole app (persisted in `localStorage` as `somalibrary.lang`, default `en`).

## ⚡ Quick Start

```bash
# Frontend (works standalone with mock data)
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend API (needs Node 20+; MySQL is only required for the DB track, #9)
cd backend
npm install
cp .env.example .env # fill in DB + JWT secrets
npm run dev          # http://localhost:4000 — health, PDF upload, reader file
```

**Demo accounts (seeded in `frontend/src/data/db.ts`):**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@somalibrary.so` | `admin123` |
| Reader | `reader@somalibrary.so` | `reader123` |

Seed data: 10 books, 6 categories, 3 plans (Basic $3 / Standard $5 / Premium $8), subscriptions, payments, notifications, audit log. State persists in `localStorage` key `somalibrary.db.v1`; the shapes mirror the planned MySQL schema so a future API swap is a drop-in.

Other useful commands: `npm run build`, `npm run typecheck` (both workspaces).

## 🧱 Tech Stack

- **Frontend:** React 18.3, TypeScript 5.6, React Router 6, Tailwind CSS 3.4, Vite 5 (`frontend/package.json`)
- **Backend:** Node.js, Express 4, TypeScript · JWT + bcryptjs · zod validation · helmet + rate limiting · multer uploads · mysql2 pool (`backend/package.json`)
- **Database:** MySQL (planned — frontend currently uses a localStorage layer, `frontend/src/data/db.ts`)
- **Payments:** Modular (EVC Plus, ZAAD, cards) — USD
- **PDFs:** Private storage, token-based authorized access only (planned)

Existing backend files: `src/config/env.ts`, `src/config/database.ts`, `src/middleware/auth.ts` (`requireAuth` / `requireRole` / `requireAdmin`), `src/middleware/errorHandler.ts` (`ApiError`, `asyncHandler`, zod-aware `errorHandler`).

## 🎨 Design — implemented theme (code is the source of truth)

The running frontend implements a **warm editorial** theme — **not** the Somali-flag-blue concept in the original Stitch prompts:

| Token | Value | Usage |
|---|---|---|
| `primary` / `primary-dark` / `primary-light` | `#0F766E` / `#0A4F4A` / `#E2F0EC` (teal) | Primary buttons, active states |
| `accent` / `accent-dark` / `accent-light` | `#A87C3C` / `#7E5A26` / `#F4EADA` (brass) | Eyebrows, editorial rules, stars |
| `surface` / `canvas` / `inset` / `divider` | `#FFFDF8` / `#F5F0E6` / `#EDE5D6` / `#E3D9C7` | Paper stack |
| `ink` / `ink-soft` / `ink-faint` | `#1B1814` / `#5C5145` / `#6B6052` (warm ink, WCAG AA) | Text |
| `status` success / warning / danger | `#2E7D52` / `#B57A1F` / `#AB3B2C` | Status pills |
| Type | Fraunces (display) + Inter (sans) | Headings serif, body sans |
| Radius / shadow | `card 8px`, `btn 6px`; `soft` / `card` / `lift` / `book` warm shadows | Cards, buttons |
| Cover fallback | Typographic jacket (`Cover.tsx` + jacket CSS in `index.css`) over Open Library art | Grid never shows a broken image |

Source of truth: `frontend/tailwind.config.js` + `frontend/src/index.css` + `frontend/src/components/ui.tsx` (`Button`, `Field`, `StatusPill`, `Chip`, `EmptyState`, `SectionHeader`, icons).

> `docs/design/SOMALIBRARY-DESIGN-KIT.md` Part 1 still describes the original `#4189DE` Stitch concept — kept as design history. Its screen inventory said 23 screens (15+8, missing Payments); the app implements **24 (15+9)** — the kit's addendum now documents the drift.

## 📄 Reader & PDF delivery (prototype)

An admin uploads a PDF in **Admin → Add book**. The file lands in private storage
(`backend/storage/pdfs`, gitignored) under a server-generated UUID name, and the reader
embeds it from the API. There is no public static route for PDFs, so a book can only be
opened through the API — and only on the terms the API allows.

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/health` | none | readiness probe used by the reader |
| `POST /api/books/upload-pdf` | admin Bearer token | multipart field `pdf`; PDF-only, `MAX_PDF_UPLOAD_MB` (default 50) cap, rate limited |
| `GET /api/reader/file/:filename` | reader token | `Authorization: Bearer …` or `?token=…` (an `<iframe>` cannot send headers); a token is scoped to one file |

Copy `backend/.env.example` → `backend/.env`, and `frontend/.env.example` →
`frontend/.env.local` when the API is not on `http://localhost:4000`.

The reader needs the API running — `cd backend && npm run dev` — otherwise it says so
instead of showing an empty frame.

> **Auth is still frontend-only.** Until the API owns users and subscriptions (#9, #10),
> `PDF_DEV_PUBLIC=true` (the development default) lets the reader stream PDFs without a
> token so the demo works. It is **ignored in production**, where a signed, file-scoped
> reader token is always required — and the server refuses to boot with the placeholder
> `JWT_SECRET`.

## 📌 Core Rules (short version)

1. Subscription = temporary library access, expires by date.
2. Store books = individual purchase, added to My Books forever.
3. Library and Store stay **separate systems**.
4. Payment must be verified before access is granted.
5. PDFs are never publicly accessible — they stream through `GET /api/reader/file/:filename`, which requires a signed, file-scoped token (dev shortcut: `PDF_DEV_PUBLIC`).
6. Only admins manage books, users, and plans.

## 🗺️ Roadmap

- [x] Design kit + screen inventory
- [x] Frontend prototype — all screens, i18n, mock data
- [x] Backend scaffold — config, auth/error middleware
- [x] Backend API skeleton — `server.ts` + health, admin PDF upload and reader-file routes
- [ ] Backend API: auth, books, subscriptions, payments, reader tokens
- [ ] MySQL schema + migrations + seeds
- [ ] Payment gateway integrations (EVC Plus, ZAAD)
- [~] Secure PDF delivery — token-gated streaming done; subscription/purchase checks land with #9/#10

---

*Frontend prototype: September 2026 · v0.1.0*
