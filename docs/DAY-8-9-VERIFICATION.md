# Days 8–9 — real API integration and subscription lifecycle

Date: 10 November 2026. Branch: `alaa`. Baseline: merged main `92fd554`. No commit or push was made for this work.

**Days 8 and 9 are complete for automated/local integration.** The owner frontend was already wired to the agreed endpoints. This follow-up removes its obsolete API-unavailable 404 message, reuses the shared authenticated API client and proves the real workflows now that Shiam's backend is merged.

## Implemented follow-up

- `owner-api.ts` delegates authenticated requests to `createApiClient`. HTTP status and server validation arrays/resource/conflict reasons are preserved; a 401 invalidates the session, a 204 has no JSON body, and network/cancellation errors never produce sample data.
- Five owner frontend regression tests cover request filters/token/signal, mutation paths/methods, 400/403/404/409 feedback, 401 invalidation and failed/aborted requests.
- Known owner backend rejection messages have Arabic translations. Routes, backend permissions, database schema and inventory field rules are unchanged.

## Real browser acceptance

All business requests use real JWT/HTTP/Prisma data in an isolated PostgreSQL test database. The final owner request deliberately substitutes an invalid Authorization header to verify that a real server 401 clears the frontend session; it does not mock a successful response.

1. Owner signs in and creates a pharmacy; the refreshed list shows it without reloading.
2. Owner creates a pharmacist account. A repeated email produces a real 409; passwords clear after each request.
3. Owner creates an active subscription; owner list/details show the refreshed effective status.
4. The new pharmacist signs in and creates/edits medicine and batch data. Batch number/cost/barcode remain immutable on edit.
5. Dashboard metrics match persisted stock (1 medicine, 10 available units, value 25.00); public medicine search finds the pharmacy.
6. A real duty record is created through the pharmacist API for later preservation checks.
7. Owner suspension changes the owner view, makes the pharmacist inventory read-only on focus and hides the public result.
8. Reactivation restores writes and public availability without pharmacist re-login.
9. Future and expired owner dates produce NONE/EXPIRED and read-only behavior; valid dates restore ACTIVE.
10. Delete cancellation retains the subscription. Confirmed deletion preserves pharmacy/account/medicine/batch/duty records; pharmacist login/reads still work while a real direct write is rejected with 403 and public search hides the pharmacy.
11. Recreating the subscription restores the existing stock and public result.
12. Literal-name/status owner filters and Arabic/mobile forms use the real backend.
13. A real server 401 returns the owner to sign-in with the session-expired notice.

Successful saves refetch and can collapse expanded batch details; that is expected behavior, not lost data. Backend/database acceptance separately covers missing resources, wrong roles, invalid DTOs, conflicts, status boundaries and restart persistence.

## Verification and evidence

- Typecheck/build: pass.
- API unit tests: 489 pass; four database groups intentionally skipped by ordinary `npm test`.
- Frontend tests: 28 pass, including five new owner regressions.
- Dedicated PostgreSQL tests: 48 pass, zero failures/skips.
- Additional API checks: 61 pass. Runtime/Swagger smoke: pass.
- Real browser workflow groups: 13 pass, no uncaught browser errors.
- Tracked-path audit: no prohibited generated/configuration paths found.

Evidence: [API checks](../output/day8-9/api-checks.json), [browser checks](../output/day8-9/browser-checks.json), [verification](../output/day8-9/verification.json), [repository audit](../output/day8-9/repository-audit.json). The screenshot beside these files contains synthetic test data only.

The running development API held the Prisma DLL on Windows, so the isolated run used the existing generated client for the unchanged schema, applied migrations to a fresh database and ran the same four integration specs directly. No development database was reset, no credentials were changed and no real business record was edited. Test servers/cluster started by the verification were stopped afterward.

## Repeat and remaining work

Run `npm run typecheck`, `npm test` and `npm run build`. Stop API processes before `npm run test:integration` on Windows, and set `TEST_DATABASE_URL` to a separate `smartshelf_test` database. Follow the browser sequence above using a disposable migrated/seeded database; never run mutation acceptance against personal or production records.

Day 12's owner backend dependency is resolved. An actual second-laptop installation and team acceptance/English rehearsal remain open. These checks do not certify those human tasks.
