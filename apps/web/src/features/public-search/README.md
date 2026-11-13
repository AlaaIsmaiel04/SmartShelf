# Public medicine search

Implemented at `/search` with `PublicSearchPage`, `PharmacyCard` and `public-api.ts`.
Requests are unauthenticated. Submit a nonempty display/scientific name with optional
on-duty filtering, fixed to the service area `سلمية` (Syria / Hama / Salamiyah). Typing alone does not request results. Retry repeats the
submitted filters; Clear resets inputs/results. Aborted or superseded requests
cannot replace newer results. Loading, error, initial and no-match states are explicit.

Cards use a runtime public allowlist, Syria duty times, safe phone links and null
time messages. They never render quantities, costs, identifiers or private fields.
All labels use the shared English/Arabic provider. Styles inherit SmartShelf tokens.
An explicit, labeled demo mode is enabled initially for previewing search. It supplies ten sample medicines and five fictional pharmacies, with simulated stock, duty periods and update times. It never uses the real published duty roster as evidence of medicine availability and contains no phone numbers. Arabic and English brand/scientific-name aliases and the simulated on-duty filter work offline. Panadol is searched initially; six example buttons offer quick searches. Use “Use live search” to query the real API. Real request failures never fall back to demo data. Demo mode does not create database records or change staff inventory.

The `/pharmacies` directory now displays the supplied published duty roster for 14–27 November 2026, independently of registered accounts and stock. See `docs/SALAMIYAH-DUTY-SCHEDULE.md` for the source, scope and missing exact hours. The backend pharmacy listing endpoint remains available for registered-pharmacy integrations. Medicine search continues to use Hamid's real Prisma stock adapter with no sample fallback. Both public pages inherit the connected theme and English/Arabic preferences.
