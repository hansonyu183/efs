import type { AuthOption } from './resource-model'

export interface AuthLoginInput {
  name: string
  pwd: string
  orgCode?: string
}

export interface AuthLoginResult {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  tokenType?: string
}

export interface AppAuthContract {
  kind: 'auth'
  login: (input: AuthLoginInput) => AuthLoginResult | Promise<AuthLoginResult>
  logout?: () => void | Promise<void>
  getOrgs?: () => readonly AuthOption[] | Promise<readonly AuthOption[]>
  getCurrentOrgCode?: () => string | undefined
  setCurrentOrgCode?: (orgCode: string) => void | Promise<void>
  getCurrentAccessToken?: () => string | undefined
  setCurrentAccessToken?: (token?: string) => void | Promise<void>
}
