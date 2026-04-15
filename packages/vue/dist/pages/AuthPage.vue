<template>
 <main class="efs-auth-layout" :class="layoutClasses" :data-layout="props.layout">
  <div class="efs-auth-layout__content" :style="{ maxWidth: props.maxWidth }">
   <section v-if="showHeroArea" class="efs-auth-layout__hero">
    <div class="efs-auth-layout__hero-inner">
     <div v-if="$slots.brand || props.logoSrc || props.appName" class="efs-auth-layout__brand">
      <slot name="brand">
       <img v-if="props.logoSrc" class="efs-auth-layout__logo" :src="props.logoSrc" :alt="props.logoAlt || props.appName" />
       <div v-else class="efs-auth-layout__wordmark">{{ props.appName }}</div>
      </slot>
     </div>

     <div v-if="$slots.hero || props.heroTitle || props.heroSubtitle" class="efs-auth-layout__hero-copy">
      <slot name="hero">
       <div v-if="props.heroTitle" class="efs-auth-layout__hero-title">{{ props.heroTitle }}</div>
       <div v-if="props.heroSubtitle" class="efs-auth-layout__hero-subtitle">{{ props.heroSubtitle }}</div>
      </slot>
     </div>
    </div>
   </section>

   <section class="efs-auth-layout__panel-shell" :style="panelStyle">
    <header v-if="showActionsBar" class="efs-auth-layout__actions">
     <slot name="locale-action">
      <LocaleSwitcher
       v-if="props.showLocaleSwitcher"
       :model-value="props.locale"
       :label="resolvedLocaleLabel"
       :options="resolvedLocaleOptions"
       @update:model-value="(value) => emit('update:locale', value)"
      />
     </slot>

     <slot name="theme-action">
      <ThemeSwitcher
       v-if="props.showThemeSwitcher"
       :model-value="props.theme"
       :label="resolvedThemeLabel"
       :options="resolvedThemeOptions"
       @update:model-value="(value) => emit('update:theme', value)"
      />
     </slot>

     <slot name="actions" />
    </header>

    <div class="efs-auth-layout__panel">
     <header v-if="props.title || props.subtitle || $slots.header" class="efs-auth-layout__header">
      <slot name="header">
       <div class="efs-auth-layout__title">{{ props.title }}</div>
       <div v-if="props.subtitle" class="efs-auth-layout__subtitle">{{ props.subtitle }}</div>
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
import { computed, inject, useSlots } from 'vue'
import LocaleSwitcher from '../controls/LocaleSwitcher.vue'
import ThemeSwitcher from '../controls/ThemeSwitcher.vue'
import GlobalAlertsHost from '../interaction/GlobalAlertsHost.vue'
import { useAppAlerts } from '../shared/app-alerts'
import { EFS_I18N_CONTEXT } from '../shared/efs-i18n'

defineOptions({ name: 'AuthPage' })

type PageOption = {
 label?: string
 title?: string
 value: string
}

interface AuthPageProps {
 title?: string
 subtitle?: string
 maxWidth?: string
 appName?: string
 logoSrc?: string
 logoAlt?: string
 layout?: 'centered' | 'split'
 panelWidth?: string
 heroTitle?: string
 heroSubtitle?: string
 showHero?: boolean
 showLocaleSwitcher?: boolean
 showThemeSwitcher?: boolean
 locale?: string
 theme?: string
}

const props = withDefaults(defineProps<AuthPageProps>(), {
 title: '',
 subtitle: '',
 maxWidth: '1120px',
 appName: '',
 logoSrc: '',
 logoAlt: '',
 layout: 'centered',
 panelWidth: '460px',
 heroTitle: '',
 heroSubtitle: '',
 showHero: true,
 showLocaleSwitcher: false,
 showThemeSwitcher: false,
 locale: 'zh-CN',
 theme: 'light',
})

const emit = defineEmits<{
 (e: 'update:locale', value: string): void
 (e: 'update:theme', value: string): void
}>()

const slots = useSlots()
const globalAlerts = useAppAlerts()
const i18nContext = inject(EFS_I18N_CONTEXT, null)
const showHeroArea = computed(() => props.showHero && (Boolean(slots.hero) || Boolean(slots.brand) || Boolean(props.logoSrc) || Boolean(props.appName) || Boolean(props.heroTitle) || Boolean(props.heroSubtitle) || props.layout === 'split'))
const showActionsBar = computed(() => props.showLocaleSwitcher || props.showThemeSwitcher || Boolean(slots.actions) || Boolean(slots['locale-action']) || Boolean(slots['theme-action']))
const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
const resolvedLocaleLabel = computed(() => resolveCopy('efs.shell.localeLabel', '语言'))
const resolvedThemeLabel = computed(() => resolveCopy('efs.shell.themeLabel', '主题'))
const resolvedLocaleOptions = computed<PageOption[]>(() => [
 { label: resolveCopy('efs.localeOptions.zh-CN', '中'), value: 'zh-CN' },
 { label: resolveCopy('efs.localeOptions.en-US', 'EN'), value: 'en-US' },
])
const resolvedThemeOptions = computed<PageOption[]>(() => [
 { label: resolveCopy('efs.themeOptions.light', '明'), value: 'light' },
 { label: resolveCopy('efs.themeOptions.dark', '暗'), value: 'dark' },
])
const panelStyle = computed(() => ({ '--efs-auth-panel-width': props.panelWidth }))
const layoutClasses = computed(() => ({
 'efs-auth-layout--split': props.layout === 'split',
 'efs-auth-layout--centered': props.layout === 'centered',
}))

function resolveCopy(key: string, fallback: string) {
 return i18nContext?.translate(key) || fallback
}
</script>

<style scoped>
.efs-auth-layout {
 min-height: 100vh;
 display: flex;
 align-items: center;
 justify-content: center;
 padding: 32px 20px;
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
 width: min(100%, 1120px);
 display: grid;
 gap: 20px;
}

.efs-auth-layout--split .efs-auth-layout__content {
 grid-template-columns: minmax(0, 1.15fr) minmax(320px, var(--efs-auth-panel-width, 460px));
 align-items: stretch;
}

.efs-auth-layout--centered .efs-auth-layout__content {
 justify-items: center;
}

.efs-auth-layout__hero {
 min-width: 0;
 display: grid;
}

.efs-auth-layout__hero-inner {
 min-height: 100%;
 border-radius: 28px;
 padding: 32px;
 background: color-mix(in srgb, var(--efs-primary, #2563eb) 7%, var(--efs-surface, #ffffff));
 border: 1px solid color-mix(in srgb, var(--efs-primary, #2563eb) 12%, var(--efs-border, #dbe3ef));
 display: grid;
 align-content: space-between;
 gap: 24px;
}

.efs-auth-layout--centered .efs-auth-layout__hero {
 width: min(100%, 560px);
}

.efs-auth-layout__brand {
 display: flex;
 justify-content: flex-start;
}

.efs-auth-layout--centered .efs-auth-layout__brand {
 justify-content: center;
}

.efs-auth-layout__logo {
 width: min(100%, 240px);
 height: auto;
 display: block;
}

.efs-auth-layout__wordmark {
 font-size: 1.75rem;
 font-weight: 800;
 color: var(--efs-text, #172033);
}

.efs-auth-layout__hero-copy {
 display: grid;
 gap: 12px;
}

.efs-auth-layout__hero-title {
 font-size: clamp(1.8rem, 3vw, 2.6rem);
 font-weight: 800;
 line-height: 1.12;
 color: var(--efs-text, #172033);
}

.efs-auth-layout__hero-subtitle {
 max-width: 46ch;
 color: var(--efs-text-muted, #64748b);
 line-height: 1.7;
}

.efs-auth-layout__panel-shell {
 width: min(100%, var(--efs-auth-panel-width, 460px));
 min-width: 0;
 justify-self: center;
 display: grid;
 gap: 12px;
}

.efs-auth-layout--split .efs-auth-layout__panel-shell {
 justify-self: end;
 align-self: center;
}

.efs-auth-layout__actions {
 display: flex;
 align-items: center;
 justify-content: flex-end;
 gap: 10px;
}

.efs-auth-layout__actions :deep(.efs-localeswitcher),
.efs-auth-layout__actions :deep(.efs-themeswitcher) {
 box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.efs-auth-layout__panel {
 min-width: 0;
 border-radius: 28px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: color-mix(in srgb, var(--efs-surface, #ffffff) 92%, transparent);
 box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
 backdrop-filter: blur(10px);
 padding: 28px;
 display: grid;
 gap: 18px;
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
  padding: 20px 14px;
 }

 .efs-auth-layout__content {
  gap: 16px;
 }

 .efs-auth-layout__panel {
  padding: 22px 18px;
  border-radius: 22px;
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
