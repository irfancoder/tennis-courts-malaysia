# Product Requirements — Tennis Courts Malaysia (tennis.irfanismail.com)

_Version 0.2 · 7 Oct 2026 · Based on `01-market-study.md`. No technology choices here — this document defines **what** and **why**, not **how**._
_v0.2: owner decisions incorporated (§12). Resource limit: **12 hrs/month**. No keyword-volume validation before launch._

---

## 1. Problem & positioning

**Problem:** A tennis player who is new to an area of Malaysia (foreign visitor, expat, or a Malaysian travelling interstate) can't easily find out:
- **which courts exist**
- **whether they're allowed to play there**
- **how to book and pay**
- **what it costs**

Information is split across Malay-first council portals, partner-only booking apps, stale directories and old forum threads.

**Positioning:** _"Every tennis court in Malaysia — and exactly how to get on it."_
- A tennis-only, English-first directory that answers the **access** question for every court type: public, club, hotel, university, condo, academy.
- Every fact carries a "last verified" date.

**Design principle:** Build for the player with zero local knowledge (no +60 number, no MyKad, no club contacts). If it works for them, it works for locals too. Locals are most of the search volume.

## 2. Target users

| Persona | Description | Key jobs-to-be-done | Priority |
|---|---|---|---|
| **P1 Visiting player** | Foreign tourist or business traveller, 2–10 days, often staying at a hotel | "Can I play near my hotel / in Langkawi this week? Can I, as a non-guest, use that resort court? Do I need a local phone?" | Primary (positioning) |
| **P2 Domestic traveller** | Malaysian travelling to another state (e.g. KL → Penang, KK) | "Where are the public courts in Penang and how do I book them?" | Primary |
| **P3 New resident / expat** | Recently moved, settling into a routine | "Which courts near home are bookable, covered, lit, cheap?" | Secondary |
| **P4 Local player** | Plays regularly, wants alternatives / indoor / cheaper / available court | "Indoor court near me", "how to book Kelana Jaya" | Secondary (largest search volume) |
| **P6 Home-seeker / renter** | Player choosing a condo to rent or buy, wanting a good court at home | "Which condos in Mont Kiara / Bukit Jelutong have tennis courts, and are they any good (surface, lights, number of courts)?" | Secondary (falls out of condo listings, which already exist; see §4.2) |
| **P5 Court owner/operator** | Academy, hotel, club staff | "Correct my listing" | Tertiary (data source) |

**Out of scope as a target audience:** coaches looking for students, pickleball/padel players (Phase 2+ review).

## 3. Goals & success metrics

| Goal | Metric | Target (12 months after launch) [targets are proposals] |
|---|---|---|
| Be the most complete source | Verified venues listed | ~120 at launch → ~250 at month 12 (≈ 10–12 new venues/month within the 12 hr budget); ≥ 80% of known Klang Valley public/commercial venues |
| Be the most trustworthy source | % of venues verified in last 12 months | ≥ 80% |
| Get found | Search impressions & clicks (Google Search Console) | No pre-launch keyword volumes (Keyword Planner not used). Search Console data from month 1–3 sets the baseline; target: impressions growing month over month, and top-10 ranking for "tennis court booking", "book tennis court", "indoor tennis court" and ≥ 5 "[venue] tennis court" queries by month 12 |
| Be useful | Outbound "how to book" actions (portal/WhatsApp/phone/directions clicks) per venue page view | ≥ 25% |
| Stay fresh | User-submitted corrections / month; median days to resolve | ≥ 20 / month; ≤ 14 days |

## 4. Scope

### 4.1 MVP (launch)

**Geography**
- **Klang Valley:** deep coverage. KL, PJ, Subang, Shah Alam, Ampang, Cheras, Putrajaya/Cyberjaya, Puchong.
- **Traveller hotspots:** starter coverage of the main public, commercial and hotel courts in **Penang, Langkawi, Johor Bahru and Kota Kinabalu**.
- **Rest of country:** later, guided by user corrections and analytics.
- **Exception:** venues the owner has played at personally can be listed even if they fall outside these areas, e.g. Kombes Paroi (Seremban, Negeri Sembilan, roughly 1 hr from KL).

**Features**

**F1. Court/venue pages** — one page per venue (see §5 data model). Must show, above the fold:
- access type badge
- price day/night
- how to book (channel + steps)
- covered/lit
- surface
- last verified date

**F2. Access-type taxonomy** (user-facing labels, with plain-English explanations):

| Label | Meaning | Examples |
|---|---|---|
| 🟢 **Open – book online** | Anyone can book via an app or portal | DBKL Tempah KL, MyPJ, Courtsite |
| 🟢 **Open – walk-in / pay at counter** | | |
| 🟢 **Open – book by WhatsApp/phone** | | |
| 🔵 **Open – premium/commercial** | Private operator, anyone can book | Rekt-It, RALLE, Eastin |
| 🟡 **Guest of a member** | A member must sign you in | |
| 🟡 **Reciprocal clubs** | Members of affiliated clubs | |
| 🟡 **Membership required** | Incl. short-term/non-resident memberships | |
| 🟠 **Hotel guests** | Sub-flag: "non-guests may book" (with price) / "non-guests: ask" | |
| 🟠 **Institution** | University/school; sub-flag for public booking windows | |
| 🔴 **Residents & invited guests only** | Condominium/private estate | |
| ⚫ **Status: temporarily closed / under renovation / converted to pickleball / permanently closed** | Status flag, not an access type | |

Booking sub-flags:
- requires MyKad
- requires +60 number
- FPX only
- cash only
- foreigner-friendly (yes / no / unknown)

**F3. Search, browse & filter**
- Browse by state → city/area → venue. Map view and list view.
- "Near me" / near a typed location or hotel name.
- Filters:
  - access type (default: "I can play here without knowing anyone")
  - covered/indoor
  - floodlit
  - surface
  - price band
  - booking channel
  - foreigner-friendly
- **Indoor/covered** must be a first-class filter and also have its own landing page. Market evidence: "indoor tennis court" is a top/rising query, and the rain and heat make covered courts valuable.

**F4. How-to-book guides** (editorial, evergreen, English):
- **Per booking system:**
  - DBKL (KLSPEF / Tempah KL)
  - MBPJ (MyPJ Tempahan)
  - MBSJ (Ezy)
  - MBSA
  - PPJ
  - MBPP Penang
  - Courtsite
  - National Tennis Centre (Jalan Duta)
  - KBS STF portal, for Ministry of Youth & Sports (KBS) youth & sports complexes nationwide (e.g. Kombes Paroi: book online, pay cash at the counter)

  Each guide covers: steps with screenshots, translations of Malay terms, whether passport/foreigner registration works, payment options, receipt/counter requirements, cancellation rules.
- **Per access type:**
  - "How to play at a private club as a visitor" (reciprocal memberships, being signed in, dress codes)
  - "Playing at a hotel court when you're not a guest"
  - "Playing at a condo court" (only as a resident's guest; visitor registration at guardhouse; respect house rules; booking is done by the resident)
  - "University courts: public access"
- **Traveller essentials** (one page):
  - getting a local number/eSIM for OTPs and WhatsApp
  - Touch 'n Go eWallet / DuitNow for visitors
  - FPX limitations
  - heat and best playing hours (before 9am / after 5pm)
  - monsoon seasons by region
  - dress codes
  - bringing or renting gear
  - typical prices
  - court etiquette

**F5. Trust & freshness**
- Every venue and each key field shows **last verified date** and **source type**:
  - visited in person
  - called/WhatsApped venue
  - official website
  - user report (unconfirmed)
- Stale warning when the verification is older than 12 months.
- Change log per venue (e.g. "Mar 2026: 4 courts converted to pickleball").

**F6. Corrections & submissions**
- "Suggest an edit" on every venue page. Structured fields plus optional photo and source.
- "Add a missing court" form.
- Moderation queue for the owner. **Nothing user-submitted goes live without review** at MVP.
- Operator claim path: a lightweight "I manage this venue" contact form, not accounts.

**F7. City / area landing pages** — e.g. "Tennis courts in Penang". Contents:
- summary of options by access type
- cheapest public option
- best covered option
- hotel courts open to non-guests
- link to the relevant how-to-book guides

**F8. Outbound actions** — per venue, as appropriate:
- book online (deep link to portal/app/venue booking page)
- WhatsApp
- call
- directions
- official website

The site does **not** take bookings or payments.

**F9. Content standards**
- English-first; key Malay terms shown alongside (e.g. "gelanggang", "tempahan", "Kompleks Sukan").
- Prices in RM with the date observed.
- Mobile-first: most travellers check on phones.

**F10. "Played here" first-hand notes**
- Venues the owner has personally played at get a **Played here** badge and a short first-hand note, covering:
  - court condition and surface feel
  - lighting quality
  - best time to play
  - crowd levels
  - parking
  - showers
  - how the booking actually went
- This is the main thing that sets the site apart from scraped directories, and it carries the personal-site voice.
- **Launch seed (owner has played):**

| Venue | Category | Access type | Notes for the listing |
|---|---|---|---|
| Tun Razak National Tennis Centre (Jalan Duta) | Federal | Open – book online / counter | Flagship page. Check the status of the 2025–26 facelift; list all aliases |
| Duta International Tennis Academy (Jalan Duta) | Academy | Open – WhatsApp | Show the relationship to the NTC courts it operates from |
| Titiwangsa tennis courts (DBKL) | Council | Open – book online (DBKL) | Anchor example for the DBKL booking guide |
| Kombes Paroi (Kompleks Belia dan Sukan Negeri Sembilan, Paroi, Seremban) | Federal youth & sports complex (KBS) | Open – book online, **pay cash at counter** | Out-of-area exception; first Negeri Sembilan listing. Booking via KBS STF portal (https://stf.kbs.gov.my/ks_user/login.php). A good example of why booking channel and payment method are separate fields |
| Radia Residence, Bukit Jelutong (Shah Alam) | Condominium | Residents & invited guests only | Listed by name (owner-approved). Anchor example for the "Playing at a condo court" guide |
| Springville Residence, Equine Park, Seri Kembangan | Condominium | Residents & invited guests only | Listed by name (owner-approved) |

- Condo listings **are published by name**. They follow the §5 privacy rules. A first-hand note may describe the courts and the guest experience (e.g. registering at the guardhouse) but must never suggest how to get in without a resident.

### 4.2 Phase 2 (only after MVP signals; each item has a go/no-go check)

| Item | Go/no-go signal |
|---|---|
| **Tennis-travel destination guides** (e.g. "Tennis in Langkawi", "Where to play tennis in KL as a visitor") incl. hotels with courts open to outsiders; hotel affiliate links | Venue pages in Penang/Langkawi get traffic; global travel-tennis searches keep rising |
| **Padel courts** as a second sport (same access model) | Malaysian "padel court" Trends index continues ≥ 1.5× y/y; Keyword Planner shows meaningful volume |
| **Expand to remaining states** (Ipoh, Melaka, Kuching, Kuantan, Kuala Terengganu, Alor Setar) | Inbound "add a court" submissions / analytics from those regions |
| **Community links per venue** (Reclub meets, GTN/Facebook groups that play there) | Users ask for partners via feedback form |
| **Operator self-service updates** | ≥ 20 operator claim requests |
| **"Condos with tennis courts" for renters/buyers**: an area hub (e.g. "Condos with tennis courts in Mont Kiara") built from condo listings, adding court count, surface, lights, condition and "Played here" notes; outbound links to rental portals (affiliate only after §9 thresholds). | See evidence note below. Go if condo pages get ≥ 15% of site search impressions in months 1–6 |

**Evidence note: condo + tennis court (indirect, moderate).**
- Property portals already publish pages built around this search: Mudah.my has "condominium for rent … with tennis court facility", and Flatfy, Nuroa and waa2 have "condo for rent Kuala Lumpur tennis court" pages. Portals usually build such pages only where there are searches. This suggests real search demand but also existing competition.
- None of those portals describe the court itself (surface, lights, count, condition). Global Tennis Network lists some condo courts (e.g. MK28, KM1, Sri Penaga, Desa Kudalari) but with stale data and no rental angle.
- **Our edge:** court quality data, which portals don't have.
- **Cost:** low, because condo listings are already in MVP scope. MVP only needs the condo fields captured properly; the hub page waits for the go signal.
- Not yet verified: Google Trends volume for "condo with tennis court" in Malaysia.

### 4.3 Explicitly out of scope (with reason)
- **Booking/payment engine:** incumbents (Courtsite, council portals) exist; this would be a big liability and maintenance burden.
- **Hitting-partner matchmaking:** no measurable search demand; Reclub/GTN already serve it.
- **Coach directory, stringing directory, tournament calendar:** weak demand evidence; LTAM covers tournaments.
- **Pickleball listings:** demand is declining in 2026 and incumbents exist. We only flag tennis courts shared with or converted to pickleball.
- **Real-time court availability:** depends on partner integrations; revisit only if a booking platform offers an open feed.
- **Marketplaces for renting condo courts:** likely breach building by-laws and resident privacy.

## 5. Venue data model (requirements level)

| Group | Fields |
|---|---|
| Identity | Name, alternate names/aliases (e.g. Jalan Duta = National Tennis Centre = Kompleks Sukan Jalan Duta), category (federal / council / club / hotel / university / condo / commercial / academy / school), operator |
| Location | Address, state, city/area, coordinates, nearest landmark / MRT/LRT station, parking notes |
| Courts | Number of courts, surface per court (hard / artificial grass / clay / other), covered/indoor count, floodlit (yes/no/partial), condition notes |
| Access | Access type (F2), who can play, what to bring (IC / passport / member card), guest policy, dress code |
| Booking | Channel(s) (portal URL, app, WhatsApp, phone, counter, walk-in), step summary, link to relevant guide, advance-booking window, max duration, cancellation/rain policy, requires MyKad / +60 number (Y/N/unknown) |
| Pricing | Day rate, night rate, peak/off-peak, guest fee, currency RM, price-observed date |
| Payment | Cash / FPX / Touch 'n Go / DuitNow / card |
| Hours | Opening hours by day, public holiday notes |
| Amenities | Changing rooms, showers, ball machine, racquet rental, coaching available, café, pro shop |
| Status | Open / temporarily closed / renovating / converted / closed; status-since date |
| Trust | Last verified (per field group), verification source type, verified by, change log |
| Media | Photos (own or licensed/user-submitted with permission) |

**Privacy and safety rules**
- **Condo/residential courts:**
  - no resident or management personal contact details
  - no unit numbers
  - no implication that non-residents can enter
  - copy always states "residents and their invited guests only; access is subject to building rules"
- **Clubs:** show published guest/reciprocal policies only; don't publish any member's personal details.
- **Photos:** no identifiable people without consent.

## 6. Content & SEO requirements
- **Target page types**, ordered by evidence:
  1. Venue pages ("[venue] tennis court"; Kelana Jaya already appears as a related query)
  2. Booking guides ("book tennis court", "tennis court booking", "tennis court rental")
  3. Indoor/covered landing page
  4. City/state hubs
  5. Traveller essentials page
- One canonical page per venue, with aliases in the content to capture the different names people search for.
- Seasonal content timing: demand peaks May–Sep. Publish/refresh guides ahead of that.
- Structured data, so pages can show as rich results: local business/sports facility, FAQ for guides.

## 7. Operational requirements (data verification)
- **Launch data collection:** desk research (official pages, council lists, Courtsite/Rezerv venue pages, GTN as a lead list only) → phone/WhatsApp verification → in-person visits for Klang Valley top venues where practical.
- **Re-verification cadence** (sized to 12 hrs/month):
  - every 12 months for all venues
  - immediately on a credible user report
  - **council-level checks:** one check of a council's published rate sheet or portal updates prices for all of that council's venues at once
- A venue enters "stale" state automatically when overdue.
- Correction SLA: review within 14 days.

### 7.1 Time budget (12 hrs/month)

**Pre-launch build**, about 3 months (~36 hrs):

| Work | Hours | Output |
|---|---|---|
| Booking guides (9 systems × ~2 hrs) | ~18 | Booking-system guides with screenshots |
| Traveller essentials + access-type guides | ~4 | Explainer pages |
| Desk + WhatsApp/phone verification (~10 min per venue) | ~14 | ~90–110 venues |

- At launch, venues that are only leads (e.g. from GTN) are either not shown, or shown with an **"Unverified"** label and the conservative access default "ask the venue".

**Steady state, monthly:**

| Work | Hours | Output |
|---|---|---|
| Review corrections and submissions | ~2 | |
| Re-verify due venues | ~3 | ~20 venues |
| Add new venues | ~4 | ~10–12 venues, prioritising hotspots and indoor courts |
| Content upkeep (guides refresh, 1 new article/guide) | ~2 | |
| Review analytics and Search Console | ~1 | |

- **If the budget is exceeded:** drop new-venue additions first. Corrections and re-verification take priority, because trust is the product.

## 8. Non-functional requirements
- Mobile-first, fast on 4G; usable with poor connectivity at courts.
- Accessible (WCAG AA contrast, readable text).
- Works without an account. No login needed for any reader feature.
- Analytics on search queries, filters used and outbound action clicks, privacy-respecting (no personal data collected beyond what a submitter chooses to give).
- Fits the personal-site brand (tennis.irfanismail.com); attribution "maintained by Irfan".

## 9. Monetisation (optional, not a launch goal)
**Owner decision:** this launches as a passion project. Affiliate income is only considered once there is genuine interest.

**What counts as "genuine interest"** (proposed; review at month 6 and month 12). Turn on hotel affiliates only when **all** of these hold for 3 consecutive months:
- ≥ 3,000 monthly visitors
- ≥ 300 monthly visits to hotel-court or travel pages
- unprompted user submissions or messages from outside Malaysia or out of state

In priority order, none required for MVP:
1. Hotel affiliate links on hotel-court pages and travel guides (Phase 2).
2. Featured placement for academies/commercial courts — clearly labelled; must never change access info or ranking of public courts.
3. Sponsorship by gear brands/stringers.

## 10. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Search volume smaller than hoped (not validated pre-launch) | Keep the MVP lean; use Search Console impressions in months 1–3 as the volume signal; lean on booking guides and traveller content that earn links from forums and community groups |
| Stale data erodes trust | F5/F6 + verification cadence; visible dates |
| Council portals change | Guides dated and checked quarterly |
| Liability ("site said I could play there") | Clear disclaimer; source + date on every access claim; conservative default ("ask the venue") when unverified |
| Owner time | Tight geography; corrections from users; Phase 2 only on evidence |

## 11. Open questions
- None outstanding. Earlier questions are resolved in D6–D8.

## 12. Decision log (7 Oct 2026)
| # | Decision |
|---|---|
| D1 | No Keyword Planner validation. Demand is measured after launch through Search Console |
| D2 | Owner time budget is **12 hrs/month**, which sets launch size (~100–120 venues) and the 12-month re-verification cycle (§7.1) |
| D3 | Owner has played at 6 venues; these seed the launch as "Played here" pages (F10) |
| D4 | Passion project first; affiliates only after the "genuine interest" thresholds (§9) |
| D5 | Launch geography: Klang Valley + Penang, Langkawi, Johor Bahru, Kota Kinabalu (plus the owner's out-of-area played venues) |
| D6 | Springville Residence is in Equine Park, Seri Kembangan |
| D7 | Kombes Paroi is booked through the KBS STF portal, cash payment at the counter. The KBS STF booking guide is added to F4 |
| D8 | Condo courts are listed by name. Renters/buyers (P6) are added as a secondary persona, and a "Condos with tennis courts" hub is added as a Phase 2 candidate with a go/no-go signal |
