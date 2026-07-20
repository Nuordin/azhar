# SEO & Blog Implementation Plan — Azhar Web

**Date:** 2026-07-20
**Scope:** (A) Full on-page SEO for the public site, (B) a new Blog feature (public routes + dashboard CRUD), (C) verification.
**Related:** `plan.md` Phase 3 listed SEO briefly — **this document supersedes and replaces plan.md Phase 3** with full detail.

---

## Rules for the implementer — read first

1. **Follow existing conventions exactly.** This codebase has strong patterns; do not invent new ones:
   - Svelte 5 **runes mode** is forced project-wide (`vite.config.ts`). Use `$props()`, `$state()`, `$derived()` — never `export let` or `$:`.
   - Entity + `*Translations` table pairs in `src/lib/server/db/schema.ts` (see `projects`/`projectTranslations`). Copy that shape for blogs, including the `createdAt`/`updatedAt` column definitions verbatim.
   - Detail URLs are `/{section}/{arabicTitle}-{id}` (see `ProjectCard.svelte:49`). The blog uses the same pattern.
   - Public loaders **always** filter `isPublished = true` and throw `error(404, '...')` in Arabic for missing/unpublished rows (see `src/routes/(site)/projects/[title]-[id]/+page.server.ts`).
   - Dashboard CRUD = `+page.svelte` + `+page.server.ts` (load + named actions) + `state.svelte.ts`, modeled on `src/routes/dashboard/projects/`.
   - The site is Arabic-first, RTL (`app.html` has `lang="ar" dir="rtl"`). User-facing strings go through `svelte-i18n` (`$_('key')`).
2. **i18n gotcha:** locale JSON files are NOT in this repo. They live at `../ASSETS/Locales/*.json` (read by `src/routes/(site)/+layout.server.ts` and served via `/api/locales/[lang].json`). Any new `$_('...')` key you use must also be added to `../ASSETS/Locales/ar.json` (and every other `*.json` present in that folder). If you cannot access that folder, list the required keys in your summary so a human can add them.
3. **Never trust route params or form data.** `Number(params.id)`, validate, 404/`fail(422)` on bad input.
4. After each phase run: `pnpm check` (must stay at 0 errors) and `pnpm exec eslint .`. After everything: `pnpm build` must succeed.
5. Do not refactor unrelated code. If you find a bug outside this scope, note it in your summary — don't fix it here.
6. When you finish, write a short summary of every file created/changed and every manual step remaining (env vars, locale keys, migrations to run in prod).

---

## Part A — SEO foundations

### A0. Prerequisites / shared pieces

**A0.1 — Site constants.** In `src/lib/config.ts` add (keep the existing WhatsApp code untouched):
- `SITE_NAME` — the Arabic brand name (use `'أزهار العقارية'` as placeholder and mark with a `// TODO قبل الإطلاق` comment like the WhatsApp one, so the owner confirms the exact brand string).
- `DEFAULT_DESCRIPTION` — one Arabic sentence (~150 chars) describing the platform (real-estate projects & units in Oman). Also TODO-marked for owner review.

**A0.2 — Slug helper.** Add `slugify(title: string): string` to `src/lib/utils.ts`:
- Trim, collapse whitespace runs to a single `-`, strip characters that break URLs (`/ \ ? # % & " ' < >` and control chars), keep Arabic letters as-is (Arabic in URLs is valid and good for Arabic SEO — browsers percent-encode automatically).
- Must be usable on both server and client (no Node-only APIs).
- Use it everywhere a detail link is built (see A4).

**A0.3 — Reusable `<Seo>` component.** Create `src/lib/components/Seo.svelte`:
- Props (via `$props()`): `title: string`, `description: string`, `canonical: string` (absolute URL), `ogImage?: string` (absolute URL), `ogType?: string` (default `'website'`), `jsonLd?: object | object[]` (optional), `noindex?: boolean` (default false).
- Renders inside `<svelte:head>`:
  - `<title>{title}</title>`
  - `<meta name="description" content={description}>`
  - `<link rel="canonical" href={canonical}>`
  - `<meta property="og:type|og:title|og:description|og:url|og:site_name|og:locale">` — `og:locale` = `ar_OM`, `og:site_name` = `SITE_NAME`, `og:url` = canonical.
  - `<meta property="og:image">` only when `ogImage` is provided.
  - `<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'}>` plus `twitter:title`/`twitter:description` (+ `twitter:image` when available).
  - `<meta name="robots" content="noindex, nofollow">` only when `noindex` is true.
  - When `jsonLd` is provided, a `<script type="application/ld+json">` with `JSON.stringify(jsonLd)`. **Svelte gotcha:** you cannot write a literal `</script>` inside a component template easily and raw JSON must not be interpolated as text. Use the known-safe pattern: `{@html '<script type="application/ld+json">' + JSON.stringify(jsonLd).replace(/</g, '\\u003c') + '</' + 'script>'}`. The `.replace(/</g, '\\u003c')` is **mandatory** — it prevents `</script>` breakout/XSS from data-derived strings.
- Title convention: pass full titles from pages; the component may append ` | ${SITE_NAME}` when the title doesn't already equal `SITE_NAME`. Keep total ≤ ~60 chars where feasible.

**A0.4 — Absolute URLs.** Canonical and og:image must be absolute. Build them in each page from `page.url` (`import { page } from '$app/state'`) or from the loader's `url` — e.g. `new URL(path, url.origin).href`. This is correct in production **only if the `ORIGIN` env var is set** (adapter-node). Note this dependency in your final summary.

### A1. Per-page meta (use `<Seo>` everywhere)

| Route | title | description | ogImage |
| --- | --- | --- | --- |
| `(site)/+page.svelte` (home) | `SITE_NAME` + short Arabic tagline | `DEFAULT_DESCRIPTION` | a static brand image (see note) |
| `(site)/projects/+page.svelte` | Arabic "المشاريع العقارية في عمان" style title | 1 sentence about browsing projects with filters | — |
| `(site)/units/+page.svelte` | Arabic units-listing title | 1 sentence about browsing units | — |
| `(site)/projects/[title]-[id]/+page.svelte` | `{translation.title} — {translation.locationName}` | first ~155 chars of `translation.description` (strip newlines; add `…` if truncated — write a small `truncateForMeta` helper in `src/lib/utils.ts`) | the `isMain` media image, absolute URL |
| `(site)/units/[title]-[id]/+page.svelte` | `{translation.title} — {translation.locationName}` | same truncation of description | `isMain` media image |
| `/blogs` + `/blogs/[title]-[id]` | see Part B | see Part B | cover image |
| every `dashboard/*` page + `/dashboard/sign-in` | anything | anything | `noindex` = true (title like "لوحة التحكم" is fine; these pages must never be indexed) |

Notes:
- Detail pages: `translation` can be `null` (leftJoin). Fall back to `SITE_NAME`/`DEFAULT_DESCRIPTION` if so — never render `undefined` into a meta tag.
- Home ogImage: use an existing brand asset from `src/lib/assets/` if a suitable one exists (`black_building.avif` is acceptable); imported assets get hashed URLs — resolve to absolute with `new URL(imported, page.url.origin).href`.
- List pages with filter/page query params: canonical must point to the **clean** URL without query params (`/projects`, `/units`, `/blogs`) to avoid duplicate-content indexing of every filter combination.

### A2. Canonical slug redirect on detail routes

Titles are user-entered, so `/projects/anything-12` currently resolves. Fix in **all three** detail loaders (projects, units, blogs):
1. After loading the row and its translation, compute `const canonicalSlug = slugify(translation?.title ?? '')`.
2. If `decodeURIComponent(params.title) !== canonicalSlug`, `redirect(301, ...)` to the canonical path (encode the slug segment with `encodeURIComponent` when building the Location path).
3. Keep the existing 404-for-unpublished behavior **before** the redirect check.

### A3. JSON-LD structured data

Build plain objects in each `+page.svelte` (from loader data) and pass as `jsonLd`:
- **Home:** `Organization` — `{ "@context": "https://schema.org", "@type": "RealEstateAgent", name: SITE_NAME, url: origin, logo: <absolute logo URL> }`.
- **Project detail:** `RealEstateListing` with `name`, `description` (truncated), `url` (canonical), `image` (array of absolute media URLs, max ~5), and when `startingPrice` exists: `offers: { "@type": "Offer", price: startingPrice, priceCurrency: "OMR" }`.
- **Unit detail:** same shape; use `unit.price`, and `offers.availability` mapped from `status` (`available` → `https://schema.org/InStock`, else `https://schema.org/SoldOut`).
- **Blog post:** `BlogPosting` — `headline`, `description` (excerpt), `image`, `datePublished` (ISO from `publishedAt`), `dateModified` (ISO from `updatedAt`), `author: { "@type": "Organization", name: SITE_NAME }`, `mainEntityOfPage` = canonical.
- **BreadcrumbList** on all three detail page types: Home → section list → current page (positions 1–3, absolute `item` URLs).
- Omit any property whose value is null/undefined — never emit `"price": null`.

### A4. Link building consistency

Card components currently interpolate raw titles into hrefs. Update `ProjectCard.svelte:49` and `UnitCard.svelte:38` (and the blog card you'll create) to `href="/projects/{slugify(project.title)}-{project.id}"` etc. Check for any other places that build these URLs (`grep -rn '"/projects/\|"/units/' src`) and update them too.

### A5. sitemap.xml

Create `src/routes/sitemap.xml/+server.ts` (GET):
- Query published projects (`id`, `updatedAt`, ar translation `title`), published units (same), published blogs (same). Reuse the same leftJoin+locale pattern as existing loaders.
- Static entries: `/`, `/projects`, `/units`, `/blogs`.
- Emit standard `<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">` XML; per URL: `<loc>` (absolute — build from `url.origin`, with the slug segment percent-encoded via `encodeURIComponent`) and `<lastmod>` (ISO date from `updatedAt`).
- **Escape `&`, `<`, `>` in loc values** (write a tiny `xmlEscape` inline).
- Headers: `Content-Type: application/xml`, `Cache-Control: max-age=0, s-maxage=3600`.

### A6. robots.txt

Replace `static/robots.txt` content with:
```
User-agent: *
Disallow: /dashboard
Disallow: /api/
Allow: /api/locales/

Sitemap: https://<PRODUCTION-DOMAIN>/sitemap.xml
```
Leave a `# TODO: replace <PRODUCTION-DOMAIN>` comment — the real domain must be filled before launch (static files can't read env). Mention this in your summary.

### A7. Defense-in-depth noindex for the dashboard

In `src/hooks.server.ts`, inside the existing handle (after `resolve`), when `event.url.pathname.startsWith('/dashboard')` add response header `X-Robots-Tag: noindex, nofollow`. Simplest way: `const response = await svelteKitHandler(...)`, set the header on it when the path matches, return it.

### A8. Image SEO hygiene

- Every `<img>` on public pages must have meaningful `alt` (project/unit/blog title — check `ProjectCard`, `UnitCard`, `Galary`, `SliderHero`, and the detail pages; fix any empty/missing alts using the entity title, e.g. `alt={project.title}`).
- Below-the-fold images: `loading="lazy" decoding="async"`. Do NOT lazy-load the hero/first gallery image.
- Do not change the media schema for alt text — title-based alt is sufficient for this pass.

### A9. Explicitly out of scope for part A

`hreflang` (only one locale has content), image sitemaps, prerendering, Core Web Vitals work. Do not attempt.

---

## Part B — Blog feature

### B1. Database schema (`src/lib/server/db/schema.ts`)

Append, copying the projects/projectTranslations style **exactly** (same `createdAt`/`updatedAt` sql defaults and `$onUpdate`):

**`blogs` table:**
- `id` integer PK autoincrement
- `category` text enum: `['real_estate_tips', 'market_news', 'development', 'investment', 'company_news']` — notNull, default `'real_estate_tips'`. (Locale-independent slug; Arabic labels come from i18n, see B6.)
- `isPublished` integer boolean, default `false`, notNull ⚠️ note: unlike projects, blogs default to **unpublished** (drafts).
- `publishedAt` integer `timestamp_ms`, nullable — set the first time the post is published, never overwritten after.
- `createdAt` / `updatedAt` — copy from `projects` verbatim.

**`blogTranslations` table:** (mirrors `projectTranslations`)
- `id` PK autoincrement; `blogId` notNull references `blogs.id` onDelete cascade; `locale` text notNull
- `title` text notNull; `excerpt` text notNull (1–2 sentences, doubles as meta description); `content` text notNull (**Markdown source**)
- Indexes on `blogId` and `locale`, named `blog_translations_blogId_idx` / `blog_translations_locale_idx`.

**`media` table change:** add nullable `blogId: integer('blog_id').references(() => blogs.id, { onDelete: 'cascade' })` + `index('media_blogId_idx').on(table.blogId)` alongside the existing projectId/unitId indexes.

**Relations:** add `blogsRelations` (translations: many, media: many), `blogTranslationsRelations` (blog: one), and extend `mediaRelations` with `blog: one(...)`.

**Migration:** run `pnpm db:generate` then `pnpm db:migrate` locally (the README workflow also allows `pnpm db:push` for dev). List "run migration in production" as a remaining manual step in your summary.

### B2. Markdown rendering (server-side, sanitized)

Blog content is Markdown, rendered to HTML **on the server** in the detail loader:
1. `pnpm add marked sanitize-html` and `pnpm add -D @types/sanitize-html`.
2. Create `src/lib/server/markdown.ts` exporting `renderMarkdown(md: string): string`:
   - `marked.parse(md)` (sync mode), then `sanitizeHtml(html, options)`.
   - sanitize-html options: allowed tags = its defaults **plus** `img`, `h1`, `h2`; allowed attributes: `a: ['href', 'name', 'target', 'rel']`, `img: ['src', 'alt']`; `allowedSchemes: ['http', 'https', 'mailto', 'tel']`.
   - **This file must only ever be imported from server code** (it's under `lib/server`, SvelteKit enforces that — keep it there).
3. The detail page renders it with `{@html data.contentHtml}` inside a container styled with the `@tailwindcss/typography` plugin (already installed): `class="prose prose-lg max-w-none"` — verify RTL looks right (typography plugin is direction-aware in v4; if lists/blockquotes look off, add minimal RTL overrides in the page's `<style>`, do not edit global CSS).
4. Sanitization is **not optional** — `{@html}` with unsanitized content is XSS even for admin-authored content.

### B3. Public route: `/blogs` (list)

Create `src/routes/(site)/blogs/+page.server.ts`:
- Load published blogs, ar translation (leftJoin pattern), cover image (leftJoin `media` on `blogId` + `isMain = true`), ordered `publishedAt` DESC (fallback `createdAt` DESC).
- Select: `id, category, publishedAt, title, excerpt, image: media.url`.
- Optional `?category=` filter — validate against the enum list; ignore invalid values (no crash).
- Pagination like the dashboard projects loader (limit 9, `?page=`, return `pagination` metadata) and render prev/next links (`<a>` tags with `?page=` — real links, crawlable, not buttons).
- Wrap queries in try/catch; on error return empty list + log (match `dashboard/projects/+page.server.ts` style).

Create `src/routes/(site)/blogs/+page.svelte`:
- Reuse the **card design from `LatestBlogs.svelte`'s snippet** (image with category chip, title, date, excerpt, "اقرأ المزيد") — extract it into `src/lib/components/BlogCard.svelte` so the list page, and later `LatestBlogs`, share it. Props: `{ id, title, excerpt, category, publishedAt, image }`.
- Card link: `href="/blogs/{slugify(blog.title)}-{blog.id}"`.
- Category chip label: `$_('blogs.category.' + category)` (keys in B6). Category filter UI: simple row of links (`/blogs?category=...` + an "all" link).
- Date display: format `publishedAt` with `new Intl.DateTimeFormat('ar', { dateStyle: 'medium' })`.
- Empty state: friendly Arabic message when no posts.
- `<Seo>`: title "المدونة" style + a one-line Arabic description; canonical `/blogs` (no query params).
- Match the visual language of `projects/+page.svelte` (spacing, heading style, responsive grid `1/2/3` cols).

### B4. Public route: `/blogs/[title]-[id]` (detail)

Create `src/routes/(site)/blogs/[title]-[id]/+page.server.ts`:
- Copy the structure of the project detail loader: validate `Number(params.id)`, load blog + ar translation, `if (!row || !row.blog.isPublished) throw error(404, 'المقال غير موجود')`.
- Canonical slug redirect per A2.
- `contentHtml = renderMarkdown(row.translation?.content ?? '')`.
- Load media for the blog (cover = `isMain`), and 3 "related" posts: latest published, `id != current`, same select shape as the list page.
- Return `{ blog, translation, contentHtml, media, related }`.

Create `+page.svelte`:
- Layout: cover image (if any, `alt={translation.title}`, NOT lazy), category chip, `<h1>` title, publish date, excerpt as lead paragraph, then the `prose` content, then a "مقالات ذات صلة" section of 3 `BlogCard`s, then the existing `ContactUs` component (lead capture — it's already used on other pages).
- `<Seo>` with: title = post title, description = excerpt (truncate ~155), ogType `'article'`, ogImage = absolute cover URL, jsonLd = `BlogPosting` + `BreadcrumbList` (pass as array, per A3).

### B5. Wire up `LatestBlogs.svelte` (home) + navigation

- `src/lib/components/LatestBlogs.svelte`: delete the hardcoded mock array and its local `Project` type. Accept `blogs` via `$props()` (typed like `BlogCard`'s props) and render `BlogCard`s. If `blogs` is empty, render nothing (`{#if blogs.length > 0}` around the whole section) — the home page must not show an empty blog section.
- `src/routes/(site)/+page.server.ts`: add a query for the 3 latest published blogs (same select as list page) and return them; pass into `<LatestBlogs blogs={data.blogs} />` in `(site)/+page.svelte`. Check whether the home page currently renders `LatestBlogs` at all — if it was commented out or absent, add it in the position matching the design (near `ContactUs`/footer end of page).
- Navigation: add a blogs link (`{ name: $_('header.blogs'), href: '/blogs' }`) to the nav list in `Drawer.svelte` (line ~13, after units) **and** the desktop header nav in `(site)/+layout.svelte` **and** the links column in `Footer.svelte` — find the equivalent list in each (`grep -n "header.units" src`).

### B6. i18n keys (add to `../ASSETS/Locales/ar.json`; mirror into any other locale files present)

```
header.blogs = "المدونة"
blogs.title / blogs.description        (list page heading + sub)
blogs.all = "الكل"                     (category filter reset)
blogs.related = "مقالات ذات صلة"
blogs.read_more = "اقرأ المزيد"
blogs.empty                             (empty-state message)
blogs.category.real_estate_tips = "نصائح عقارية"
blogs.category.market_news = "أخبار السوق"
blogs.category.development = "تطوير عقاري"
blogs.category.investment = "استثمار"
blogs.category.company_news = "أخبار الشركة"
```
Also check `new_blogs.title` / `new_blogs.description` already exist (used by `LatestBlogs`). If the ASSETS folder is reachable from this repo (`ls ../ASSETS/Locales`), edit the JSON directly; otherwise list the keys in the summary.

### B7. Dashboard CRUD: `/dashboard/blogs`

Clone the structure of `src/routes/dashboard/projects/` (read all three files there first and mirror them):
- **`+page.server.ts`** — `load`: paginated list (`id`, `title`, `category`, `isPublished`, `publishedAt`) with the same try/catch-and-empty-fallback shape. Actions:
  - `createBlog`: fields `title`, `excerpt`, `content`, `category`, `isPublished`, plus `mediaFiles` + `thumbnailIndex` (cover images). Validate: title/excerpt/content non-empty, category in enum, at least 1 image → `fail(422, { message: <Arabic> })` like the projects action. Insert `blogs` row (set `publishedAt: new Date()` when `isPublished` is true), then `blogTranslations` (locale `'ar'`), then save files + `media` rows with `blogId` — copy the exact upload code from `createProject` (uuid filename, `path.join(process.cwd(), '..', 'ASSETS', 'uploads')`, `/uploads/<name>` URL). ⚠️ If `plan.md` Phase 1.4/2.6 (upload validation / transactions) has been implemented by the time you work, follow the improved pattern that exists in `createProject` at that point — always mirror the current state of the projects action.
  - `updateBlog`: mirror `updateProject` (update both tables, handle `deletedMediaIds`, `mainExistingMediaId`, new files). Rule: `publishedAt` is set only if it is currently null AND the post is being published now.
  - `deleteBlog`: mirror `deleteProject` (delete media files from disk best-effort, then media/translations/blog rows).
  - `togglePublish`: mirror project's, plus the same publishedAt-first-publish rule.
- **`state.svelte.ts`** — mirror `dashboard/projects/state.svelte.ts` (form/dialog state) with blog fields. The content field is a plain `<textarea>` for Markdown — **do not** add a WYSIWYG editor.
- **`+page.svelte`** — mirror the projects dashboard page: table/list with title, category, published toggle, edit + delete buttons, create dialog/sheet with the form fields (title, excerpt, content textarea, category `<select>` with the 5 Arabic labels, publish switch, media picker with thumbnail selection). Reuse whatever UI components the projects page uses (Sheet, switch, etc.).
- **Sidebar/nav:** add a "المدونة" entry wherever the dashboard navigation defines projects/properties links (check `src/lib/components/app-sidebar.svelte` / `nav-main.svelte` and `src/routes/dashboard/+layout.svelte` — add it in the same list the existing two use). The route is auto-protected by the existing `/dashboard` guard in `hooks.server.ts` — verify, don't re-implement auth.

### B8. Sitemap + robots follow-up

Confirm `/blogs` static entry and per-post entries are in the A5 sitemap (they are specified there — this is a checklist reminder, not new work).

### B9. Explicitly out of scope for part B

Comments, tags (category enum only), author profiles, English content, RSS feed, scheduled publishing, drafts preview links. Do not add any of these.

---

## Part C — Verification checklist (run all before declaring done)

1. `pnpm check` → 0 errors. `pnpm exec eslint .` → no new errors. `pnpm build` → succeeds.
2. Migration applied; `pnpm db:studio` shows `blogs`, `blog_translations`, and `media.blog_id`.
3. Manual flow: create a blog post in `/dashboard/blogs` with an image → appears on `/blogs` and home `LatestBlogs` → detail page renders Markdown correctly (headings, lists, links) in RTL.
4. Unpublished post: direct URL `/blogs/x-<id>` returns 404; not in list, home, or sitemap.
5. Slug canonicalization: `/blogs/wrong-slug-<id>` 301s to the correct slug; same for a project and a unit URL.
6. `view-source:` on home, one project, one unit, one blog post: exactly one `<title>`, `description`, `canonical`, OG tags with **absolute** URLs, one JSON-LD script that parses (paste into https://validator.schema.org/ mentally or via a JSON parser — at minimum `JSON.parse` the script contents in a node snippet).
7. `/sitemap.xml` returns valid XML (`curl -s localhost:PORT/sitemap.xml | head`), contains static pages + published entities only, all `<loc>` absolute.
8. `/dashboard` response includes `X-Robots-Tag: noindex, nofollow` header and the sign-in page's HTML contains the robots noindex meta.
9. Markdown XSS test: save a post whose content includes `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` → rendered page must show neither executing (sanitize-html strips them).
10. `robots.txt` served with the new content (needs dev-server restart to pick up static changes).
11. Grep guard: `grep -rn "discription\|catagory" src` → the old typo'd mock fields in `LatestBlogs` are gone.

## Suggested execution order

1. A0 (config, slugify, Seo component) → 2. B1 (schema + migration) → 3. B2 (markdown) → 4. B7 (dashboard CRUD, so you can create test content) → 5. B3/B4 (public blog routes) → 6. B5/B6 (home + nav + i18n) → 7. A1–A4 (meta, canonicals, JSON-LD, links) → 8. A5–A8 (sitemap, robots, noindex header, image hygiene) → 9. Part C verification.

Commit after each numbered step with a descriptive message; do not squash everything into one commit.
