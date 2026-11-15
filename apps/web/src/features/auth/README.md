# Staff sign-in and session restoration — Alaa

Sign-in uses the real JWT login endpoint. The access token is held in React state and saved to this browser tab's `sessionStorage` under `smartshelf.session-token`. Passwords and account/role data are never saved in browser storage. Closing the tab normally ends its saved session; this is refresh persistence, not an indefinite remember-me option.

After refresh, `/auth/me` validates the saved token and reads the current account before protected screens render or make private feature requests. The route shows a loading state while this happens and preserves its URL. Stored data never supplies a trusted role or pharmacy. Login also waits for restoration before offering a new sign-in.

- A server 401 or invalid account response clears the token and requests sign-in again.
- Network/server failures preserve the token and offer Try again or Continue signed out. They do not silently authorize private screens or redirect to login as if credentials had expired.
- Sign-out clears memory and tab storage. Generation checks and abort signals prevent stale validation/sign-in requests from reviving a cancelled session.
- Existing focus/minute validation remains enabled. JWT validity is still the backend's one-hour limit; reload does not extend it and no refresh-token endpoint is introduced.
- Browsers that deny storage retain in-memory sign-in functionality; they cannot restore a token after reload.

Storage helpers and response-shape checks have unit coverage. Real isolated-database browser checks cover owner/pharmacist refresh at private routes, validation before feature requests, connection failure/retry, sign-out persistence, invalid/expired tokens and explicit clearing of a failed restoration. No production or development records are changed by those checks.
