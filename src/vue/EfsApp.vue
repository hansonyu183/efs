<template>
<div class="efs-app-shell" :data-theme="theme">
 <AuthPage
  v-if="showAuthPage"
  :app-name="props.app.title || props.app.name || resolvedBrandTitle"
  :logo-src="props.app.brandIcon || ''"
  :logo-alt="props.app.title || props.app.name || resolvedBrandTitle"
  :locale="locale"
  :theme="theme"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
 >
  <template #header>
   <div class="efs-auth-layout__title">{{ resolvedLoginTitle }}</div>
   <div v-if="resolvedLoginSubtitle" class="efs-auth-layout__subtitle">{{ resolvedLoginSubtitle }}</div>
  </template>
  <form class="efs-app__login-form" @submit.prevent="handleLogin">
   <AppField :label="resolvedLoginNameLabel">
    <AppInput
     :model-value="loginName"
     :placeholder="resolvedLoginNamePlaceholder"
     autocomplete="username"
     @update:model-value="loginName = $event"
    />
   </AppField>
   <AppField :label="resolvedLoginPasswordLabel">
    <AppInput
     :model-value="loginPwd"
     :placeholder="resolvedLoginPasswordPlaceholder"
     type="password"
     autocomplete="current-password"
     @update:model-value="loginPwd = $event"
    />
   </AppField>
<p v-if="authError" class="efs-app__auth-error">{{ authError }}</p>
   <AppButton variant="primary" type="submit" block :disabled="authBusy">
    {{ authBusy ? resolvedLoginSubmittingLabel : resolvedLoginSubmitLabel }}
   </AppButton>
  </form>
 </AuthPage>

 <MainPage
  v-else
  :brand-icon="props.app.brandIcon || ''"
  :title="resolvedMainTitle"
  :app-name="props.app.title || props.app.name || ''"
  :brand-title="resolvedBrandTitle"
  :brand-subtitle="resolvedBrandSubtitle"
  :locale="locale"
  :theme="theme"
  @update:locale="handleLocaleUpdate"
  @update:theme="handleThemeUpdate"
  @logout="handleLogout"
 >
  <template #sidebar>
   <EfsSidebarNav :items="sidebarMenus" :current-path="currentPath" @navigate="handleNavigate" />
  </template>

  <slot v-if="$slots.default" />
  <ResolvedResPage
   v-else-if="resourceModel"
   :resource-model="resourceModel"
   :path="currentPath"
  />
  <ErrorState v-else :title="resolvedEmptyTitle" :message="resolvedEmptySubtitle" icon="∅" />
 </MainPage>
</div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import type { PropType } from 'vue'
import { type EfsAppSchema } from '../schema/index.ts'
import { EFS_I18N_CONTEXT, resolveEfsI18nLabel } from '../model/app/i18n'
import { useEfsAppModel } from '../model/app/efs-app'
import AppButton from './controls/AppButton.vue'
import AppField from './controls/AppField.vue'
import AppInput from './controls/AppInput.vue'
import ErrorState from './feedback/ErrorState.vue'
import AuthPage from './pages/AuthPage.vue'
import MainPage from './pages/MainPage.vue'
import EfsSidebarNav from './pages/EfsSidebarNav.vue'
import ResolvedResPage from './pages/ResolvedResPage.vue'

defineOptions({ name: 'EfsApp' })

const props = defineProps({
 schemaVersion: {
  type: String,
  required: true,
 },
 app: {
  type: Object as PropType<EfsAppSchema['app']>,
  required: true,
 },
 auth: {
  type: Object as PropType<EfsAppSchema['auth']>,
  required: false,
 },
 services: {
  type: Object as PropType<EfsAppSchema['services']>,
  required: false,
 },
 i18n: {
  type: Object as PropType<EfsAppSchema['i18n']>,
  required: false,
 },
 domains: {
  type: Array as PropType<EfsAppSchema['domains']>,
  required: true,
 },
}) as Readonly<EfsAppSchema>
const {
 mergedI18n,
 locale,
 theme,
 loginName,
 loginPwd,
 authBusy,
 authError,
 sidebarMenus,
 currentPath,
 resourceModel,
 resolvedBrandTitle,
 resolvedBrandSubtitle,
 resolvedEmptyTitle,
 resolvedEmptySubtitle,
 resolvedLoginTitle,
 resolvedLoginSubtitle,
 resolvedLoginNameLabel,
 resolvedLoginNamePlaceholder,
 resolvedLoginPasswordLabel,
 resolvedLoginPasswordPlaceholder,
 resolvedLoginSubmitLabel,
 resolvedLoginSubmittingLabel,
 resolvedMainTitle,
 showAuthPage,
 handleLocaleUpdate,
 handleThemeUpdate,
 handleNavigate,
 handleLogin,
 handleLogout,
} = useEfsAppModel(props)

provide(EFS_I18N_CONTEXT, {
 config: mergedI18n,
 translate: (key: string) => resolveEfsI18nLabel({ key, config: mergedI18n.value }),
})
</script>

<style scoped>
.efs-app-shell {
 --efs-surface-soft: #f4f7fb;
 --efs-surface: #ffffff;
 --efs-border: #dbe3ef;
 --efs-text: #172033;
 --efs-text-muted: #64748b;
 --efs-primary: #2563eb;
 --efs-danger: #dc2626;
 --efs-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
 color: var(--efs-text);
 background: var(--efs-surface-soft);
 min-height: 100vh;
 min-height: 100dvh;
}

.efs-app-shell[data-theme='dark'] {
 --efs-surface-soft: #0f172a;
 --efs-surface: #111827;
 --efs-border: #334155;
 --efs-text: #e5eefb;
 --efs-text-muted: #94a3b8;
 --efs-primary: #60a5fa;
 --efs-danger: #f87171;
 --efs-shadow: 0 22px 50px rgba(2, 6, 23, 0.45);
 background: var(--efs-surface-soft);
}

.efs-app-shell :deep(*),
.efs-app-shell :deep(*::before),
.efs-app-shell :deep(*::after) {
 box-sizing: border-box;
}

.efs-app__login-form {
 display: grid;
 gap: 16px;
 width: 100%;
}

.efs-app__auth-error {
 margin: 0;
 color: var(--efs-danger);
 font-size: 0.95rem;
 line-height: 1.5;
}
</style>
