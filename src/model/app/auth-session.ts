import { useStorage } from '@vueuse/core'
import type { AuthLoginResult } from '../types/auth'

export type AuthStatus = 'anonymous' | 'authenticated' | 'expired'

export interface StoredAuthSession {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  tokenType?: string
}

const ACCESS_TOKEN_KEY = 'efs.auth.accessToken'
const REFRESH_TOKEN_KEY = 'efs.auth.refreshToken'
const EXPIRES_AT_KEY = 'efs.auth.expiresAt'
const TOKEN_TYPE_KEY = 'efs.auth.tokenType'

const accessTokenStorage = useStorage<string | null>(ACCESS_TOKEN_KEY, null)
const refreshTokenStorage = useStorage<string | null>(REFRESH_TOKEN_KEY, null)
const expiresAtStorage = useStorage<string | null>(EXPIRES_AT_KEY, null)
const tokenTypeStorage = useStorage<string | null>(TOKEN_TYPE_KEY, null)

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseJwtExpiry(token: string): string | undefined {
  const parts = token.split('.')
  if (parts.length < 2) return undefined
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const exp = Number(payload?.exp)
    if (!Number.isFinite(exp) || exp <= 0) return undefined
    return new Date(exp * 1000).toISOString()
  } catch {
    return undefined
  }
}

export function normalizeAuthSession(result: AuthLoginResult): StoredAuthSession {
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt || parseJwtExpiry(result.accessToken),
    tokenType: result.tokenType,
  }
}

export function isAuthSessionExpired(session: StoredAuthSession | null | undefined): boolean {
  if (!session?.accessToken) return true
  if (!session.expiresAt) return false
  const expiresAt = Date.parse(session.expiresAt)
  if (!Number.isFinite(expiresAt)) return false
  return expiresAt <= Date.now()
}

export function resolveAuthStatus(session: StoredAuthSession | null | undefined): AuthStatus {
  if (!session?.accessToken) return 'anonymous'
  if (isAuthSessionExpired(session)) return 'expired'
  return 'authenticated'
}

export function loadStoredAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null
  const accessToken = accessTokenStorage.value
  if (!accessToken) return null
  const session: StoredAuthSession = {
    accessToken,
    refreshToken: refreshTokenStorage.value || undefined,
    expiresAt: expiresAtStorage.value || undefined,
    tokenType: tokenTypeStorage.value || undefined,
  }
  return resolveAuthStatus(session) === 'expired' ? null : session
}

export function persistAuthSession(session: StoredAuthSession) {
  if (!canUseStorage()) return
  accessTokenStorage.value = session.accessToken
  refreshTokenStorage.value = session.refreshToken || null
  expiresAtStorage.value = session.expiresAt || null
  tokenTypeStorage.value = session.tokenType || null
}

export function clearStoredAuthSession() {
  if (!canUseStorage()) return
  accessTokenStorage.value = null
  refreshTokenStorage.value = null
  expiresAtStorage.value = null
  tokenTypeStorage.value = null
}
