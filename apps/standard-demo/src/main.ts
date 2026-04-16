import { createApp } from 'vue'
import { createAppPropsFromSchema } from '@efs/schema'
import { EfsApp } from '../../../packages/vue/src/index.ts'
import { appSchema } from '../schemas/app.schema'

createApp(EfsApp, createAppPropsFromSchema(appSchema)).mount('#app')
