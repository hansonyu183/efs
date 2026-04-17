import { createApp } from 'vue'
import { createAppPropsFromSchema } from '@efs/schema'
import { EfsApp } from '../../../packages/src/vue/index.ts'
import { appSchema } from '../schemas/app.schema'

const appProps: ReturnType<typeof createAppPropsFromSchema> = createAppPropsFromSchema(appSchema)

createApp(EfsApp, appProps as unknown as Record<string, unknown>).mount('#app')
