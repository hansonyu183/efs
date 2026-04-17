export interface AuthLoginInput {
  name: string
  pwd: string
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
  getCurrentAccessToken?: () => string | undefined
  setCurrentAccessToken?: (token?: string) => void | Promise<void>
}
