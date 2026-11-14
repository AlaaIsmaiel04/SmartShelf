# Functional review — 14 November 2026

Reviewed the combined medicine/first-batch change (`f4d1262`) on top of merged main `8fd6ed0`. This report records local verification; GitHub checks and the eventual merge have separate results.

## Results

- Typecheck and production build passed.
- Ordinary tests: 490 API tests passed; four database groups intentionally skipped. All 32 frontend tests passed.
- All 50 real PostgreSQL/HTTP acceptance tests passed with no skips in a newly created isolated test database. These include nested first-batch validation and forced database rollback: a failed batch insert leaves no medicine or timestamp change.
- Smoke passed for compiled frontend/API startup, Swagger routes, protected access and public reads.
- Seven browser workflow groups passed with real HTTP/JWT/PostgreSQL responses for owner, pharmacist, dashboard and live search. No browser runtime errors were observed.

## Real workflow checked

1. Owner signs in and creates a pharmacy in Salamiyah, a pharmacist account and an active subscription.
2. That pharmacist signs in and adds a medicine plus its first batch in one POST. Scientific name is left blank; reorder threshold is absent from the form. Twelve units at 2.50 are persisted.
3. Dashboard displays one medicine, twelve available units and inventory value 30.00.
4. A citizen explicitly switches to live search and finds the newly stocked Salamiyah pharmacy.
5. Owner suspends access. A real stock write returns 403 and the pharmacy disappears from live search. Reactivation restores visibility.
6. Owner and pharmacist pages switch EN/AR and light/dark at mobile width while retaining their sessions. RTL and mobile drawer controls work without horizontal overflow.
7. Default citizen search remains explicitly demo mode. The published roster displays four entries for 14 November; its Arabic dark mobile view fits the viewport.

The separate combined-form check also passed eight combinations: EN/AR × light/dark × 390/1440 pixels, including blank scientific name, absent threshold, valid leap-day clamping, save and edit. Those checks use the development preview; real persistence is covered above and by database tests.

Machine-readable results and screenshots: [final-review evidence](../output/final-review). Credentials, tokens and connection strings are excluded. Temporary servers were stopped; the development database was not changed. The isolated review database contains synthetic test records only.

## Current product boundaries

- Public service area is Syria / Hama / Salamiyah. Business dates use Asia/Damascus.
- Default medicine-search results are fictional sample medicines and pharmacies, clearly labeled. They do not demonstrate real availability. Use live search to query persisted stock; errors never silently switch to sample results.
- `/pharmacies` displays the supplied 14–27 November 2026 duty roster with names, addresses, dates and noon/evening labels. Exact duty hours were not supplied. The published roster is independent of registered accounts, subscriptions, inventory and the backend directory API.
- Adding medicine and its first batch is atomic. Scientific name is optional. New medicines receive threshold zero; existing thresholds remain stored and are preserved on edits. Further batches can still be added separately.
- Pharmacists still manage their own authenticated duty periods. Moving duty management to the owner was deferred and is not included here.

## Still open

Independent laptop installation, actual team acceptance, physical-phone testing and all six members' English rehearsal/presentation remain human tasks. Final demo dates/data/setup must be reviewed near presentation day; the November roster has no entries after 27 November. Automated results do not close these gates.
