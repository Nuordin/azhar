# Azhar Web

A bilingual-ready (Arabic / RTL) real-estate platform for the Omani market, built with
SvelteKit 5, Drizzle ORM (better-sqlite3), Tailwind CSS 4, and better-auth.

## Stack

- **SvelteKit 5** (runes) + Vite
- **Drizzle ORM** over **better-sqlite3** (`../ASSETS/sqlite.db`)
- **Tailwind CSS 4** + shadcn-svelte / bits-ui components
- **better-auth** for authentication (admin dashboard)
- **svelte-i18n** for localization (Arabic primary)

## Getting started

```bash
pnpm install
pnpm db:push          # apply the schema to the sqlite database
pnpm dev              # start the dev server
```

Uploaded media is written to `../ASSETS/uploads` and served via `/uploads/[fileName]`.

### Useful scripts

| Script           | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Dev server                                 |
| `pnpm build`     | Production build (adapter-node)            |
| `pnpm preview`   | Preview the production build               |
| `pnpm check`     | `svelte-kit sync` + `svelte-check` (types) |
| `pnpm lint`      | Prettier check + ESLint                    |
| `pnpm format`    | Prettier write                             |
| `pnpm db:push`   | Push Drizzle schema to the DB              |
| `pnpm db:studio` | Drizzle Studio                             |

## Structure

- `src/routes/(site)/` — public site
  - `+page.*` — home (featured + latest projects)
  - `projects/` — projects list (server-side filtered) + `[title]-[id]` detail
  - `units/` — units list (server-side filtered) + `[title]-[id]` detail
- `src/routes/dashboard/` — admin dashboard (auth-gated)
  - `projects/`, `properties/` — full CRUD (create/update/delete/publish) with media upload
- `src/routes/api/` — JSON read endpoints (`projects/[id]`, `units/[id]`) + locales
- `src/lib/server/db/` — Drizzle schema, connection, seed
- `src/lib/components/` — shared UI (`ProjectCard`, `UnitCard`, `Galary`, …)

## Status

**Admin dashboard** — complete: projects & units CRUD, field validation, media
upload/delete, and publish toggling.

**Public site** — complete and wired to the database:

- [x] Home: featured & latest projects from the DB
- [x] Projects list with server-side filters (city, construction status, price, sort)
- [x] Project detail page (gallery, specs, amenities, payment plans, project units)
- [x] Units list with server-side filters (category, type, offer, status, price, sort)
- [x] Unit detail page (gallery, specs, amenities, payment plans)
- [x] Responsive layout (mobile → tablet → desktop)

### Possible follow-ups

- Pagination UI on the list pages (loaders already return pagination metadata).
- Map view (schema stores `latitude` / `longitude`).
- English locale content (i18n scaffolding is in place; Arabic is primary).
- A seed script for demo projects/units (`src/lib/server/db/seed.ts` currently only
  creates the admin account).
