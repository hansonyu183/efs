import type { AppAuthContract } from './auth'
import type { PlatformMain } from './main'

export interface PlatformApp {
  kind: 'app'
  auth: AppAuthContract
  main: PlatformMain
}
