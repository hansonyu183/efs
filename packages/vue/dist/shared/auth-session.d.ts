import type { AuthLoginResult } from '../controller/auth-controller';
export type AuthStatus = 'anonymous' | 'authenticated' | 'expired';
export interface StoredAuthSession {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    tokenType?: string;
}
export declare function normalizeAuthSession(result: AuthLoginResult): StoredAuthSession;
export declare function isAuthSessionExpired(session: StoredAuthSession | null | undefined): boolean;
export declare function resolveAuthStatus(session: StoredAuthSession | null | undefined): AuthStatus;
export declare function loadStoredAuthSession(): StoredAuthSession | null;
export declare function persistAuthSession(session: StoredAuthSession): void;
export declare function clearStoredAuthSession(): void;
