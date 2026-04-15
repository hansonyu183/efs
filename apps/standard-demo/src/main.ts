import { createApp } from 'vue'
import { createPlatformEfsAppPropsFromSchema } from '@efs/schema'
import { EfsApp } from '@efs/vue'
import { appSchema } from '../schemas/app.schema'

createApp(EfsApp, createPlatformEfsAppPropsFromSchema(appSchema)).mount('#app')
