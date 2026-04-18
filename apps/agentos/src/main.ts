// Platform-owned bootstrap wiring. This file may import internal EFS runtime modules,
// but those imports are not part of the stable business authoring contract.
import { createApp } from 'vue'
import { EfsApp } from '@efs/vue/index.ts'
import { efsI18n } from '@efs/vue/i18n.ts'
import { vuetify } from '@efs/vue/vuetify.ts'
import { appSchema } from '../schemas/app.schema'

createApp(EfsApp, appSchema).use(efsI18n).use(vuetify).mount('#app')
