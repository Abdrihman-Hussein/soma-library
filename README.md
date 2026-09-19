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
| `frontend/` | ✅ **Working prototype** | All 15 user screens + 9 admin screens, Soomaali/English i18n, mock data — runs with `npm run dev` |
| `backend/` | 🚧 Scaffold | Express + TS config (`env`, `database`) and middleware (`auth`, `errorHandler`) in place; API routes/DB schema next |
| `docs/design/` | ✅ Design kit | Single-file design system + Google Stitch prompts for all screens |
| `database/` | ⏳ Planned | MySQL: `schema.sql`, `migrations/`, `seeds/` |
| `storage/` | ⏳ Planned | Private PDF storage (never public) |

## 🖥️ Frontend screens

**User app (15):** Home · Library · Store · Book Details · Cart · Checkout · Payment Result · My Books · Reader · Plans · Login · Register · Profile · Search · Notifications

**Admin (9, role-gated):** Dashboard · Manage Books · Add/Edit Book · Manage Users · Manage Subscriptions · Payments · Reports · Audit Logs · Settings

Language toggle `[ Soomaali | English ]` across the whole app.

## ⚡ Quick Start

```bash
# Frontend (works standalone with mock data)
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend scaffold (needs MySQL — see backend/.env.example)
cd backend
npm install
cp .env.example .env # fill in DB + JWT secrets
npm run dev          # http://localhost:4000
```

## 🧱 Tech Stack

- **Frontend:** React 18, TypeScript, React Router 6, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript · JWT + bcrypt · zod validation · helmet + rate limiting
- **Database:** MySQL
- **Payments:** Modular (EVC Plus, ZAAD, cards) — USD
- **PDFs:** Private storage, token-based authorized access only

## 📌 Core Rules (short version)

1. Subscription = temporary library access, expires by date.
2. Store books = individual purchase, added to My Books forever.
3. Library and Store stay **separate systems**.
4. Payment must be verified before access is granted.
5. PDFs are never publicly accessible — backend authorizes every access.
6. Only admins manage books, users, and plans.

## 🎨 Design Kit (docs/design/)

Everything in **one file**: [`docs/design/SOMALIBRARY-DESIGN-KIT.md`](docs/design/SOMALIBRARY-DESIGN-KIT.md)

| Section | Contents |
|---|---|
| Part 1 | Design system — colors (Somali flag blue #4189DE), typography, components |
| Part 2 | Screen inventory — all 23 screens + 6-batch generation plan |
| Part 3 | Copy-paste Stitch prompts — 15 mobile user screens |
| Part 4 | Copy-paste Stitch prompts — 8 admin desktop screens |
| Part 5 | Soomaali/English UI strings (future locales seed) |
| Part 6 | Step-by-step Google Stitch workflow guide |

## 🗺️ Roadmap

- [x] Design kit + screen inventory
- [x] Frontend prototype — all screens, i18n, mock data
- [x] Backend scaffold — config, auth/error middleware
- [ ] Backend API: auth, books, subscriptions, payments, reader tokens
- [ ] MySQL schema + migrations + seeds
- [ ] Payment gateway integrations (EVC Plus, ZAAD)
- [ ] Secure PDF delivery (token-authorized streaming)

---

*Frontend prototype: September 2026 · v0.1.0*
