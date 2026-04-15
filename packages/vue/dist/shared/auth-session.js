const ACCESS_TOKEN_KEY = 'efs.auth.accessToken';
const REFRESH_TOKEN_KEY = 'efs.auth.refreshToken';
const EXPIRES_AT_KEY = 'efs.auth.expiresAt';
const TOKEN_TYPE_KEY = 'efs.auth.tokenType';
function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
function parseJwtExpiry(token) {
    const parts = token.split('.');
    if (parts.length < 2)
        return undefined;
    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const exp = Number(payload?.exp);
        if (!Number.isFinite(exp) || exp <= 0)
            return undefined;
        return new Date(exp * 1000).toISOString();
    }
    catch {
        return undefined;
    }
}
export function normalizeAuthSession(result) {
    return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt || parseJwtExpiry(result.accessToken),
        tokenType: result.tokenType,
    };
}
export function isAuthSessionExpired(session) {
    if (!session?.accessToken)
        return true;
    if (!session.expiresAt)
        return false;
    const expiresAt = Date.parse(session.expiresAt);
    if (!Number.isFinite(expiresAt))
        return false;
    return expiresAt <= Date.now();
}
export function resolveAuthStatus(session) {
    if (!session?.accessToken)
        return 'anonymous';
    if (isAuthSessionExpired(session))
        return 'expired';
    return 'authenticated';
}
export function loadStoredAuthSession() {
    if (!canUseStorage())
        return null;
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken)
        return null;
    const session = {
        accessToken,
        refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY) || undefined,
        expiresAt: window.localStorage.getItem(EXPIRES_AT_KEY) || undefined,
        tokenType: window.localStorage.getItem(TOKEN_TYPE_KEY) || undefined,
    };
    return resolveAuthStatus(session) === 'expired' ? null : session;
}
export function persistAuthSession(session) {
    if (!canUseStorage())
        return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    if (session.refreshToken)
        window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    else
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (session.expiresAt)
        window.localStorage.setItem(EXPIRES_AT_KEY, session.expiresAt);
    else
        window.localStorage.removeItem(EXPIRES_AT_KEY);
    if (session.tokenType)
        window.localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType);
    else
        window.localStorage.removeItem(TOKEN_TYPE_KEY);
}
export function clearStoredAuthSession() {
    if (!canUseStorage())
        return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(EXPIRES_AT_KEY);
    window.localStorage.removeItem(TOKEN_TYPE_KEY);
}
