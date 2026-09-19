# 📚 SOMALIBRARY — COMPLETE DESIGN KIT
### Google Stitch Edition · Somali Flag Blue & White · v0.1.0

Everything you need to build the full design in Google Stitch (stitch.withgoogle.com) is in **this one file**.

**Contents:**
1. [Design System](#part-1--design-system) — colors, fonts, components
2. [Screen Inventory & Batch Plan](#part-2--screen-inventory--batch-plan) — all 23 screens
3. [Stitch Prompts — User App](#part-3--stitch-prompts--user-app-15-screens) — 15 mobile screens
4. [Stitch Prompts — Admin](#part-4--stitch-prompts--admin-8-screens) — 8 desktop screens
5. [Bilingual UI Text](#part-5--bilingual-ui-text-soomaali-english) — Soomaali/English strings
6. [Stitch Workflow Guide](#part-6--stitch-workflow-guide) — step-by-step how-to

---
---

# PART 1 — DESIGN SYSTEM

**Theme: Somali Flag Blue & White** — clean & minimal, mobile-first.

## 1.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | **#4189DE** (Somali flag blue) | Primary buttons, links, active tabs, icons |
| `primary-dark` | **#2B5FA8** | Pressed states, headers, gradients end |
| `primary-light` | **#E8F1FB** | Selected backgrounds, chips, soft highlights |
| `surface` | **#FFFFFF** | Cards, sheets, screen background |
| `background` | **#F7FAFD** | Page background behind cards |
| `text-primary` | **#1A2433** | Headings, body text |
| `text-secondary` | **#5A6B80** | Subtitles, meta text |
| `text-disabled` | **#9AAABB** | Disabled text |
| `success` | **#2FA36B** | ACTIVE status, payment success |
| `warning` | **#E8A33D** | PENDING, "expiring soon" |
| `danger` | **#D9483B** | EXPIRED, errors, delete |
| `divider` | **#E3EAF2** | Lines between list items |

**Gradient:** `#4189DE → #2B5FA8` (135°) for hero header and primary hero buttons only. White text on gradient.

**Contrast rule:** White text only on `primary`, `primary-dark`, and gradients. On `primary-light` use `text-primary`. Never use light gray text on white below #5A6B80.

## 1.2 Typography

| Element | Font | Weight | Size (mobile) |
|---|---|---|---|
| Display (hero titles) | Inter | 700 | 26px |
| H1 screen title | Inter | 700 | 20px |
| H2 section title | Inter | 600 | 16px |
| Body | Inter | 400 | 14px |
| Secondary | Inter | 400 | 12px |
| Caption/label | Inter | 500 | 11px |
| Price | Inter | 700 | 16px |

Scale up ~15% on tablet/desktop. Somali text runs slightly longer than English — allow buttons to grow in height rather than truncating text.

## 1.3 Shape, Spacing & Elevation

- **Corner radius:** cards 16px, buttons 12px, inputs 12px, chips 999px (pill), images 12px
- **Spacing unit:** 4px. Card padding 16px, screen side padding 16px, card gap 12px
- **Elevation:** very soft only — `0 1px 3px rgba(26,36,51,0.08)`. No heavy shadows.
- **Book covers:** aspect 2:3, 12px radius, soft shadow
- **Icons:** outline style, 24px, 2px stroke
- **Touch targets:** minimum 44px height

## 1.4 Status Colors

| Status | Color | Background |
|---|---|---|
| ACTIVE | #2FA36B | #E6F5EE |
| PENDING | #E8A33D | #FBF3E4 |
| EXPIRED | #D9483B | #FBEAE8 |
| CANCELLED | #5A6B80 | #EEF2F6 |

## 1.5 Components

### Buttons
| Variant | Fill | Text |
|---|---|---|
| Primary | #4189DE | white |
| Secondary | #E8F1FB | #2B5FA8 |
| Outline | white + 1px #E3EAF2 border | #1A2433 |
| Danger | #D9483B | white |
| Disabled | #EEF2F6 | #9AAABB |

Height 44px (48px for primary CTAs). Full width on mobile forms.

### Inputs
White background, 1px #E3EAF2 border, 12px radius, label above field, 44px height, focus border #4189DE + soft glow.

### Cards
White, 16px radius, 1px #E3EAF2 border OR very soft shadow (choose one per screen, not both).

### Badges & Chips
Pill shape, 11px text. Filter chips: outline default, filled #4189DE with white text when selected.

### Book Card (core component)
Vertical: cover image (2:3), title (2-line max), author (secondary color), price or badge. Horizontal list variant: 96px cover on the left, title, author, category chip, price row.

### Bottom Navigation (mobile)
5 items: Home, Library, Store, Cart, My Books. Active item = #4189DE icon + 11px label. Inactive = #9AAABB.

### Language Switch
Pill segmented control in the top right: `[ Soomaali | English ]`, active side filled blue with white text.

## 1.6 Layout Principles (Mobile First)

1. Design at **390px width** (iPhone 14 base) in Stitch.
2. Bottom navigation on mobile; side rail on desktop admin.
3. Books displayed as **2-column grid** on mobile, 4–5 columns on desktop.
4. One primary action per screen (blue button). Everything else is secondary/outline.
5. Empty states: simple illustration + one line + one action button.
6. Skeleton loaders (blue-tinted gray blocks) for book grids while loading — Somalia networks need perceived speed.

## 1.7 Stitch Style Prompt (paste into EVERY generation)

```text
Clean minimal mobile-first UI, white cards on a very light blue-gray background (#F7FAFD), Somali flag blue (#4189DE) as the only accent color with darker blue (#2B5FA8) for pressed states, soft shadows, 16px rounded corners, Inter font, outline icons, pill-shaped filter chips, book covers with 2:3 aspect ratio, large touch-friendly 44px buttons, one primary blue action button per screen, bilingual-ready spacing (Soomaali/English), modern fintech-grade polish similar to Google Play Books.
```

## 1.8 Do / Don't

✅ Do:
- Use blue only as accent; keep screens mostly white
- Show price in bold: **$10.00**
- Use status pills for subscription states
- Keep cart icon with badge count always visible in Store

❌ Don't:
- Don't use gradients on small elements — hero only
- Don't show both languages at once (except the language switch itself)
- Don't use red except for EXPIRED/errors/destructive actions
- Don't use dark patterns: renewal is always clearly stated next to price

---
---

# PART 2 — SCREEN INVENTORY & BATCH PLAN

Total: **23 screens** — 15 user + 8 admin. Generate in 6 batches.

**Order of work:** generate batch → review in Stitch → "Refine" only text/spacing errors → export to Figma → next batch.

## 2.1 Batches

| Batch | Screens | Stitch mode |
|---|---|---|
| 1 | S01 Home, S02 Library, S03 Store | Standard mode, one prompt per screen |
| 2 | S04 Book Details, S05 Cart, S06 Checkout | Standard mode |
| 3 | S07 My Books, S08 PDF Reader, S09 Subscription Plans, S10 Payment Result | Standard mode |
| 4 | S11 Login, S12 Register, S13 Profile, S14 Search/Filter, S15 Notifications | Standard mode |
| 5 | A01 Admin Dashboard, A02 Manage Books, A03 Add/Edit Book | Standard mode |
| 6 | A04 Manage Users, A05 Manage Subscriptions, A06 Reports, A07 Audit Logs, A08 Admin Settings | Standard mode |

## 2.2 User App (15 screens)

| ID | Screen | Priority | Key elements |
|---|---|---|---|
| S01 | Home | MVP | Hero with search, continue reading, new books, categories chips |
| S02 | Library | MVP | Book grid, category chips, subscription banner |
| S03 | Store | MVP | Book grid with prices, filter chips, cart icon w/ badge |
| S04 | Book Details | MVP | Cover, meta, description, Read with Subscription + Buy buttons |
| S05 | Cart | MVP | Line items with qty/remove, totals card, Delivery $0 |
| S06 | Checkout | MVP | Order summary, payment method cards, Pay button |
| S07 | My Books | MVP | Tabs: Purchased / Subscription; access dates |
| S08 | PDF Reader | MVP | Full-bleed PDF page, minimal top bar, page slider |
| S09 | Subscription Plans | MVP | 3 plan cards, Standard highlighted "Most Popular" |
| S10 | Payment Result | MVP | Success & expired/failed variants |
| S11 | Login | MVP | Email + password, social row, language switch |
| S12 | Register | MVP | Name/email/password, terms checkbox |
| S13 | Profile | MVP | Avatar, menu list, subscription status card |
| S14 | Search & Filter | MVP | Search field, chip filters, results count |
| S15 | Notifications | MVP | Grouped list: subscription, payment, book events |

## 2.3 Admin Web (8 screens)

| ID | Screen | Priority | Key elements |
|---|---|---|---|
| A01 | Dashboard | MVP | 8 KPI cards + revenue chart + popular books table |
| A02 | Manage Books | MVP | Table with covers, status pills, actions menu |
| A03 | Add/Edit Book | MVP | Form, PDF upload dropzone, toggles Library/Store |
| A04 | Manage Users | MVP | Table, search, status pills, suspend action |
| A05 | Manage Subscriptions | MVP | Plans editor + active subscriptions table |
| A06 | Reports | MVP | Tabs Library/Store, charts, top lists |
| A07 | Audit Logs | MVP | Filterable log table |
| A08 | Admin Settings | Low | Payment providers, admin users, language defaults |

## 2.4 Acceptance checklist (per screen)

- [ ] Mobile-first, fits 390px width (admin: 1440px desktop)
- [ ] Somali flag blue #4189DE only accent
- [ ] Language switch visible (user app)
- [ ] All text has Somali translation ready (see Part 5)
- [ ] Empty + loading states considered
- [ ] Bottom nav shows correct active tab
- [ ] Price always in USD format `$10.00`

---
---

# PART 3 — STITCH PROMPTS: USER APP (15 SCREENS)

**How to use:** Open stitch.withgoogle.com → New project (mobile format) → paste ONE prompt per generation. Prompts already include the style rules — paste the whole block. After generating, use **Refine** for fixes.

## S01 — Home

```text
Design a mobile home screen for "SomaLibrary", a Somali digital library and PDF bookstore app.

STYLE: Clean minimal mobile-first UI, white cards on a very light blue-gray background (#F7FAFD), Somali flag blue (#4189DE) as the only accent color with darker blue (#2B5FA8) for pressed states, soft shadows, 16px rounded corners, Inter font, outline icons, pill-shaped filter chips, book covers with 2:3 aspect ratio, large touch-friendly 44px buttons, one primary blue action button per screen, modern fintech-grade polish similar to Google Play Books.

LAYOUT (top to bottom):
- Status bar area, then a compact top bar: app logo mark (a small blue book icon) with the wordmark "SomaLibrary", and on the right a language switch pill "[ Soomaali | English ]" with "Soomaali" active (blue fill, white text).
- Hero section with a blue gradient (from #4189DE to #2B5FA8), rounded 20px corners, white text: headline "Akhris fudud, qiimo jaban" and subtext "Maktabad dijitaal ah iyo dukaan buugaag PDF". Inside the hero, a rounded white search bar with a search icon and placeholder "Raadi buug, qoraa, ama category...".
- Section title row "Sii wad akhriska" ("Continue reading") with a "See all" link in blue; below it one horizontal card: small book cover on the left, book title "Halaqaadka Nolosha", author, a thin blue reading-progress bar showing 45%, and a "Sii wad" label.
- Section title "Buugag cusub" ("New books"); a horizontal scroll row of 3 book cards (cover 2:3, two-line title, author name in gray, price "$10.00" in bold dark blue or a small blue chip "Library" for subscription books).
- Section title "Categories" as a wrap of pill chips: "Dhammaan", "Taariikh", "Cilmiga", "Fikirka", "Carabiga", "Majado".
- Fixed bottom navigation with 5 items: Home (active, blue), Library, Store, Cart with a small blue badge showing "2", and My Books. Icons outline style, labels 11px.

Tone: trustworthy, calm, fast-loading feel. Show Somali text exactly as written.
```

## S02 — Library

```text
Design a mobile "Library" screen for SomaLibrary, a subscription-based digital library (books readable only with an active monthly subscription).

STYLE: Clean minimal mobile-first UI, white cards on a very light blue-gray background (#F7FAFD), Somali flag blue (#4189DE) as the only accent color with darker blue (#2B5FA8) for pressed states, soft shadows, 16px rounded corners, Inter font, outline icons, pill-shaped filter chips, book covers with 2:3 aspect ratio, large touch-friendly 44px buttons, one primary blue action button per screen, modern fintech-grade polish similar to Google Play Books.

LAYOUT:
- Top bar: title "Maktabadda" left, language switch pill on the right.
- Below the title, a subscription status banner card: left side has a small blue shield/book icon and text "Subscription-kaaga waa FIRFIRAN yahay ilaa 16 Oktoobar 2026" with a small green "ACTIVE" pill; the right side has a small secondary button "Maaree" (Manage).
- A search field "Raadi buug agagaarka maktabadda..." with a filter icon button on its right.
- A wrap of pill filter chips: "Dhammaan" (selected, blue fill white text), "Cusub", "Caan", "Taariikh", "Cilmiga", "Fikirka", "Carabiga".
- Main content: a 2-column grid of 6 book cards. Each card: book cover image (2:3), title max 2 lines, author in gray 12px, and at the bottom a small outline chip "Library" in blue. One card shows a small gray lock icon in the corner to indicate it needs a subscription.
- Fixed bottom navigation, Library tab active.

The screen should feel like a calm reading app: lots of white, blue accents only.
```

## S03 — Store

```text
Design a mobile "Store" screen for SomaLibrary, where users buy individual PDF books in USD.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: title "Dukaanka" left; on the right a cart icon with a blue badge "2" and a small language switch pill.
- A search field with placeholder "Raadi buug iib ah..." plus a filter icon button.
- Pill chips: "Dhammaan", "Cusub", "Caan", "Taariikh", "Cilmiga", "Fikirka" — "Dhammaan" selected.
- A small horizontal promo card with light blue background (#E8F1FB): text "Bixi hal mar, akhri weligaa" and a small arrow.
- 2-column grid of 6 book cards: cover, title, author, bold price "$8.00"–"$15.00" and a small round blue "+" add-to-cart button at the bottom right of each card.
- Fixed bottom navigation, Store tab active.

Commerce feel but still clean and minimal; prices always bold.
```

## S04 — Book Details

```text
Design a mobile book details screen for SomaLibrary showing one book available both in the subscription Library and for purchase in the Store.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar with a back arrow and a share icon.
- Book cover centered-left (large, 2:3, soft shadow) with title "Atomic Habits" (bold 20px) and author "James Clear" (gray) beside it.
- A row of small meta chips: "Self Help", "English", "2018".
- Rating row: 4.5 stars and "1,204" in gray.
- Description paragraph (3 lines) in dark gray.
- Two info cards side by side: card 1 titled "Maktabadda" with a small book icon, text "Ku akhri subscription-kaaga" and a green dot "Available"; card 2 titled "Dukaanka" with price "$10.00" bold and text "PDF weligaaga ah".
- Sticky bottom action area with two buttons: a secondary outline button "Ku akhri subscription" (blue text) and a primary blue button "Iibso PDF — $10.00".

Everything else white and calm; this is the most important screen of the app.
```

## S05 — Cart

```text
Design a mobile shopping cart screen for SomaLibrary's PDF bookstore.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: back arrow, title "Gaadhiga", cart icon with badge.
- 3 cart item cards, each with a small book cover (left), title, author, price on the right, and a remove (trash) icon: "Atomic Habits" $10.00, "Clean Code" $15.00, "Python Basics" $8.00.
- Under the items, an outlined note card with an info icon: "Waa badeecad dijitaal ah. Gelitaan PDF ah oo keligiis ah — wax gaadhi ah ma jiro." (Digital item, no delivery.)
- A totals card: subtotal "$33.00", row "Delivery" with "$0.00" and a tiny gray label "Dijitaal", divider, then "Wadarta guud" "$33.00" in bold 20px.
- Bottom: full-width primary blue button "Sii wad lacag-bixinta" (Continue to payment) and below it a small gray secure-checkout line with a lock icon: "Lacag-bixi ammaan ah".

Empty-state variant (small, under the main design): centered illustration of an empty cart, text "Gaadhigaaga waa madhan yahay", and a blue button "Raadi buug".
```

## S06 — Checkout

```text
Design a mobile checkout screen for SomaLibrary, paying for PDF books in USD.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: back arrow, title "Lacag-bixi".
- Section "Xulashada": 3 collapsed line rows — "Atomic Habits $10.00", "Clean Code $15.00", "Python Basics $8.00", divider, "Wadarta guud $33.00" bold.
- Section "Habka lacag-bixinta": 3 selectable payment option cards stacked vertically, each with a radio circle on the right:
  1. Card with a small mobile-money phone icon: "EVC Plus" — selected, blue border and light blue background.
  2. Card: "ZAAD Service" with its icon placeholder.
  3. Card: "Kaarka bangiga (Visa/Mastercard)" with a card icon.
- Below options, a small gray note: "Marka lacagta la bixiyo, buugaagu wuxuu toos ugu soo galayaa 'Buugaagtayda'." (After payment the book appears instantly in My Books.)
- Bottom sticky area: totals row "$33.00" and a full-width primary button "Bixi $33.00".

Trust and clarity are critical: big text, no clutter.
```

## S07 — My Books

```text
Design a mobile "My Books" (digital bookshelf) screen for SomaLibrary.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: title "Buugaagtayda", language switch on the right.
- A segmented control with two tabs: "La iibsaday" (Purchased, active, blue fill) and "Subscription".
- Under the active tab, a 2-column grid of 4 purchased book cards: cover, title, and a small gray line "La iibsaday: 16 Sep 2026" plus a small blue "PDF" chip.
- Also show a second state below (or as an alternate card row) for the Subscription tab: same grid but each card shows an amber warning line "Waqti ka hadh: 12 maalmood" and a thin blue progress bar of time remaining; one card is grayed out with a red "DHAMMAADAY" (EXPIRED) pill and a small "Dib u cusboonaysii" (Renew) link in blue.
- Bottom navigation with My Books tab active.
```

## S08 — PDF Reader

```text
Design a mobile PDF reader screen for SomaLibrary, reading a book with active subscription access.

STYLE: [same style prompt as S01] — but this screen is mostly the PDF page itself.

LAYOUT:
- Nearly full-screen PDF page (white page, sample text lines, a heading "Habka 1: Wax yar oo maalin kasta").
- Slim translucent top bar overlay: back arrow, book title "Atomic Habits", and a bookmark outline icon.
- Slim bottom bar overlay: a page indicator "128 / 352", a thin slider with a blue thumb, and buttons for contents (list icon) and settings (gear icon).
- Show a small floating pill in the middle-right edge: "Bogga 128" for scroll position.
- Everything else minimal; the reading experience is the hero. Include a subtle user watermark line at the bottom of the PDF page: "© SomaLibrary · user@example.com" in light gray 9px (anti-piracy watermark).
```

## S09 — Subscription Plans

```text
Design a mobile subscription plans screen for SomaLibrary's digital library.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: back arrow, title "Subscription".
- Intro line in gray: "Dooro qorshe si aad u hesho buugaagta maktabadda."
- 3 vertical plan cards stacked, each with plan name, big bold price, "/ bill" suffix, a short feature list with blue check icons:
  1. "Basic — $3/bill": "Buugaag daahiran", "Akhris xaddidan".
  2. "Standard — $5/bill": highlighted card with blue border 2px, a small blue badge on the top right "Most Popular", features: "Buugaag daahiran", "Akhris aan xaddidnayn", "Taariikhda akhriska".
  3. "Premium — $8/bill": "Dhammaan waxyaabaha Standard", "Buugaag cusub oo hore".
- Each card has a button: outline "Dooro" for Basic/Premium, primary blue "Dooro" for Standard.
- Small gray footnote: "Joojin kasta. Qiimaha USD."

This screen must feel honest and simple — prices clearly visible, no dark patterns.
```

## S10 — Payment Result (Success & Failure)

```text
Design a mobile payment result screen for SomaLibrary with TWO states shown one after another.

STYLE: [same style prompt as S01]

STATE 1 — SUCCESS:
- Centered big green circle with a white checkmark.
- Headline "Lacag-bixintii waa la guuleystay!" (Payment successful!)
- Subtext: "Subscription-kaaga 'Standard' waa FIRFIRAN yahay ilaa 16 Oktoobar 2026."
- A receipt card: "Qorshe: Standard", "Qiimo: $5.00", "Taariikh: 16 Sep 2026", "Nooca: EVC Plus", "Ref: SML-2026-00841".
- Primary blue button "Bilow akhriska" and a secondary outline "Buugaagtayda".

STATE 2 — FAILED/EXPIRED:
- Centered amber circle with an exclamation mark.
- Headline "Lacag-bixintu way fashilantay".
- Subtext: "Fadlan isku day mar kale ama isticmaal hab lacag-bixin kale."
- Receipt card same as above but status pill red "FAILED".
- Primary blue button "Isku day mar kale" and a text link "Jooji".
```

## S11 — Login

```text
Design a mobile login screen for SomaLibrary.

STYLE: [same style prompt as S01]

LAYOUT:
- Centered logo: small blue book glyph + "SomaLibrary" wordmark.
- Headline "Ku soo dhawoow" and subtext "Gal akoonkaaga si aad u akhrido."
- Email input "Email", password input "Password" with an eye toggle icon.
- Row: checkbox "I su xeer" (Remember me) and a blue text link "Password illowday?" (Forgot password?).
- Full-width primary blue button "Gal" (Log in).
- Divider with "ama" (or).
- Two outline buttons with icons: "Ku gal Google" and "Ku gal Facebook".
- Bottom: "Akoon ma lihid? Isdiiwaangeli" with "Isdiiwaangeli" in blue.
- Top right corner: language switch pill "Soomaali | English".
```

## S12 — Register

```text
Design a mobile registration screen for SomaLibrary.

STYLE: [same style prompt as S01]

LAYOUT:
- Top: back arrow, small logo.
- Headline "Samee akoon" and subtext "Bilanow, waa bilaash."
- Inputs stacked: "Magaca oo dhan" (Full name), "Email", "Numberka telefoonka" (Phone number, with Somalia flag +252 prefix), "Password" with eye icon, and a helper line "Ugu yaraan 8 xaraf" in gray.
- Checkbox with terms text: "Waan aqbalay Shuruudaha iyo Siyaasada Sirdhigga" with both links in blue.
- Full-width primary blue button "Samee akoon".
- Bottom: "Akoon leh? Gal" with "Gal" in blue.
- Language switch pill top right.
```

## S13 — Profile

```text
Design a mobile profile screen for SomaLibrary.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: title "Profile", language switch on right.
- Profile card: 64px avatar circle with initials "AX", name "Axmed Maxamed", email "axmed@example.com".
- Subscription status card (light blue background #E8F1FB): left small blue crown/book icon, text "Qorshe: Standard · FIRFIRAN" with a green ACTIVE pill, and right side "Dhacaya: 16 Oktoobar 2026"; below, a thin blue progress bar showing days used.
- Menu list card with rows (icon left, label, chevron right):
  "Buugaagtayda", "Taariikhda lacag-bixinta", "Notificationyada", "Luqadda (Soomaali)", "Caawimo & Taageero", "Ka bax" (red text with logout icon).
- Bottom navigation, My Books tab active.
- Small version footer "v0.1.0" in light gray.
```

## S14 — Search & Filter

```text
Design a mobile search screen for SomaLibrary with live filters.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: back arrow and a search input already focused with text "atomic" and an "X" clear icon.
- Below: a horizontal row of filter chips: "Category", "Qoraaga" (Author), "Luqad" (Language), "Sanad" (Year) — each with a small chevron; plus sort pill "Kala sooc" with icon.
- Results meta line in gray: "12 natiijooyin oo 'atomic' ah".
- Result list (vertical rows, not grid): each row has a 60px cover on the left, title, author, category chip and price or "Library" chip on the right.
- One row shows the book "Atomic Habits" by "James Clear" with chips "Self Help" and price "$10.00".
- Show an empty-state variant at the bottom: illustration of a magnifier over a book, text "Natiijooyin la helin" and a gray hint "Isku day kelmadeen kale".
```

## S15 — Notifications

```text
Design a mobile notifications screen for SomaLibrary.

STYLE: [same style prompt as S01]

LAYOUT:
- Top bar: back arrow, title "Ogeysiisyada", and a text button "Akhri dhammaan" in blue.
- Grouped list with section headers in gray caps: "MAANTA", "HORAY".
- Notification rows, each with a colored icon circle:
  - green circle with a check icon: "Lacag-bixintii waa la guuleystay — $5.00" with time "2 saac" and one row unread (small blue dot).
  - blue circle with a book icon: "Buug cusub oo lagu daray maktabadda: 'Taariikhda Soomaaliya'".
  - amber circle with a clock icon: "Subscription-kaagu wuu dhammaanayaa 3 maalmood gudahood." with a blue action link "Cusboonaysii hadda".
  - red circle with an alert icon: "Lacag-bixintii way fashilantay. Fadlan isku day."
- Unread rows have a very light blue background.
```

---
---

# PART 4 — STITCH PROMPTS: ADMIN (8 SCREENS)

Admin is a **desktop web dashboard**. In Stitch choose **Web/Desktop** format for these. Make a separate Stitch project: `SomaLibrary – Admin`.

## A01 — Admin Dashboard

```text
Design a desktop admin dashboard home for "SomaLibrary", a Somali digital library and PDF bookstore platform.

STYLE: Clean minimal admin dashboard UI, white cards on a very light blue-gray background (#F7FAFD), Somali flag blue (#4189DE) as the only accent color with darker blue (#2B5FA8) for pressed states, soft shadows, 16px rounded corners, Inter font, outline icons, pill-shaped status badges, data tables with light row dividers, modern SaaS dashboard polish like Stripe or Linear, left sidebar navigation, English interface.

LAYOUT:
- Left sidebar (240px): logo "SomaLibrary Admin" with a small blue book icon; nav items with outline icons: Dashboard (active, light blue background and blue left border), Books, Users, Subscriptions, Orders, Payments, Reports, Audit Logs, Settings; bottom: admin profile chip "Admin · Ismail" with avatar.
- Top bar: page title "Dashboard", search input, notification bell with dot, and an "Add Book" primary blue button.
- KPI row: 4 stat cards — "Total Users 1,248 (+38 this week)", "Active Subscribers 312", "Books 540 (Library 380 / Store 160)", "Revenue (30d) $4,210" — each with a small icon and a tiny green/red trend arrow.
- Second KPI row: 4 smaller cards — "Total Purchases 892", "Subscription Revenue $1,830", "Book Revenue $2,380", "Active Library Access 312".
- Main area two columns: left (wider) a revenue line chart card "Revenue — last 6 months" with two series (subscription vs book) and a legend; right a card "Popular Books" — a simple table: cover thumbnail, title, author, reads/purchases, trend.
- Below: a wide table "Recent Payments" with columns Ref, User, Type (pill SUBSCRIPTION blue / BOOK_PURCHASE purple-ish blue), Amount bold, Method (EVC Plus, ZAAD, Card), Status pill (SUCCESS green, PENDING amber, FAILED red), Date.

Numbers realistic, layout airy, no clutter.
```

## A02 — Manage Books

```text
Design a desktop "Manage Books" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same left sidebar, Books item active.
- Top bar: title "Books (540)", search input "Search title, author, ISBN...", filter dropdowns for Category and Language, and a primary blue button "+ Add Book".
- Filter chip row: "All 540", "Library 380", "Store 160", "Both 120", "Draft 12".
- Data table with columns: [checkbox] Cover+Title (48px cover thumbnail, title bold, author gray), Category, Language, Library (green check pill "Yes" or gray "No"), Store price ("$10.00" bold or "—"), Status pill (PUBLISHED green, DRAFT amber, ARCHIVED gray), PDF file indicator (small icon with size "2.4 MB"), Updated, row actions (edit pencil, eye, trash) appearing at row end.
- 8 rows of realistic Somali and international book titles; one row selected with light blue background and a floating bulk-action bar at the bottom: "2 selected — Publish, Archive, Delete".
- Pagination footer: "Showing 1–8 of 540" with page buttons.
```

## A03 — Add / Edit Book

```text
Design a desktop "Add Book" admin form for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Books active; breadcrumb "Books / Add New".
- Two-column layout: left main form (60%), right summary card (40%).
- Left form sections in cards:
  1. "Book Info": inputs Title, Subtitle, Author (with autocomplete dropdown showing suggestions), Category select, Publisher, Language select (Somali/English), Publication year, ISBN.
  2. "Description": large textarea with formatting buttons.
  3. "Files": PDF upload dropzone with a dashed blue border, upload icon, text "Drop PDF here or browse — max 50 MB"; below it a cover image upload box showing a 2:3 thumbnail preview with a "Replace" link; a green progress bar "book.pdf — uploaded 100%".
  4. "Availability": two toggle cards — "Library (Subscription)" with helper text "Readable with active subscription" and toggle ON; "Store (Purchase)" with helper "Buy individually in USD" and toggle ON; when Store is ON show a price input "$ 10.00" and a small note.
- Right summary card: live book preview (cover, title, author, price), status select "Published", a small checklist "PDF uploaded ✓ Cover ✓ Price set ✓", primary blue button "Save Book" and outline "Save as Draft", danger text link "Delete".
```

## A04 — Manage Users

```text
Design a desktop "Users" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Users active.
- Top bar: title "Users (1,248)", search "Search name, email, phone...", role filter dropdown (All, Reader, Admin), status filter.
- 4 small stat chips above the table: "Active 1,102", "Suspended 21", "With active subscription 312", "New this week 38".
- Table columns: User (avatar with initials, full name, email gray), Phone (+252...), Joined, Subscription (pill ACTIVE green with end date, or EXPIRED red, or NONE gray), Purchases (count "$86 total"), Status (ACTIVE / SUSPENDED pills), actions (eye, suspend toggle, more).
- One row expanded showing detail drawer on the right side of the layout: user profile, subscription timeline (visual steps: Subscribed → Paid → Active → Expires 16 Oct), recent payments list, purchased books thumbnails, and a "Suspend user" danger button with confirm note.
```

## A05 — Manage Subscriptions

```text
Design a desktop "Subscriptions" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Subscriptions active.
- Top: two tabs — "Plans" and "Active Subscriptions" (Plans active).
- Plans section: 3 plan cards side by side (Basic $3, Standard $5 with "Most popular" badge, Premium $8), each showing editable fields: price input, duration select "1 month", book limit select, status toggle, and small "Edit" button. A dashed "+ New Plan" card.
- Below: table "Recent Subscriptions" columns: User, Plan (chip Basic/Standard/Premium), Started, Expires, Renewals count, Payment ref, Status pill (ACTIVE green, EXPIRED red, PENDING amber, CANCELLED gray), actions.
- A small summary strip: "Active 312 · Expiring in 7 days 41 · Expired 96" as three mini stat cards.
```

## A06 — Reports

```text
Design a desktop "Reports" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Reports active.
- Top bar: title "Reports", date range picker "1 Jan 2026 – 16 Sep 2026", export button "Export CSV".
- Two tabs: "Library" and "Store" (Store active).
- KPI row: "Book Revenue $12,830", "Orders 892", "Avg. Order Value $14.38", "Top Category Self Help".
- Charts area: bar chart "Sales by month" (last 8 months), donut chart "Sales by category" with legend.
- Top lists side by side: "Most-purchased books" (rank, cover, title, purchases, revenue) and "Top spending users" (avatar, name, orders, total spent).
- A secondary tab state hint: Library tab contains reads-per-book table, subscription starts/cancellations chart, and active vs expired donut.
```

## A07 — Audit Logs

```text
Design a desktop "Audit Logs" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Audit Logs active.
- Top bar: title "Audit Logs", filters: date range, admin select, action type select (BOOK_CREATE, BOOK_UPDATE, BOOK_DELETE, USER_SUSPEND, PAYMENT_REFUND, PLAN_CHANGE), search by entity ID.
- Table columns: Timestamp (date + time), Actor (avatar + admin name), Action (mono-style pill: CREATE blue, UPDATE amber, DELETE red, LOGIN gray), Entity ("Book: Atomic Habits", "User: Axmed Maxamed"), Details (short text), IP address in gray mono.
- 10 realistic rows; one DELETE row highlighted with very light red background.
- Pagination footer.
```

## A08 — Admin Settings

```text
Design a desktop "Settings" admin screen for SomaLibrary.

STYLE: [same style prompt as A01]

LAYOUT:
- Same sidebar; Settings active.
- Settings sections as stacked cards:
  1. "General": platform name, default language select (Soomaali), default currency "USD" with note "More currencies later", timezone select.
  2. "Payment Providers": 3 provider rows with toggle switches — "EVC Plus" ON with a "Sandbox" amber chip, "ZAAD Service" ON, "Card Payments (Stripe)" OFF; each row has a "Configure" link and small key mask fields.
  3. "Library Rules": default plan duration "1 month" input, "Grace period after expiry" select (0 days), "Max PDF downloads per month" input "20".
  4. "Admin Users": small table of admins (name, email, role pill Super Admin/Admin, status), "+ Invite Admin" button.
  5. "Danger Zone": card with red border — "Reset audit retention", "Purge expired tokens" with warning text.
- Sticky bottom-right: primary blue "Save Changes" button.
```

---
---

# PART 5 — BILINGUAL UI TEXT (SOOMAALI / ENGLISH)

Use these exact strings in your Stitch designs (keep the Somali in the design). This becomes the seed for `frontend/src/locales/so.json` and `en.json` later.

**Rules:** Show only ONE language at a time (except the language switch itself). Somali text is longer — buttons stretch, never truncate. Currency always USD.

## Common / Guud

| Soomaali | English |
|---|---|
| Raadi buug, qoraa, ama category... | Search books, authors, or categories... |
| Raadi | Search |
| Dhammaan | All |
| Cusub | New |
| Caan | Popular |
| See all / Arag dhammaan | See all |
| Ku akhri subscription | Read with subscription |
| Iibso PDF — $10.00 | Buy PDF — $10.00 |
| Wadarta guud | Total |
| Bixi | Pay |
| Kaydi | Save |
| Jooji | Cancel |
| Dib u cusboonaysii | Renew |
| Ka bax | Log out |
| Gal | Log in |
| Isdiiwaangeli | Register |
| Luqad | Language |
| Soomaali | Somali |
| English | English |
| FIRFIRAN | ACTIVE |
| DHAMMAADAY | EXPIRED |
| SUGAYA | PENDING |
| MAYA | NONE |

## Navigation

| Soomaali | English |
|---|---|
| Guriga | Home |
| Maktabadda | Library |
| Dukaanka | Store |
| Gaadhiga | Cart |
| Buugaagtayda | My Books |
| Profile | Profile |
| Ogeysiisyada | Notifications |

## S01 Home

| Soomaali | English |
|---|---|
| Akhris fudud, qiimo jaban | Easy reading, low price |
| Maktabad dijitaal ah iyo dukaan buugaag PDF | Digital library and PDF bookstore |
| Sii wad akhriska | Continue reading |
| Buugag cusub | New books |
| Categories | Categories |
| Taariikh | History |
| Cilmiga | Science |
| Fikirka | Ideas |
| Carabiga | Arabic |
| Majado | Poetry |

## S02 Library

| Soomaali | English |
|---|---|
| Maktabadda | Library |
| Subscription-kaaga waa FIRFIRAN yahay ilaa 16 Oktoobar 2026 | Your subscription is ACTIVE until October 16, 2026 |
| Maaree | Manage |
| Raadi buug agagaarka maktabadda... | Search the library... |
| Ku akhri subscription-kaaga | Read with your subscription |
| PDF weligaaga ah | PDF is yours forever |

## S03 Store

| Soomaali | English |
|---|---|
| Dukaanka | Store |
| Raadi buug iib ah... | Search books for sale... |
| Bixi hal mar, akhri weligaa | Pay once, read forever |
| Dherer | Add to cart |
| Gaadhi | Cart |

## S04 Book Details

| Soomaali | English |
|---|---|
| Category | Category |
| Luqad | Language |
| Sanad | Year |
| Maktabadda | Library |
| Dukaan | Store |
| Ku akhri subscription-kaaga | Read with your subscription |
| Iibso PDF — $10.00 | Buy PDF — $10.00 |

## S05 Cart

| Soomaali | English |
|---|---|
| Gaadhiga | Cart |
| Waa badeecad dijitaal ah. Gelitaan PDF ah oo keligiis ah — wax gaadhi ah ma jiro. | This is a digital item. Personal PDF access — no delivery. |
| Wadarta guud | Total |
| Sii wad lacag-bixinta | Continue to payment |
| Lacag-bixi ammaan ah | Secure checkout |
| Gaadhigaaga waa madhan yahay | Your cart is empty |
| Raadi buug | Find a book |

## S06 Checkout

| Soomaali | English |
|---|---|
| Xulashada | Order summary |
| Habka lacag-bixinta | Payment method |
| EVC Plus | EVC Plus |
| ZAAD Service | ZAAD Service |
| Kaarka bangiga (Visa/Mastercard) | Bank card (Visa/Mastercard) |
| Marka lacagta la bixiyo, buugaagu wuxuu toos ugu soo galayaa 'Buugaagtayda'. | After payment, the book appears instantly in My Books. |
| Bixi $33.00 | Pay $33.00 |

## S07 My Books

| Soomaali | English |
|---|---|
| Buugaagtayda | My Books |
| La iibsaday | Purchased |
| Subscription | Subscription |
| Waqti ka hadh: 12 maalmood | 12 days remaining |
| DHAMMAADAY | EXPIRED |
| Dib u cusboonaysii | Renew |
| La iibsaday: 16 Sep 2026 | Purchased: Sep 16, 2026 |

## S09 Subscription Plans

| Soomaali | English |
|---|---|
| Subscription | Subscription |
| Dooro qorshe si aad u hesho buugaagta maktabadda. | Choose a plan to access library books. |
| Basic / Standard / Premium | Basic / Standard / Premium |
| / bill | / month |
| Dooro | Choose |
| Ugu caansan | Most popular |
| Joojin kasta. Qiimaha USD. | Cancel anytime. Prices in USD. |

## S10 Payment Result

| Soomaali | English |
|---|---|
| Lacag-bixintii waa la guuleystay! | Payment successful! |
| Lacag-bixintu way fashilantay | Payment failed |
| Fadlan isku day mar kale ama isticmaal hab lacag-bixin kale. | Please try again or use another method. |
| Isku day mar kale | Try again |
| Bilow akhriska | Start reading |
| Qorshe | Plan |
| Qiimo | Amount |
| Taariikh | Date |
| Nooca | Method |
| Ref | Ref |
| FAILED | FAILED |

## S11 Login

| Soomaali | English |
|---|---|
| Ku soo dhawoow | Welcome back |
| Gal akoonkaaga si aad u akhrido. | Sign in to start reading. |
| Email | Email |
| Password | Password |
| I su xeer | Remember me |
| Password illowday? | Forgot password? |
| Gal | Log in |
| ama | or |
| Ku gal Google | Continue with Google |
| Ku gal Facebook | Continue with Facebook |
| Akoon ma lihid? Isdiiwaangeli | No account? Register |

## S12 Register

| Soomaali | English |
|---|---|
| Samee akoon | Create account |
| Bilanow, waa bilaash. | Get started — it's free. |
| Magaca oo dhan | Full name |
| Numberka telefoonka | Phone number |
| Ugu yaraan 8 xaraf | At least 8 characters |
| Waan aqbalay Shuruudaha iyo Siyaasada Sirdhigga | I agree to the Terms and Privacy Policy |
| Samee akoon | Create account |
| Akoon leh? Gal | Have an account? Log in |

## S13 Profile

| Soomaali | English |
|---|---|
| Profile | Profile |
| Qorshe: Standard · FIRFIRAN | Plan: Standard · ACTIVE |
| Dhacaya: 16 Oktoobar 2026 | Expires: October 16, 2026 |
| Buugaagtayda | My Books |
| Taariikhda lacag-bixinta | Payment history |
| Notificationyada | Notifications |
| Luqadda (Soomaali) | Language (Somali) |
| Caawimo & Taageero | Help & Support |
| Ka bax | Log out |

## S14 Search

| Soomaali | English |
|---|---|
| Category | Category |
| Qoraaga | Author |
| Luqad | Language |
| Sanad | Year |
| Kala sooc | Sort |
| 12 natiijooyin oo 'atomic' ah | 12 results for 'atomic' |
| Natiijooyin la helin | No results found |
| Isku day kelmadeen kale | Try a different keyword |

## S15 Notifications

| Soomaali | English |
|---|---|
| Ogeysiisyada | Notifications |
| Akhri dhammaan | Mark all read |
| Maanta | Today |
| Horay | Earlier |
| Lacag-bixintii waa la guuleystay — $5.00 | Payment successful — $5.00 |
| Buug cusub oo lagu daray maktabadda: 'Taariikhda Soomaaliya' | New book in the library: 'Taariikhda Soomaaliya' |
| Subscription-kaagu wuu dhammaanayaa 3 maalmood gudahood. | Your subscription expires in 3 days. |
| Cusboonaysii hadda | Renew now |
| Lacag-bixintii way fashilantay. Fadlan isku day. | Payment failed. Please try again. |

## Admin (English only)

| Term | Meaning |
|---|---|
| Dashboard / Books / Users / Subscriptions / Orders / Payments / Reports / Audit Logs / Settings | Sidebar nav |
| Total Users | Registered accounts |
| Active Subscribers | Users with ACTIVE subscription |
| Book Revenue | Sum of successful BOOK_PURCHASE payments |
| Subscription Revenue | Sum of successful SUBSCRIPTION payments |
| Most popular | Plan badge |
| Sandbox | Payment provider test mode |
| Super Admin / Admin | Role pills |
| PUBLISHED / DRAFT / ARCHIVED | Book status pills |
| CREATE / UPDATE / DELETE / LOGIN | Audit action pills |

---
---

# PART 6 — STITCH WORKFLOW GUIDE

**Stitch:** https://stitch.withgoogle.com — Google's AI tool that turns text prompts into UI designs and exports them to **Figma**. Free with a Google account.

## Step 0 — Prepare (5 minutes)

1. Sign in at stitch.withgoogle.com with your Google account.
2. You will generate **23 screens** in 6 batches (see Part 2).
3. Keep this file open while you work — it has everything: colors (Part 1), prompts (Parts 3–4), strings (Part 5).

## Step 1 — Create the project

1. Click **New project**.
2. Choose format:
   - **Mobile** for the 15 user screens (S01–S15)
   - **Web/Desktop** for the 8 admin screens (A01–A08)
3. Tip: make two Stitch projects — `SomaLibrary – Mobile App` and `SomaLibrary – Admin` — so formats don't clash.

## Step 2 — Generate a screen

1. Copy the full prompt block for one screen (e.g. **S01 Home**) from Part 3 or Part 4. Prompts already include the style rules, so paste the whole block.
2. Paste into Stitch and generate.
3. Read the result against the prompt. Small text errors are normal.

### Refine commands that work well
Use short, specific refine messages, one change at a time:

```text
Make the primary button darker blue #2B5FA8
Reduce all card shadows, keep borders light #E3EAF2
Change the hero gradient to #4189DE → #2B5FA8
Show prices in bold $10.00 format
Add a language switch pill top right: [ Soomaali | English ]
Make bottom nav icons outline style with 11px labels
```

⚠️ If a refine breaks the layout, use **Undo** in Stitch instead of stacking more refinements.

## Step 3 — Keep screens consistent

- Always start from the same **Style Prompt** (baked into every prompt in Parts 3–4).
- After the first screen looks perfect, you can reference it: `"Match the visual style of the previous screen in this project"`.
- Generate **one screen per generation**. Multi-screen generations produce weaker layouts.
- If a screen keeps failing: simplify the prompt — remove 2–3 layout lines and re-run.

## Step 4 — Export to Figma

1. Top right of a screen → **Copy to Figma** / **Export to Figma**.
2. It creates a new Figma file with editable layers.
3. Move it into your team's Figma project and rename frames:
   - `S01-home`, `S02-library`, ... `A01-admin-dashboard`, ...
4. Stitch also gives you **frontend code** (HTML/Tailwind) — save it as a reference for Phase 2, but plan to rebuild in React + Tailwind.

## Step 5 — Review checklist (per screen)

- [ ] Fits mobile width 390px (user app) / desktop 1440px (admin)
- [ ] Blue is the ONLY accent color (#4189DE)
- [ ] Somali strings match Part 5
- [ ] Price format `$10.00` bold
- [ ] Status pills use the right colors (green ACTIVE, amber PENDING, red EXPIRED)
- [ ] Bottom nav active tab correct (user app)
- [ ] Empty/loading state designed or planned

## Step 6 — After design is done

1. Attach each Figma frame to its GitHub Issue (Project Board column: REVIEW).
2. Freeze the design: tag the Figma file as **v0.1 design**.
3. Start Phase 2 (project setup) — Developer 1 builds React screens from these frames while Dev 2/3 start backend and database in parallel.

## Common problems

| Problem | Fix |
|---|---|
| Stitch writes English instead of Somali | Add to refine: `"Use the exact Somali text provided, do not translate"` |
| Screen looks generic/colored | Re-paste the full Style Prompt at the top |
| Layout collapses on refine | Undo, then split the refine into 2 smaller messages |
| Cart badge/progress bars missing | Add them as an explicit refine: `"Add a small blue badge with number 2 on the cart icon"` |
| Stitch uses lorem ipsum | Give exact book titles in the prompt (they are already included) |

---

*SomaLibrary Design Kit v0.1.0 · September 2026 · 🇸🇴 Soomaali | 🇬🇧 English*

