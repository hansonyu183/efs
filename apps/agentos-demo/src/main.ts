import { createApp } from 'vue'
import { createPlatformAppFromSchema } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from '../user-apps/agentos/app.schema'

const app = createPlatformAppFromSchema(appSchema)
const appName = appSchema.app.title || appSchema.app.name

createApp(EfsApp, {
  app,
  appName,
}).mount('#app')
