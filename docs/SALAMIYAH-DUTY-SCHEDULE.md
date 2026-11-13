# Salamiyah duty schedule

SmartShelf's public service area is Syria / Hama / Salamiyah (سوريا / حماة / سلمية). Public medicine search sends the fixed area `سلمية`; clearing the form does not expand the area. Pharmacy profiles with stock must use this area to appear in medicine results. Existing demo accounts and their stock are not renamed or presented as real pharmacies.

The pharmacy directory displays the published November 2026 roster from pages 3–4 of the supplied `مناوبات تشرين ثاني .pdf`. Only 14–27 November is included: 14 days, four entries per day, 56 entries. The source contains no dates after 27 November; additional dates must come from a later notice.

Names and street/landmark addresses remain in Arabic in both interface languages. The date and shift labels are translated. The first two pharmacy columns beside the date are noon (ظهراً); the other two are evening (مساءً). The footer's regular opening hours are not assumed to be duty hours. The directory therefore provides date/shift filters, not a fabricated “open now” calculation.

This published roster lives in `apps/web/src/features/directory/duty-schedule.ts`. It is available without a database connection and does not create accounts, subscriptions, phone numbers, stock or exact time periods. It is a read-only published schedule, separate from pharmacists' authenticated duty-period management. Medicine availability still comes from the backend's persisted stock and active-subscription rules.

Business-date defaults and public timestamp display now use `Asia/Damascus`. The local API environment was updated too; other checkouts should set `BUSINESS_TIME_ZONE=Asia/Damascus` in their own ignored API environment file and restart the API. Historical verification documents describe earlier checks and are not rewritten as new evidence.
