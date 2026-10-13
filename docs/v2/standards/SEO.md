# Tantu Kala v2 — Search visibility (SEO) plan

Version 0.3 · 11 Oct 2026 · Status: **approved for now** (owner, 10 Oct); agents refine it as work starts

Goal (owner, 9 Oct): Tantu Kala should appear on relevant searches, with SEO and content managed
deliberately and **tested and verified across many kinds of searches**.

Honest expectation: search ranking is earned over weeks to months, and broad terms like
"crochet earrings" are dominated by marketplaces (Amazon, Etsy, Meesho, Myntra). We target the
searches a small handmade brand can realistically win: **brand, long-tail product, occasion,
local, and image/shopping results**. No one can guarantee positions.

## 1. What v1 already does well (checked in code)

Canonical URLs, Open Graph + Twitter cards, `Organization` JSON-LD on the homepage,
`Product` + `Offer` + `BreadcrumbList` JSON-LD on product pages, sitemap, `robots.txt` pointing
to it. **Gap:** breadcrumbs say "Rakhis" for every product; no category/occasion pages exist yet.

## 2. Search intents we target

| Cluster                 | Example searches (to refine with real data)                                                                                    | Landing page                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Brand                   | tantu kala, tantukala crochet                                                                                                  | Home, About                                                        |
| Product type            | handmade crochet jhumka, crochet earrings handmade India, macramé wall hanging, pipe cleaner flowers bouquet, crochet keychain | `/shop/<type>` pages + products                                    |
| Occasion                | handmade rakhi online, crochet rakhi, handmade Diwali gifts, Navratri jewellery handmade, Ganpati decoration handmade          | `/occasions/<occasion>` (stable yearly URLs, not `/diwali-2026`)   |
| Type × occasion         | crochet jhumka for Navratri, macramé Diwali decor                                                                              | Curated combo pages — only where ≥ 3 real products exist           |
| Gifting / custom / bulk | custom crochet gift, personalised handmade gift, bulk handmade return gifts, corporate Diwali gifts handmade                   | Custom order, Bulk order pages                                     |
| Local                   | crochet gifts in <city>, handmade gifts near me                                                                                | Contact/About with location; Google Business Profile (if eligible) |
| Care / how-to (content) | how to wash crochet jewellery, are crochet earrings heavy                                                                      | Short guides linked to products                                    |
| Hindi/Marathi phrasing  | rakhi online handmade, crochet rakhi bhai ke liye                                                                              | Covered through natural copy; separate language pages later        |

## 3. Requirements (folded into REQUIREMENTS as SEO-1…SEO-9)

1. **Indexable landing pages** for each Type and Occasion, plus selected combos, pre-built at
   build time with unique intro copy. Query-parameter filter views (`/shop?occasion=…`) stay for
   shoppers but are canonicalised to the matching landing page / `noindex`, so filters don't
   create thousands of thin duplicate URLs.
2. **Unique title + meta description per page**, generated from product data with sensible
   lengths (title ≤ ~60 characters, description ≤ ~155), overridable per product.
3. **Structured data:** `Product`/`Offer` (INR price, availability), `BreadcrumbList` reflecting
   Type/Occasion, `Organization` (logo, social profiles), `ItemList` on landing pages; add
   shipping and return-policy details where Google's current merchant-listing docs recommend them.
4. **Images:** descriptive file names, alt text (tk-content), multiple sizes, fast loading.
5. **Core Web Vitals:** static pages + small islands already favour this; budgets in NFR-1.
6. **Stable URLs + redirects** (v1 product URLs kept; any rename redirected).
7. **Content:** unique product descriptions (no copied text across products), short category
   intros, 3–5 evergreen guides, yearly-refreshed festival pages.
8. **Off-site:** Google Search Console + Bing Webmaster Tools (free) with the sitemap submitted;
   Google Merchant Center free listings from the product feed (RCH-2 promoted to **Should**);
   consistent links from Instagram, WhatsApp catalog, Pinterest (strong for handmade/craft).
9. **Measurement:** a monthly SEO report from Search Console (queries, impressions, clicks,
   average position, indexed pages) recorded in an "SEO" tab of the Sheet.

## 4. Testing and verification

**Before each release (automated, CI — tk-qa):**

- SEO lint over the built site: every indexable page has one `<h1>`, a unique title and
  description within length limits, a canonical URL, `alt` on product images, no broken internal
  links; sitemap contains every indexable page and none of the `noindex` ones.
- Structured-data validation of every JSON-LD block against schema.org types (build test), plus a
  manual Google Rich Results Test on one page of each template.
- Lighthouse SEO and performance scores on key templates.

**After launch (search test matrix — owner + tk-seo, monthly):**

- A fixed list of ~40 queries across all clusters in §2 (brand, type, occasion, combo, gifting,
  local, care, Hindi/Marathi phrasing, image search, Shopping tab).
- For each: indexed? (Search Console URL inspection), Search Console impressions/position, and a
  manual check in a private window on mobile with the location set to India.
- Results logged per month so trends are visible; actions noted (e.g. "add content to Navratri page").
- Realistic milestones: brand queries within weeks of indexing; long-tail and occasion queries
  over months; broad terms are a stretch goal.

## 5. Decisions (10 Oct 2026)

- **Q-21 — location:** pieces are handmade by the founder in **Delhi**; no shop or office;
  delivery only; the digital store is run from Pune. Consequences:
  - **No Google Business Profile.** Google lists online-only businesses with no face-to-face
    customer contact as ineligible ([eligibility guidelines](https://support.google.com/business/answer/13763036)).
  - Local intent is served honestly through visible content ("handmade in Delhi, shipped across
    India") on About, footer and shipping pages — never fake addresses or city doorway pages.
- **Q-22 — domain:** stay on `tantukala.embox.in`. Use a **URL-prefix property** in Search
  Console for the subdomain (a Domain property would cover all of `embox.in`).
- **Q-23 — languages:** English first. Regional languages are welcome **only as real, visible
  content** — see §6.

## 6. Regional languages — how it actually works

Search engines index what visitors can see. Text added only for search engines (hidden text,
keyword blocks, invisible translations) breaks Google's spam policies and can get the site
demoted. So regional language can't be an "internal text" trick; it must be a real page a
person can read.

Three levels, in order:

1. **Now (free, natural):** English copy that uses the Indian words people actually search with —
   rakhi, jhumka, latkan, Ganpati, Navratri, toran, return gifts — written naturally.
2. **Measure:** after launch, read Search Console queries. If a meaningful share are in Hindi
   (Devanagari or Hinglish), Marathi or another language, that's real demand.
3. **Then add translated landing pages** for the highest-demand pages only (e.g. Diwali gifts,
   rakhi), in their own URLs (`/hi/…`), properly translated and reviewed by a native reader, with
   language annotations (`hreflang`). Product pages stay English unless demand proves otherwise.
   Each language added is ongoing work: every price, policy and campaign change must be updated
   in it too.

Shown where? Translated pages are normal visible pages reached through a small language switcher;
the English homepage stays the default.

## 7. AI search and AI shopping assistants (added 11 Oct 2026)

Goal: when someone asks Google AI Overviews / AI Mode, Gemini, ChatGPT, Perplexity or Claude for
products like ours, Tantu Kala can be found and described correctly.

### 7.1 What actually works (checked 11 Oct 2026)

- **Google: AI search is still search.** Google's 2026 guidance for its generative AI features says
  no special files, markup or rewriting are needed — the same crawlable, helpful pages and
  accurate structured data that rank normally are what AI features draw on
  ([Search Engine Journal on Google's guide](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/),
  [Google: succeeding in AI search](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)).
  Google has also said it doesn't use `llms.txt`.
- **Other assistants crawl with their own bots.** For OpenAI, `OAI-SearchBot` decides whether a
  site can appear in ChatGPT search, `GPTBot` is the training crawler (separate), and
  `ChatGPT-User` fetches pages when a person asks — robots.txt may not apply to it
  ([OpenAI crawler docs](https://developers.openai.com/api/docs/bots)).
- **Cloudflare can block AI bots at the edge** regardless of robots.txt. Its AI Crawl Control
  settings (Security → Bots) and defaults have changed during 2026, so the `embox.in` zone must be
  checked by hand (task SEO-F).
- **AI shopping checkouts** (Google's Universal Commerce Protocol in AI Mode/Gemini, OpenAI's
  Agentic Commerce Protocol, ChatGPT merchant feeds) need a payment gateway and are aimed at large
  or US merchants today — **parked**, consistent with "no payment gateway in v2" (D-17).

### 7.2 What we do (cheap, and the same work as good SEO)

1. **Static HTML with every fact on the page** — already our architecture. Many AI crawlers don't
   run JavaScript, so name, price (₹), made-to-order lead time, materials, size, colours, care,
   delivery coverage and policies are in the HTML, not loaded by script.
2. **Accurate structured data** matching what's visible: Product/Offer, shipping and return
   policy, BreadcrumbList, Organization (SEO-4).
3. **Answer real questions in plain text:** short "Good to know" blocks on product and occasion
   pages and the guides (SEO-6) — e.g. "Are crochet earrings heavy?", "Will it arrive before
   Diwali?". AI answers quote clear, specific sentences.
4. **Consistent identity everywhere:** "Tantu Kala — handmade crochet, macramé and pipe-cleaner
   gifts, made by hand in Delhi, shipped across India" on the site, Instagram, WhatsApp catalog and
   Merchant Center.
5. **Product feeds** (RCH-1/2) — Google's shopping results use Merchant Center product data.
6. **Crawler policy (decided 12 Oct, D-57):** allow AI search and user-triggered crawlers, block
   AI training crawlers — in `robots.txt` **and** Cloudflare's AI Crawl Control, kept in sync. Exact
   bot names are checked against each vendor's current docs when implemented (they change).
7. **Measure:** first-touch tracking already records the referring site, so visits from
   `chatgpt.com`, `perplexity.ai`, `gemini.google.com` etc. show up in the dashboard; Search
   Console's generative-AI reports where available; a monthly manual check of ~15 prompts across
   assistants added to the search test matrix (SEO-9).

**Not doing:** hidden AI-only text, serving different content to bots (cloaking), fake reviews,
AI-written claims we can't back up — they risk penalties and wrong answers about the brand.
`llms.txt` is skipped for now (Google doesn't use it; revisit if an assistant we care about does).

### 7.3 Is it safe?

Making pages readable gives an AI **no more power than any visitor** — it reads public pages.
The risks are the same ones any public shop has, and they're already covered:

| Risk                                                                                                                    | Control                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A bot or AI agent submits fake orders or requests                                                                       | Honeypot + rate limits; **nothing is made or shipped until the owner verifies payment** (T1)                                                                            |
| An AI agent places an order for a real person                                                                           | Fine — it's a normal order through the same checks                                                                                                                      |
| Someone hides instructions in a review or request text to manipulate AI assistants or our own agents (prompt injection) | Reviews shown only after owner approval; user text escaped; agents treat all content as data (T6, T10, T15)                                                             |
| Scraping prices, photos and copy                                                                                        | Already public; robots.txt and Cloudflare decide which AI bots may crawl, but rules are voluntary for some bots — never put anything on a page you wouldn't want copied |
| Crawling cost                                                                                                           | ₹0 — static asset requests are free and unlimited on Cloudflare                                                                                                         |
| AI describes the brand wrongly                                                                                          | Clear, consistent facts on our pages; monthly prompt checks                                                                                                             |
