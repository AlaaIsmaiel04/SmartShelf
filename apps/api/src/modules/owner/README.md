# Owner onboarding and subscriptions

Shiam's module provides OWNER-only pharmacy listing/creation, pharmacist account
creation and subscription create/update/delete routes. It uses the shared JWT
guards, Prisma client, Asia/Amman business date and effective-subscription helper.
Response mappers expose contract fields only; account passwords are hashed.

Pharmacy name search is partial and case-insensitive. `%`, `_` and `\` are plain
text, escaped before Prisma's PostgreSQL ILIKE filter. Status filtering uses the
calculated subscription status, and `total` counts the filtered results.

`owner.service.spec.ts` runs with `npm test`. `owner.integration.spec.ts` runs
through `npm run test:integration` against an explicitly supplied dedicated
`TEST_DATABASE_URL` named `smartshelf_test` or `smartshelf_test_<suffix>`.
Ordinary unit-test runs intentionally skip database acceptance groups.

Database tests cover all owner-route permissions, validation, literal searches,
account normalization/password hashing, duplicate email and missing resources,
concurrent subscription creation, inclusive dates/status precedence, public
visibility, inactive pharmacist reads/writes, deletion preserving all other
pharmacy data and persistence across an application restart. Each test run uses
unique fixture IDs and cleans up only its own records.
