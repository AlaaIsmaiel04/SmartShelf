import type { SessionUser } from '@smartshelf/contracts';

export const SESSION_TOKEN_KEY = 'smartshelf.session-token';

// Store only the bearer token for this tab; account/role data is fetched afresh.
export function readSessionToken(): string | null {
  try {
    const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    return token?.trim() && token.length <= 8192 ? token : null;
  } catch {
    return null;
  }
}

export function storeSessionToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Browsers that block storage still support the in-memory session.
  }
}

export function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<SessionUser>;
  return (
    typeof user.id === 'string' &&
    !!user.id &&
    typeof user.email === 'string' &&
    !!user.email &&
    ((user.role === 'OWNER' && user.pharmacyId === null) ||
      (user.role === 'PHARMACIST' &&
        typeof user.pharmacyId === 'string' &&
        !!user.pharmacyId))
  );
}
