/**
 * sessionStorage helpers for access-token persistence.
 *
 * WHY sessionStorage (not localStorage)?
 *   - sessionStorage is cleared when the tab / browser closes, so a stolen or
 *     shared machine never leaks a user's token across sessions.
 *   - It IS preserved across F5 / hard-reload within the same tab, which is
 *     exactly what we need: reload does not call POST /api/auth/refresh.
 *
 * WHAT is stored?
 *   - ohc_access_token  — the raw JWT access token (string)
 *   - ohc_access_exp    — Unix epoch milliseconds at which the token expires
 *
 * SECURITY notes:
 *   - The access token is already readable by any JS on the page, so
 *     sessionStorage gives no weaker security guarantee than in-memory Redux
 *     for XSS attacks.
 *   - Do NOT store the refresh token here — it must remain httpOnly cookie only.
 */

// ─── storage keys ───────────────────────────────────────────────────────────

const KEY_TOKEN = 'ohc_access_token';
const KEY_EXP   = 'ohc_access_exp';   // stored as epoch-ms string

// ─── internal helpers ────────────────────────────────────────────────────────

/**
 * Decode the `exp` claim from a JWT without any external library.
 * Returns the Unix timestamp in **seconds**, or null on parse failure.
 */
function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // atob requires standard base64; JWTs use base64url — replace padding chars
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

// ─── public interface ────────────────────────────────────────────────────────

export interface StoredAuth {
  accessToken: string;
  /** Unix timestamp in **milliseconds** — moment the token expires. */
  expiresAtMs: number;
}

/**
 * Persist the access token in sessionStorage.
 * The expiry is decoded from the JWT `exp` claim, so the stored value is
 * always authoritative and never derived from a hard-coded TTL constant.
 *
 * Silently no-ops if:
 *   - the token has no readable `exp`
 *   - sessionStorage is unavailable (private browsing restrictions)
 */
export function saveAuthToStorage(accessToken: string): void {
  try {
    const expSec = decodeJwtExp(accessToken);
    if (expSec === null) return; // cannot persist without knowing expiry
    sessionStorage.setItem(KEY_TOKEN, accessToken);
    sessionStorage.setItem(KEY_EXP,   String(expSec * 1000)); // → epoch-ms
  } catch {
    // sessionStorage.setItem may throw in certain private-browsing contexts.
    // Auth falls back to the refresh-cookie flow transparently.
  }
}

/**
 * Load stored auth from sessionStorage.
 * Returns null when:
 *   - the keys are absent
 *   - the token is already expired (or within the 30-second buffer)
 *
 * Automatically removes stale keys so they don't clutter storage.
 */
export function loadAuthFromStorage(): StoredAuth | null {
  try {
    const token  = sessionStorage.getItem(KEY_TOKEN);
    const expStr = sessionStorage.getItem(KEY_EXP);
    if (!token || !expStr) return null;

    const expiresAtMs = Number(expStr);
    // 30-second early-expiry buffer: don't hand out a token that will expire
    // before the in-flight request it's attached to can complete.
    const BUFFER_MS = 30_000;
    if (Date.now() >= expiresAtMs - BUFFER_MS) {
      clearAuthStorage(); // remove stale keys eagerly
      return null;
    }

    return { accessToken: token, expiresAtMs };
  } catch {
    return null;
  }
}

/**
 * Remove all auth keys from sessionStorage.
 * Call on explicit logout and whenever a token is found to be invalid.
 */
export function clearAuthStorage(): void {
  try {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_EXP);
  } catch {
    // ignore — if storage threw, there's nothing to clean up
  }
}
