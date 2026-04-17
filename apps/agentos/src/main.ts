import { createApp } from 'vue'
import { EfsApp } from '@efs/vue/index.ts'
import { appSchema } from '../schemas/app.schema'

createApp(EfsApp, appSchema).mount('#app')
