# Public pharmacy directory

Implemented at `/pharmacies` with `DirectoryPage`. Shows the published Salamiyah
November 2026 notice stored in `duty-schedule.ts`, independently of pharmacy
accounts and live medicine availability. Dates, noon/evening periods and pharmacy
name/address filters combine immediately. The notice does not supply exact hours.

Only today and upcoming dates appear, based on `Asia/Damascus`, regardless of the
visitor's timezone. The view refreshes at Syria midnight, checks the date every
minute, and checks again when the tab becomes visible or regains focus. A selected
date that has passed is cleared. Past entries remain in the source archive.

After the last published date (27 November 2026), the page explains that no upcoming
schedule has been published. A new notice must be supplied to add future duties.
This feature does not invent schedules or delete pharmacy accounts or stock.
