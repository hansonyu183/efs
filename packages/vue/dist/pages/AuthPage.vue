<template>
<main class="efs-auth-layout" :class="layoutClasses" data-layout="auth">
 <div class="efs-auth-layout__content" :style="contentStyle">
  <header v-if="showTopBar" class="efs-auth-layout__topbar">
   <div class="efs-auth-layout__topbar-brand">
    <slot name="brand">
     <img v-if="props.logoSrc" class="efs-auth-layout__topbar-logo" :src="props.logoSrc" :alt="props.logoAlt || props.appName" />
     <div v-if="props.appName" class="efs-auth-layout__topbar-title">{{ props.appName }}</div>
    </slot>
   </div>

   <div v-if="showActionsBar" class="efs-auth-layout__actions">
    <slot name="locale-action">
    <LocaleSwitcher :model-value="props.locale" @update:model-value="(value) => emit('update:locale', value)" />
    </slot>

    <slot name="theme-action">
    <ThemeSwitcher :model-value="props.theme" @update:model-value="(value) => emit('update:theme', value)" />
    </slot>

    <slot name="actions" />
   </div>
  </header>

  <section class="efs-auth-layout__panel-shell">
   <div class="efs-auth-layout__panel">
     <header v-if="$slots.header" class="efs-auth-layout__header">
      <slot name="header">
      </slot>
     </header>

     <section v-if="showAlertsRegion" class="efs-auth-layout__alerts">
      <slot name="alerts" />
      <GlobalAlertsHost v-if="globalAlerts.hasItems.value" />
     </section>

     <section class="efs-auth-layout__body">
      <slot />
     </section>

     <footer v-if="$slots.footer" class="efs-auth-layout__footer">
      <slot name="footer">
             </slot>
     </footer>
    </div>
   </section>
  </div>
 </main>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import LocaleSwitcher from '../controls/LocaleSwitcher.vue'
import ThemeSwitcher from '../controls/ThemeSwitcher.vue'
import GlobalAlertsHost from '../interaction/GlobalAlertsHost.vue'
import { useAppAlerts } from '../shared/app-alerts'


defineOptions({ name: 'AuthPage' })

interface AuthPageProps {
 appName?: string
 logoSrc?: string
 logoAlt?: string
 locale?: string
 theme?: string
}

const props = withDefaults(defineProps<AuthPageProps>(), {
 appName: '',
 logoSrc: '',
 logoAlt: '',
 locale: 'zh-CN',
 theme: 'light',
})

const emit = defineEmits<{
 (e: 'update:locale', value: string): void
 (e: 'update:theme', value: string): void
}>()

const slots = useSlots()
const globalAlerts = useAppAlerts()
const showActionsBar = computed(() => Boolean(slots.actions) || Boolean(slots['locale-action']) || Boolean(slots['theme-action']) || true)
const showTopBar = computed(() => Boolean(slots.brand) || Boolean(props.logoSrc) || Boolean(props.appName) || showActionsBar.value)
const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
const contentStyle = computed(() => ({ maxWidth: '560px', '--efs-auth-panel-width': '100%' }))
const layoutClasses = computed(() => ({
 'efs-auth-layout--centered': true,
}))
</script>

<style scoped>
.efs-auth-layout {
 min-height: 100vh;
 display: block;
 padding: 20px 16px 24px;
 background:
  radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
  radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.1), transparent 24%),
  linear-gradient(180deg, var(--efs-surface-soft, #f8fafc) 0%, color-mix(in srgb, var(--efs-surface-soft, #f8fafc) 76%, white) 100%);
}

.efs-auth-layout--bg-strong {
 background:
  radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 32%),
  radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.18), transparent 28%),
  linear-gradient(180deg, color-mix(in srgb, var(--efs-surface-soft, #f8fafc) 45%, #dbeafe) 0%, color-mix(in srgb, var(--efs-surface-soft, #f8fafc) 65%, white) 100%);
}

.efs-auth-layout--bg-plain {
 background: var(--efs-surface-soft, #f8fafc);
}

.efs-auth-layout__content {
 width: min(100%, 560px);
 margin: 0 auto;
 display: grid;
 gap: 14px;
}

.efs-auth-layout--centered .efs-auth-layout__content {
 justify-items: stretch;
}

.efs-auth-layout__topbar {
 width: 100%;
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
 padding: 0;
}

.efs-auth-layout__topbar-brand {
 min-width: 0;
 display: flex;
 align-items: center;
 gap: 12px;
}

.efs-auth-layout__topbar-logo {
 width: 32px;
 height: 32px;
 object-fit: contain;
 display: block;
}

.efs-auth-layout__topbar-title {
 font-size: 1rem;
 font-weight: 700;
 color: var(--efs-text, #172033);
}

.efs-auth-layout__panel-shell {
 width: min(100%, var(--efs-auth-panel-width, 560px));
 min-width: 0;
 justify-self: stretch;
 display: grid;
 gap: 10px;
}

.efs-auth-layout__actions {
 display: flex;
 align-items: center;
 justify-content: flex-end;
 gap: 10px;
 flex-wrap: wrap;
}

.efs-auth-layout__actions :deep(.efs-localeswitcher),
.efs-auth-layout__actions :deep(.efs-themeswitcher) {
 box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.efs-auth-layout__panel {
 min-width: 0;
 width: 100%;
 border-radius: 24px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: color-mix(in srgb, var(--efs-surface, #ffffff) 92%, transparent);
 box-shadow: var(--efs-shadow, 0 20px 45px rgba(15, 23, 42, 0.08));
 backdrop-filter: blur(10px);
 padding: 24px;
 display: grid;
 gap: 16px;
}

.efs-auth-layout__header {
 margin-bottom: 4px;
 text-align: left;
}

.efs-auth-layout--centered:not(.efs-auth-layout--legacy-left) .efs-auth-layout__header {
 text-align: center;
}

.efs-auth-layout--legacy-left .efs-auth-layout__header {
 text-align: left;
}

.efs-auth-layout__title {
 font-size: 28px;
 font-weight: 700;
 color: #111827;
}

.efs-auth-layout__subtitle {
 margin-top: 8px;
 color: #4b5563;
 line-height: 1.6;
}

.efs-auth-layout__alerts {
 margin-bottom: 4px;
}

.efs-auth-layout__body {
 min-width: 0;
}

.efs-auth-layout__footer {
 display: grid;
 gap: 8px;
 border-top: 1px solid color-mix(in srgb, var(--efs-border, #dbe3ef) 88%, transparent);
 padding-top: 16px;
}

.efs-auth-layout__footer-text,
.efs-auth-layout__support-text {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.9rem;
 line-height: 1.6;
}

@media (max-width: 960px) {
 .efs-auth-layout--split .efs-auth-layout__content {
  grid-template-columns: 1fr;
 }

 .efs-auth-layout--split .efs-auth-layout__panel-shell {
  justify-self: center;
  width: min(100%, var(--efs-auth-panel-width, 460px));
 }

 .efs-auth-layout__hero-inner {
  padding: 24px;
 }
}

@media (max-width: 640px) {
 .efs-auth-layout {
  padding: 12px 12px 20px;
 }

 .efs-auth-layout__content {
  gap: 12px;
 }

 .efs-auth-layout__panel {
  padding: 18px 16px;
  border-radius: 20px;
 }

 .efs-auth-layout__title {
  font-size: 24px;
 }

 .efs-auth-layout__logo {
  width: min(100%, 180px);
 }

 .efs-auth-layout__actions {
  justify-content: center;
  flex-wrap: wrap;
 }
}
</style>
