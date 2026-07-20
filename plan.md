# Production Readiness Plan — Azhar Web

**Date:** 2026-07-20
**Verdict: NOT production ready yet.**

The good news: the build passes (`pnpm build`, adapter-node), `svelte-check` reports **0 errors**, public pages correctly filter by `isPublished`, the dashboard is auth-gated in `hooks.server.ts`, and secrets are not committed to git. The core product works.

However, there are security holes, functional launch blockers, and operational gaps that must be fixed before going live. They are listed below in priority order.

---

## Phase 1 — Security blockers (must fix before launch)

### 1.1 Unpublished content leaks through the public API
`src/routes/api/projects/[id]/+server.ts` and `src/routes/api/units/[id]/+server.ts` return **any** project/unit by ID with no auth and no `isPublished` check. Anyone can enumerate IDs and read unpublished drafts, prices, and media. The site pages filter correctly — only these JSON endpoints leak.
- If these endpoints are only used by the dashboard: move them under auth (check `locals.user`).
- If they are meant to be public: add `isPublished = true` to the query.

### 1.2 Path traversal in the uploads endpoint
`src/routes/uploads/[fileName]/+server.ts` does `path.join(uploadDir, fileName)` with the raw route param. URL-encoded traversal (e.g. `..%2F..%2F`) decodes into the param and can escape the uploads directory, exposing arbitrary readable files (including `sqlite.db`, which lives in the *same* `../ASSETS` parent folder).
- Sanitize with `path.basename(fileName)` (or reject any name containing `/`, `\`, or `..`), then verify the resolved path is still inside the uploads dir (`resolved.startsWith(uploadRoot + path.sep)`).
- Consider an extension allowlist and returning 404 for anything else (currently it also happily serves `.svg` with `image/svg+xml`, a stored-XSS vector).

### 1.3 Hardcoded admin credentials committed to git
`src/lib/server/db/seed-admin.ts` contains `admin@onewayestate.com` / `securePassword123!` and this is in git history.
- Read the email/password from environment variables instead.
- If this seed has ever been run against the real database, **rotate that password immediately** — treat it as compromised.

### 1.4 No validation on uploaded files (dashboard actions)
`src/routes/dashboard/projects/+page.server.ts` and `properties/+page.server.ts` accept any file: no MIME/extension allowlist, no size cap, and the stored extension comes straight from the user's filename (`file.name.split('.').pop()`), so `.html`/`.svg` can be stored and later served. Admin-only mitigates this, but a single compromised admin session becomes stored XSS on the public site.
- Allowlist extensions/MIME types (jpg, jpeg, png, webp, gif, avif, mp4), cap per-file size, and derive the extension from the validated MIME type rather than the filename.

---

## Phase 2 — Functional launch blockers

### 2.1 Placeholder WhatsApp number
`src/lib/config.ts` still has `WHATSAPP_NUMBER = '96890000000'` with an explicit "TODO before launch" comment. **All** lead-generation flows (ContactUs, BookViewing) send customers to this fake number. Replace with the real business number (this is the site's only conversion channel — nothing else captures leads).

### 2.2 Uploads will fail in production (body size limit)
adapter-node limits request bodies to **512 KB by default** (`BODY_SIZE_LIMIT`). The dashboard uploads multi-megabyte images/videos via form actions — these will be rejected in production even though they work in `vite dev`. Set `BODY_SIZE_LIMIT` (e.g. `100M` or `Infinity` behind a proxy limit) in the production environment and document it.

### 2.3 Fragile `process.cwd()`-relative paths
DB (`DATABASE_URL=../ASSETS/sqlite.db` per README) and uploads (`path.join(process.cwd(), '..', 'ASSETS', 'uploads')` in three files) resolve relative to **wherever the node process is launched from**. Start `node build` from a different directory and the app silently uses/creates a different DB and uploads folder.
- Introduce a single `ASSETS_DIR` (or `UPLOADS_DIR`) env var with an absolute path in production, used by the upload actions, the uploads endpoint, and `DATABASE_URL`. Add it to `.env.example` and `src/env.ts`.

### 2.4 Required production environment not enforced
`.env.example` ships `ORIGIN=""` and empty secret. In production:
- `ORIGIN` must be the real https URL (adapter-node needs it for form-action CSRF checks; better-auth uses it as `baseURL`).
- `BETTER_AUTH_SECRET` must be a fresh high-entropy value (never reuse the dev one).
- Note: `src/env.ts` declares vars via `defineEnvVars`, but `auth.ts`/`db/index.ts` read `process.env` + `dotenv` directly — unify on one mechanism so missing vars fail fast at boot.

### 2.5 Unhandled errors → raw 500s in dashboard actions
In `createProject`/`updateProject` (both dashboards), `JSON.parse(formData.get('amenities') …)` runs **outside** the try/catch — malformed input crashes the action with an unstyled 500 instead of a `fail(422)`. Same for `new Date(deliveryDateStr)` producing Invalid Date. Wrap parsing or validate before parsing.

### 2.6 Multi-step DB writes are not transactional
Create/update/delete actions perform 3+ sequential inserts/updates/deletes (project → translations → media). A failure mid-way leaves orphaned rows (e.g. a project with no translation, which then breaks list joins). better-sqlite3 is synchronous — wrap each action's DB work in `db.transaction(...)`.

### 2.7 No custom error page
There is no `+error.svelte` anywhere. Any 404/500 shows SvelteKit's default English LTR error page — jarring on an Arabic RTL site. Add a root `+error.svelte` (and optionally one for `(site)`) with branding, RTL, and a link home.

### 2.8 Leftover demo route
`/sidebar-08` (shadcn sidebar demo) is publicly reachable. Delete the route (and prune now-unused demo components: `app-sidebar`, `nav-*` if nothing else uses them).

---

## Phase 3 — SEO & metadata (critical for a real-estate site)

Currently there is **no `<title>`, no meta description, no OG tags anywhere** — every page shows an empty/default title and shares terribly on WhatsApp/social, which is exactly where a Omani real-estate site gets traffic.

- 3.1 Add per-page `<svelte:head>` with `<title>` + `description`: home, projects list, project detail (use project title/location/price), units list, unit detail.
- 3.2 Add Open Graph + Twitter card tags on detail pages using the main media image (absolute URL via `ORIGIN`).
- 3.3 Add canonical URLs on detail pages (the `[title]-[id]` pattern means many titles resolve to the same ID — pick one canonical form and redirect/canonicalize mismatched slugs).
- 3.4 Generate `sitemap.xml` (server route reading published projects/units). `robots.txt` already exists and allows crawling.
- 3.5 Consider JSON-LD (`RealEstateListing`/`Product`) on detail pages — nice-to-have, not a blocker.

---

## Phase 4 — Operational readiness

- 4.1 **SQLite hardening:** enable WAL mode + `busy_timeout` pragmas at connection time in `src/lib/server/db/index.ts` (better concurrency under real traffic).
- 4.2 **Backups:** the DB *and* `../ASSETS/uploads` are the entire business state. Set up a scheduled backup (e.g. `sqlite3 .backup` + rsync of uploads) before launch.
- 4.3 **Deployment definition:** nothing describes how this runs in production. Add a short DEPLOY section to the README (or a Dockerfile/systemd unit): `node build`, required env vars (`ORIGIN`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `BODY_SIZE_LIMIT`, `ASSETS_DIR`, `PORT`), and a reverse proxy (nginx/caddy) for TLS + gzip/brotli (adapter-node does not compress responses).
- 4.4 **Prerelease dependencies:** `@sveltejs/kit@next`, `adapter-node@next`, Vite 8 with `experimental: { async, remoteFunctions }`. Pin the exact versions that the launch build was tested with (lockfile helps, but `next` tags make reinstalls non-reproducible) and re-verify after any upgrade.
- 4.5 **Logging:** everything is `console.error`. Acceptable at this scale if stdout/stderr are captured by the process manager — just make sure they are.
- 4.6 Verify better-auth rate limiting is active in production for `/dashboard/sign-in` (it is on by default in prod mode; confirm once deployed).

---

## Phase 5 — Code hygiene (quick wins, do before tagging a release)

- 5.1 `pnpm lint` currently **fails**: 176 files aren't Prettier-formatted (so ESLint never even runs in that script). Run `pnpm format`, commit.
- 5.2 One ESLint error: `src/routes/dashboard/properties/state.svelte.ts:59` — mutable `Date` in reactive state (`svelte/prefer-svelte-reactivity`).
- 5.3 **11 modified files are uncommitted on `main`** (About, Drawer, Footer, NewProjects, OurServices, SpecialEstates, layout + projects/units pages). Review and commit or discard before any release build.
- 5.4 Remove `src/lib/assets/tmp/` placeholder images if unused, and the commented-out `$app/env/private` imports in `auth.ts`/`db/index.ts`.
- 5.5 There are **no tests and no CI**. Minimum bar for launch: a GitHub Actions workflow running `pnpm lint && pnpm check && pnpm build` on PRs. Playwright smoke tests (home renders, project detail renders, sign-in gate redirects) are a strong next step.

---

## Known non-blockers (already tracked in README)

- Pagination UI on list pages (loaders already return pagination metadata).
- English locale content (i18n scaffolding exists; Arabic is primary).
- Map view (`latitude`/`longitude` already in schema).
- Seed script for demo projects/units.

---

## Suggested execution order

| Step | Scope | Est. effort |
| --- | --- | --- |
| 1 | Phase 1 (security: API leak, path traversal, seed creds, upload validation) | ~half day |
| 2 | Phase 2.1–2.4 (WhatsApp number, BODY_SIZE_LIMIT, paths/env) | ~half day |
| 3 | Phase 2.5–2.8 (action robustness, transactions, error page, demo route) | ~1 day |
| 4 | Phase 3 (SEO/meta/sitemap) | ~1 day |
| 5 | Phase 4 (WAL, backups, deploy docs, version pinning) | ~half day |
| 6 | Phase 5 (format, lint fix, commit hygiene, CI) | ~half day |

Roughly **4 working days** to production-ready, assuming no scope changes.
