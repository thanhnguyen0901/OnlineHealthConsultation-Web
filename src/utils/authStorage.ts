// sessionStorage is cleared on tab/window close, preventing token leakage on shared machines.
// Do NOT store the refresh token here; it must remain in the httpOnly cookie only.
const KEY_TOKEN = 'ohc_access_token';
const KEY_EXP = 'ohc_access_exp'; // stored as epoch-ms string

function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // atob requires standard base64; JWTs use base64url — replace padding chars.
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export interface StoredAuth {
  accessToken: string;
  expiresAtMs: number; // Unix epoch milliseconds
}

export function saveAuthToStorage(accessToken: string): void {
  try {
    const expSec = decodeJwtExp(accessToken);
    if (expSec === null) return;
    sessionStorage.setItem(KEY_TOKEN, accessToken);
    sessionStorage.setItem(KEY_EXP, String(expSec * 1000)); // seconds → epoch-ms
  } catch {
    // sessionStorage.setItem throws in some private-browsing contexts; refresh-cookie flow is the fallback.
  }
}

export function loadAuthFromStorage(): StoredAuth | null {
  try {
    const token = sessionStorage.getItem(KEY_TOKEN);
    const expStr = sessionStorage.getItem(KEY_EXP);
    if (!token || !expStr) return null;

    const expiresAtMs = Number(expStr);
    // 30 s early-expiry buffer: avoids attaching a token that expires before the in-flight request completes.
    const BUFFER_MS = 30_000;
    if (Date.now() >= expiresAtMs - BUFFER_MS) {
      clearAuthStorage();
      return null;
    }

    return { accessToken: token, expiresAtMs };
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  try {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_EXP);
  } catch {}
}
