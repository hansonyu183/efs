import type { EfsEndpointSchema } from '../resource/resource-schema'

export interface EfsAuthSchema {
  mode: 'token'
  login: EfsEndpointSchema
  logout?: EfsEndpointSchema
  orgs?: EfsEndpointSchema
  token?: EfsTokenSchema
  org?: EfsOrgSchema
}

export interface EfsTokenSchema {
  accessTokenField?: string
  refreshTokenField?: string
  expiresAtField?: string
  tokenTypeField?: string
}

export interface EfsOrgSchema {
  currentOrgCodeField?: string
}
