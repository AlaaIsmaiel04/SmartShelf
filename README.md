<p align="center">
  <img src="docs/assets/smartshelf-readme.png" alt="SmartShelf — Linked SS logo" width="480">
</p>

# SmartShelf

**Pharmacy inventory management and public medicine search.**

SmartShelf helps pharmacists manage medicine stock and expiry dates, gives the platform owner control over pharmacy access, and helps citizens find medicines and consult pharmacy duty schedules in **Salamiyah, Hama, Syria — سلمية، حماة، سوريا**.

**Status:** Completed academic project · Weekly Mini Project 04 · Team 2.

The application runs locally with a React interface, a NestJS API and PostgreSQL storage. It supports English and Arabic, right-to-left layouts, light/dark themes and responsive desktop/mobile screens.

## Features

### Platform owner

- Create and manage pharmacy records and pharmacist accounts.
- Create, update, suspend, reactivate and remove subscriptions.
- Search pharmacies and filter by subscription status.
- Preserve pharmacy accounts, stock and duty records when removing a subscription.

### Pharmacist

- Manage inventory within the signed-in pharmacist's own pharmacy.
- Add a medicine and its first batch together in one save; add further batches separately.
- Edit medicine details, quantities, expiry dates and storage locations.
- Remove medicines and their batches through a styled confirmation dialog.
- Search by medicine or scientific name and filter by stock/expiry indicators.
- Review available stock, inventory value, expired-stock cost and items needing attention on the dashboard.
- Update pharmacy contact details and manage duty periods, with overlap prevention.
- Keep a valid sign-in after refreshing the page; sign out explicitly when finished.

Scientific names are optional. Expiry entry uses day/month/year selectors. Batch numbers, unit costs and barcodes remain read-only after creation. Inactive subscriptions retain read access, while the API rejects changes.

### Citizen

- Search medicine availability without creating an account.
- Use the explicitly labeled sample mode or switch to **Use live search** for stored pharmacy stock.
- View the published Salamiyah duty roster, including pharmacy names, locations, dates and shift labels.
- Browse in English or Arabic on desktop and mobile layouts.

### Interface and access controls

- Warm parchment and cream surfaces, botanical-green navigation and saffron highlights.
- Compact forms and inventory lists, collapsible sidebars and mobile navigation drawers.
- Loading, empty, success and error feedback; drafts are preserved after failed saves.
- JWT authentication with server-validated session restoration after refresh.
- Backend checks for account role, pharmacy ownership, subscription status and valid input.
- Public responses exclude private stock quantities, purchase costs and account details.

## Demo data and service area

The public service area is fixed to **Syria / Hama / Salamiyah**. Business dates use `Asia/Damascus`.

| View                                  | Data source                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Medicine search — default sample mode | Ten sample medicines and five fictional Salamiyah pharmacies, clearly labeled as demonstration data.                       |
| Medicine search — live mode           | PostgreSQL stock. A pharmacy appears only with an active subscription and a matching batch with positive, unexpired stock. |
| Public duty page                      | The supplied **14–27 November 2026** Salamiyah roster, with names, addresses, dates and noon/evening shift labels.         |

The published roster is separate from pharmacy accounts and inventory. Exact duty hours were not supplied, so shift labels do not establish whether a pharmacy is on duty at a precise instant. The roster needs an updated source for dates beyond its published range.

Sample medicine results do not represent verified real-world availability. Live API failures never silently fall back to sample data. See the [duty-roster notes](docs/SALAMIYAH-DUTY-SCHEDULE.md).

## Technology

| Layer             | Tools                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Frontend          | React, TypeScript, Vite, React Router, Tailwind CSS and reusable CSS variables            |
| Backend           | NestJS, TypeScript, JWT authentication and request validation                             |
| Database          | PostgreSQL and Prisma                                                                     |
| API documentation | Swagger / OpenAPI                                                                         |
| Interface         | Lucide icons, Plus Jakarta Sans, Noto Kufi Arabic and IBM Plex Mono                       |
| Verification      | API/frontend tests, PostgreSQL acceptance tests, smoke checks and browser workflow checks |

## Run locally

### First-time setup

Install **Node.js 22.12 or later** (the project uses Node 24), npm and PostgreSQL. From the repository root, use Git Bash:

```bash
npm ci

# Create local configuration files only if they do not already exist.
test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
test -f apps/web/.env || cp apps/web/.env.example apps/web/.env
```

Create a dedicated local PostgreSQL database, then configure `apps/api/.env`:

- Set `DATABASE_URL` to that database's connection string.
- Set `JWT_SECRET` to a random secret of at least 32 characters.
- Keep `BUSINESS_TIME_ZONE=Asia/Damascus`.

Generate a suitable secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Generate the database client, apply migrations and seed the dedicated demo database:

```bash
npm run db:generate
npm run db:deploy
ALLOW_DEMO_SEED=true npm run db:seed
npm run dev
```

The seed creates demonstration owner/pharmacist accounts and sample pharmacy stock. Re-running it preserves existing records and edits; it does not refresh their dates. Seeded North/South pharmacies do not match the fixed Salamiyah public filter. To demonstrate live search, use the owner to create a pharmacy with area `سلمية`, activate its subscription, create its pharmacist account and add stock through that account.

Demo sign-in details, PowerShell commands and database alternatives are documented in [Local setup](docs/LOCAL-SETUP.md). Local `.env` files and database credentials are not included in the repository.

### Starting an already configured checkout

Ensure PostgreSQL is running, then:

```bash
npm run dev
```

On the existing Windows checkout with its configured `.local/postgres` cluster:

```bash
npm run db:local:start
npm run dev
```

The `db:local:*` helpers require that machine-local cluster; cloning the repository does not create it. Press **Ctrl + C** to stop the frontend/backend. Stop the optional local cluster with `npm run db:local:stop` when needed.

### Local addresses

| Page                  | Address                            |
| --------------------- | ---------------------------------- |
| Website               | <http://127.0.0.1:5173/>           |
| Staff sign-in         | <http://127.0.0.1:5173/login>      |
| Medicine search       | <http://127.0.0.1:5173/search>     |
| Published duty roster | <http://127.0.0.1:5173/pharmacies> |
| Swagger               | <http://localhost:3000/api/docs>   |
| API health            | <http://localhost:3000/api/health> |

Owner and pharmacist workspaces open after sign-in. A saved session survives refresh within the same browser tab and is verified with `/auth/me` before private screens load. Sign-out or expiry clears it; the JWT lifetime remains one hour. See [session behavior](apps/web/src/features/auth/README.md).

## Checks

```bash
npm run typecheck
npm test
npm run build
npm run smoke
```

Database acceptance tests require a separate database named `smartshelf_test` or `smartshelf_test_<suffix>`. Configure `TEST_DATABASE_URL` for that database before running:

```bash
npm run test:integration
```

The integration runner applies migrations and manages its own test fixtures. Ordinary `npm test` intentionally skips the four database acceptance groups. Smoke checks require a configured database and a completed build.

The merged version reviewed on **15 November 2026** passed **490 API tests, 36 frontend tests and all 52 PostgreSQL/HTTP acceptance tests**, plus typecheck, build and startup smoke checks. Browser verification covered inventory deletion, confirmation controls, session restoration, logout, expired tokens and connection recovery. These results describe automated/local checks; they do not certify an independent laptop setup or a completed team rehearsal.

## Repository structure

```text
apps/
  api/                 NestJS API, Prisma schema, migrations and seed
  web/                 React application, feature screens and translations
packages/contracts/    Shared TypeScript request/response types
docs/                  Requirements, API contracts, setup and verification notes
scripts/               Development, verification and document-generation tools
output/                Task guides and recorded verification evidence
```

## Team

| Member           | Project area                                                                  |
| ---------------- | ----------------------------------------------------------------------------- |
| Alaa Ismaiel     | Shared frontend, navigation, owner/inventory screens, styling and integration |
| Mustafa Al Shaar | Database, authentication, access guards and inventory API                     |
| Shiam Ezzo       | Owner administration, pharmacist accounts and subscriptions                   |
| Mohammad Kashmar | Dashboard calculations and dashboard/profile/duty interfaces                  |
| Hamid Al Haj     | Profile/duty/public APIs and language/theme foundations                       |
| Yousef Yousef    | Citizen search, public directory and pharmacy cards                           |

## Documentation and scope

- [Project requirements](docs/PROJECT-SPECIFICATION.md)
- [API contract](docs/API-CONTRACT.md) and [frontend routes](docs/FRONTEND-ROUTES.md)
- [Acceptance scenarios](docs/ACCEPTANCE.md) and [verification report](docs/FINAL-REVIEW.md)
- [Interface design](DESIGN.md) and [English/Arabic behavior](docs/LANGUAGE.md)
- [Original team plan](docs/TEAM-PLAN.md) and [individual task guides](docs/tasks)

SmartShelf is a completed educational project for local demonstration. Public deployment, payments, online ordering, reservations, delivery, citizen accounts and SMS/email/push notifications are outside its scope. Using it as a public service would require verified pharmacy data and maintained duty schedules.
