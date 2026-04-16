import type { AppAuthContract } from './auth-contract'
import type { PlatformMain } from './main-contract'

export interface PlatformApp {
  kind: 'app'
  auth: AppAuthContract
  main: PlatformMain
}
