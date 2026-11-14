# Day 12 acceptance report

> Current product note (14 November 2026): see [FINAL-REVIEW.md](FINAL-REVIEW.md) for the combined medicine/first-batch workflow, explicit demo/live search split and published Salamiyah roster. Earlier evidence below retains its original scope. Independent laptop/team gates remain open.

Updated 10 November 2026 on `alaa`, baseline main `92fd554` plus the Day 8–9 integration follow-up.

**Outcome: automated acceptance, including the real owner-to-public workflow, is complete. Full Day 12 remains open for another member's laptop and the actual team acceptance session.** Shiam's backend is merged and is no longer a dependency.

## Current verification — 10 November

- Typecheck and production build pass. `npm test`: 489 API unit tests and 28 frontend tests pass; four database groups are intentionally skipped in that command.
- All 48 real PostgreSQL/HTTP acceptance tests pass with no failures/skips. A fresh dedicated database received migrations. The owner group verifies authorization, validation, duplicate conflicts, date/status rules, deletion preservation, concurrency and restart persistence.
- 61 additional real HTTP checks pass for role restrictions, owner onboarding, normalized accounts, subscription lifecycle, inactive writes, literal search and public visibility/privacy. Runtime/Swagger smoke checks pass.
- Thirteen real browser workflow groups cover owner onboarding through pharmacist stock/dashboard and public search, then suspension/reactivation, future/expired subscriptions, confirmed/cancelled deletion and recreation. Owner views and pharmacist access refresh; retained data is readable after deletion. Arabic/mobile forms and session invalidation were checked.
- Fixed the owner's stale 404 handler: missing resources retain their server message. Added five shared-client regression tests and Arabic translations for known owner rejection messages.
- The tracked-path audit found no tracked environment files, node_modules, dist, tmp or local database directories.

Current evidence: [Days 8–9 verification](DAY-8-9-VERIFICATION.md), [browser checks](../output/day8-9/browser-checks.json), [API checks](../output/day8-9/api-checks.json), [automated verification](../output/day8-9/verification.json) and [repository audit](../output/day8-9/repository-audit.json). These runs use isolated test data, not the working pharmacy database.

On Windows, the running API held Prisma's engine DLL. The integration runner's generate step could not replace it. Acceptance therefore used the existing generated client for the unchanged schema, migrated a fresh database, and executed the same four PostgreSQL spec files directly. Stop API processes before repeating the normal `npm run test:integration` command. No database was reset and no credential file changed.

## Historical scope and evidence — 7 November

The following records describe the earlier run, before Shiam's backend merged. Its mock-only owner limits are superseded by the current verification and acceptance matrix.

- Typecheck and production build passed. `npm test`: 485 API unit tests and 23 frontend tests passed; three database groups are intentionally skipped by this command.
- `npm run test:integration`: all 36 tests passed, zero failures/skips, against a newly created, isolated PostgreSQL test database. The runner applied the migration to the empty database before testing.
- The demo seed ran twice afterward. Counts stayed at 5 accounts, 4 pharmacies, 16 medicines, 24 batches and 1 duty period. Repeating the seed did not duplicate records.
- Expanded `npm run smoke` passed: API health, built frontend, implemented auth/inventory/dashboard/profile/duty/public Swagger routes, unauthenticated private-route rejection, public directory, required search query and live medicine search.
- Six browser regression groups passed. Real pharmacist fixtures were created in the separate test database and cleaned up. Owner requests and deliberate loading/network/error scenarios used development services or controlled responses, as detailed below.
- A tracked-file audit checked for environment files, dependencies, build output, local databases, temporary files and private-key material. Its result is in `output/day12/repository-audit.json`.

Machine-readable evidence is in [automated-checks.json](../output/day12/automated-checks.json) and [verification.json](../output/day12/verification.json). Screenshots under `output/day12/public/` use controlled public responses; they are not evidence of real stock. The previous theme/persistence/contrast checks remain in [theme verification](../output/theme/verification.json).

This run used this Windows computer and its installed dependencies. A fresh database is not a clean install on another laptop. No development database was reset, no owner API was simulated as production functionality, and no teammate's presentation is marked complete.

## Acceptance matrix

PASS means the listed implemented scenario was verified. PARTIAL and BLOCKED remain open for final acceptance. The source checklist is [ACCEPTANCE.md](ACCEPTANCE.md).

| ID  | Status       | Evidence and remaining work                                                                                                                                                                                                                                                     |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | PASS         | Real HTTP checks reject missing/wrong/expired tokens, enforce roles and reload the account. Security-logging unit tests verify rejection logs exclude request bodies, passwords, tokens and email. Login intentionally returns its access token.                                |
| A02 | PASS         | Real inventory/duty checks reject guessed cross-pharmacy IDs and owner inventory access; no caller-supplied pharmacy scope is trusted.                                                                                                                                          |
| A03 | PASS         | Real owner APIs and browser screens create pharmacy/account/subscription. Duplicate normalized email and nonexistent pharmacy are rejected; new accounts can sign in.                                                                                                           |
| A04 | PASS         | Real owner endpoint/database checks cover inclusive dates, future NONE, EXPIRED, suspension precedence, duplicate subscription and invalid date order. Browser date changes refresh the effective status.                                                                       |
| A05 | PASS         | Real owner suspension/expiry/future/deletion leaves pharmacist reads available, disables UI mutations and produces server 403 for inactive writes. Reactivation restores access without re-login.                                                                               |
| A06 | PASS         | Subscription deletion through the real owner UI/API preserves pharmacy/accounts/medicine/batch/duty records, returns NONE and removes public visibility; recreation restores access to existing stock.                                                                          |
| A07 | PASS         | Real 409 checks cover normalized per-pharmacy medicine uniqueness, separate pharmacy names and duplicate batch numbers.                                                                                                                                                         |
| A08 | PASS         | Implemented APIs, including owner pharmacy/account/subscription requests, reject invalid numbers, dates, UUIDs, enums and unknown fields. Server validation/rejection messages reach the frontend.                                                                              |
| A09 | PASS         | Fixed-clock calculation tests cover yesterday/today/+90/+91 and exclusion of expired units; persisted dashboard/inventory checks corroborate the results.                                                                                                                       |
| A10 | PASS         | Threshold equality, multiple indicators, filtered counts and the expired-batch HEALTHY exclusion pass unit/API checks. Real stock writes refresh the visible dashboard and badges.                                                                                              |
| A11 | PASS         | Persisted dashboard/browser checks verify nonexpired value `25.00`, expected waste `12.00` and available units `10` from the agreed example.                                                                                                                                    |
| A12 | PASS         | Real inventory tests check atomic timestamps, forced rollback and visibility from another connection.                                                                                                                                                                           |
| A13 | PASS         | Fixed-clock and PostgreSQL tests cover overnight duty, exact inclusive start/exclusive end, adjacent/edit-self periods, invalid duration and simultaneous overlap protection across API instances. Real UI add/edit/delete/overlap feedback also passed.                        |
| A14 | PASS         | Real PostgreSQL tests cover partial/scientific/case matching, combined area/duty filters, eligible stock, inactive/expired-only/zero-only exclusion, literal wildcard characters and deduplication. Public state tests additionally cover retry and stale-request cancellation. |
| A15 | PASS         | Real directory tests cover ACTIVE-only listing, current/next/null duty and exact nested public response fields. Public cards apply their frontend allowlist as a second boundary.                                                                                               |
| A16 | PASS         | Historical state regressions plus real owner onboarding/lifecycle, inventory writes, public visibility and refresh flows pass. Real 401 invalidation and duplicate 409 feedback are verified; intentional network/error scenarios remain explicitly controlled tests.           |
| A17 | PARTIAL      | Fresh migration, repeatable seed, real API restart persistence and owner/auth/inventory/dashboard/profile/duty/public Swagger/runtime checks pass on this computer. Independent laptop startup remains open.                                                                    |
| A18 | PENDING TEAM | Every member must personally present in English and explain architecture, one rule, one rejection and one decision. Prepared scripts do not count as participation.                                                                                                             |

## Frontend state review

| Area                                | What was checked                                                                                                                                                                                                          | Evidence type                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in/session/navigation          | Protected-route notice, role redirects, bearer session validation, transient network failure, 401 expiry message, refreshed role navigation and logout                                                                    | Controlled auth/error responses; real sign-in/private reads also covered by API and pharmacist browser tests                             |
| Owner pharmacy/account/subscription | Account payload and password preservation, 409/400 feedback, pending controls, subscription create/update/toggle, delete cancel/error/204, failed refresh/retry and direct subscription route                             | Historical controlled responses plus current real JWT/PostgreSQL owner-to-public browser acceptance, including Arabic/mobile checks      |
| Inventory                           | All four forms, blank/fractional/duplicate rejection, historical/zero input, immutable batch fields, retained drafts, pending/disabled controls, failed refresh/retry, inactive restrictions, filters and keyboard cancel | Preview/error scenarios plus real PostgreSQL stock-to-dashboard browser writes                                                           |
| Dashboard                           | Exact metrics, simultaneous badges, empty/inactive data, focus/inventory refresh, loading/error/retry and 401 handling                                                                                                    | Real PostgreSQL data with selected delay/error responses injected                                                                        |
| Profile/duty                        | Required/invalid input, pending controls, draft preservation, persisted save, timezone conversion, add/edit/delete/cancel, overlap feedback, retry and inactive read-only state                                           | Real PostgreSQL data with selected delay/error responses injected                                                                        |
| Public search/directory             | Initial/empty/loading/error states, explicit submit, combined filters, phone link, counts, clear/reset, retry retaining filters, stale-response protection, null duty/timestamps and response allowlist                   | Real directory/empty-stock request; controlled response states; eligible-stock/rule combinations verified by PostgreSQL acceptance tests |
| EN/AR and accessibility             | RTL, preserved drafts/feedback on language switch, keyboard submission/focus and mobile layouts at 320/390/768/1280/1440 where supported by each regression                                                               | Headless Edge checks; not physical-device certification                                                                                  |

No new frontend defect was found in this run. The smoke script was extended because it previously omitted working dashboard/profile/duty/public routes. It remains read-only with respect to business records.

## What remains before Day 12 can close

1. Another member follows [LOCAL-SETUP.md](LOCAL-SETUP.md) on their own laptop and records actual results in [SECOND-LAPTOP-CHECK.md](SECOND-LAPTOP-CHECK.md).
2. The team runs the checklist together, inspects public JSON/privacy and records who checked each result.
3. Complete the actual six-member English rehearsal/presentation for Days 13–14. Prepared scripts and automated checks do not count as participation.

## How to repeat the available checks

Run `npm run typecheck`, `npm test`, `npm run build`, then `npm run smoke` with a working, dedicated demo database. Set `TEST_DATABASE_URL` to a separate `smartshelf_test` or `smartshelf_test_<suffix>` database before `npm run test:integration`. Preserve existing local configuration; never point test commands at a production or personal working database.

For manual frontend acceptance, follow the state-review table: save valid stock, reject invalid/conflicting input, retry a failed read, verify inactive read-only behavior, navigate to dashboard and public search, then repeat keyboard/mobile and EN/AR flows. Controlled failures demonstrate UI handling only; the current owner lifecycle acceptance uses real owner endpoints.
