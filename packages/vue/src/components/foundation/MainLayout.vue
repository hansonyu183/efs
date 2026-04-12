<template>
  <div class="efs-main-layout" :class="layoutClasses" :data-dense="props.dense ? 'true' : 'false'">
    <aside
      v-if="shouldRenderSidebar"
      class="efs-main-layout__sidebar"
      :class="{ 'efs-main-layout__sidebar--open': sidebarOpen }"
    >
      <div class="efs-main-layout__brand-wrap">
        <slot name="brand">
          <div class="efs-main-layout__brand-mark">{{ brandInitial }}</div>
          <div class="efs-main-layout__brand-copy">
            <strong class="efs-main-layout__brand">{{ resolvedBrandTitle }}</strong>
            <span v-if="resolvedBrandSubtitle" class="efs-main-layout__brand-subtitle">{{ resolvedBrandSubtitle }}</span>
          </div>
        </slot>
      </div>

      <nav class="efs-main-layout__nav" @click="onSidebarClick">
        <slot name="sidebar" />
      </nav>
    </aside>

    <button
      v-if="shouldRenderSidebar && sidebarOpen && isMobile"
      class="efs-main-layout__scrim"
      type="button"
      :aria-label="props.mobileMenuLabel"
      @click="closeSidebar"
    />

    <div class="efs-main-layout__main">
      <header class="efs-main-layout__header">
        <div class="efs-main-layout__header-left">
          <button
            v-if="shouldRenderSidebar"
            class="efs-main-layout__iconbutton"
            type="button"
            :aria-label="props.mobileMenuLabel"
            @click="toggleSidebar"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <div class="efs-main-layout__header-meta">
            <slot name="header-title">
              <div class="efs-main-layout__title">{{ resolvedTitle }}</div>
              <div v-if="resolvedSubtitle" class="efs-main-layout__subtitle">{{ resolvedSubtitle }}</div>
            </slot>
          </div>
        </div>

        <div class="efs-main-layout__toolbar">
          <slot name="toolbar" />

          <label v-if="props.orgOptions.length > 0" class="efs-main-layout__org-switcher">
            <span class="efs-main-layout__org-label">{{ props.orgLabel }}</span>
            <AppSelect
              :model-value="props.currentOrgCode || props.orgCode"
              :options="props.orgOptions"
              @update:model-value="(value) => emit('update:org', value)"
            />
          </label>

          <button
            v-if="props.localeOptions.length > 1"
            class="efs-main-layout__iconbutton efs-main-layout__iconbutton--text"
            type="button"
            :title="props.localeLabel"
            :aria-label="props.localeLabel"
            @click="emitNextLocale"
          >
            {{ localeShortLabel }}
          </button>

          <button
            v-if="props.themeOptions.length > 0"
            class="efs-main-layout__iconbutton"
            type="button"
            :title="props.themeLabel"
            :aria-label="props.themeLabel"
            @click="emitNextTheme"
          >
            <span aria-hidden="true">{{ themeGlyph }}</span>
          </button>

          <details v-if="hasUserMenu" ref="menuRef" class="efs-main-layout__usermenu">
            <summary class="efs-main-layout__usertrigger">
              <span class="efs-main-layout__avatar">{{ initials }}</span>
              <span class="efs-main-layout__usertext">
                <strong>{{ props.userDisplayName || props.username || resolvedTitle }}</strong>
                <small>{{ props.username || props.userSubtitle || props.orgCode }}</small>
              </span>
            </summary>
            <div class="efs-main-layout__usermenu-panel">
              <button v-if="props.enableProfileActions" type="button" @click="openProfileDialog">{{ props.profileLabel }}</button>
              <button v-if="props.enablePasswordActions" type="button" @click="openPasswordDialog">{{ props.passwordLabel }}</button>
              <button type="button" class="efs-main-layout__logout-action" @click="emitLogout">{{ props.logoutLabel }}</button>
            </div>
          </details>
        </div>
      </header>

      <section v-if="$slots.alerts" class="efs-main-layout__alerts">
        <slot name="alerts" />
      </section>

      <main class="efs-main-layout__content">
        <slot />
      </main>
    </div>

    <div v-if="profileDialogOpen" class="efs-main-layout__dialog-backdrop" @click.self="profileDialogOpen = false">
      <AppPanel class="efs-main-layout__dialog" :title="props.profileLabel" :subtitle="props.profileDialogSubtitle">
        <form class="efs-main-layout__dialog-form" @submit.prevent="submitProfile">
          <AppField :label="props.displayNameLabel">
            <AppInput v-model="profileForm.displayName" :placeholder="props.displayNameLabel" />
          </AppField>
          <AppField :label="props.usernameLabel">
            <AppInput :model-value="props.username" :placeholder="props.usernameLabel" autocomplete="username" type="text" :readonly="true" />
          </AppField>
          <div class="efs-main-layout__dialog-actions">
            <AppButton type="button" @click="profileDialogOpen = false">{{ props.cancelLabel }}</AppButton>
            <AppButton variant="primary" type="submit" :disabled="!profileForm.displayName.trim()">{{ props.saveLabel }}</AppButton>
          </div>
        </form>
      </AppPanel>
    </div>

    <div v-if="passwordDialogOpen" class="efs-main-layout__dialog-backdrop" @click.self="passwordDialogOpen = false">
      <AppPanel class="efs-main-layout__dialog" :title="props.passwordLabel" :subtitle="props.passwordDialogSubtitle">
        <form class="efs-main-layout__dialog-form" @submit.prevent="submitPassword">
          <AppField :label="props.currentPasswordLabel">
            <AppInput v-model="passwordForm.currentPassword" :placeholder="props.currentPasswordLabel" type="password" autocomplete="current-password" />
          </AppField>
          <AppField :label="props.newPasswordLabel">
            <AppInput v-model="passwordForm.newPassword" :placeholder="props.newPasswordLabel" type="password" autocomplete="new-password" />
          </AppField>
          <AppField :label="props.confirmPasswordLabel">
            <AppInput v-model="passwordForm.confirmPassword" :placeholder="props.confirmPasswordLabel" type="password" autocomplete="new-password" />
          </AppField>
          <p v-if="showPasswordMismatch" class="efs-main-layout__dialog-note">{{ props.passwordMismatchMessage }}</p>
          <div class="efs-main-layout__dialog-actions">
            <AppButton type="button" @click="passwordDialogOpen = false">{{ props.cancelLabel }}</AppButton>
            <AppButton variant="primary" type="submit" :disabled="passwordSubmitDisabled">{{ props.saveLabel }}</AppButton>
          </div>
        </form>
      </AppPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, useSlots } from 'vue'
import AppButton from './AppButton.vue'
import AppField from './AppField.vue'
import AppInput from './AppInput.vue'
import AppPanel from './AppPanel.vue'
import AppSelect from './AppSelect.vue'

defineOptions({ name: 'MainLayout' })

type LayoutOption = {
  title?: string
  label?: string
  value: string
}

interface MainLayoutProps {
  title?: string
  subtitle?: string
  brandTitle?: string
  orgCode?: string
  showSidebar?: boolean
  dense?: boolean
  appName?: string
  brandSubtitle?: string
  topbarSubtitle?: string
  mobileMenuLabel?: string
  orgLabel?: string
  localeLabel?: string
  themeLabel?: string
  profileLabel?: string
  passwordLabel?: string
  logoutLabel?: string
  saveLabel?: string
  cancelLabel?: string
  displayNameLabel?: string
  usernameLabel?: string
  currentPasswordLabel?: string
  newPasswordLabel?: string
  confirmPasswordLabel?: string
  passwordMismatchMessage?: string
  profileDialogSubtitle?: string
  passwordDialogSubtitle?: string
  currentOrgCode?: string
  locale?: string
  theme?: string
  userDisplayName?: string
  username?: string
  userSubtitle?: string
  orgOptions?: LayoutOption[]
  localeOptions?: LayoutOption[]
  themeOptions?: LayoutOption[]
  enableUserMenu?: boolean
  enableProfileActions?: boolean
  enablePasswordActions?: boolean
}

const props = withDefaults(defineProps<MainLayoutProps>(), {
  title: '',
  subtitle: '',
  brandTitle: '',
  orgCode: '',
  showSidebar: true,
  dense: false,
  appName: '',
  brandSubtitle: '',
  topbarSubtitle: '',
  mobileMenuLabel: 'Toggle navigation',
  orgLabel: 'Organization',
  localeLabel: 'Language',
  themeLabel: 'Theme',
  profileLabel: 'Edit profile',
  passwordLabel: 'Change password',
  logoutLabel: 'Log out',
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  displayNameLabel: 'Display name',
  usernameLabel: 'Username',
  currentPasswordLabel: 'Current password',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm password',
  passwordMismatchMessage: 'The new password confirmation does not match.',
  profileDialogSubtitle: 'Update the profile information shown in the workbench shell.',
  passwordDialogSubtitle: 'Change the password used for this workbench account.',
  currentOrgCode: '',
  locale: '',
  theme: '',
  userDisplayName: '',
  username: '',
  userSubtitle: '',
  orgOptions: () => [],
  localeOptions: () => [],
  themeOptions: () => [],
  enableUserMenu: false,
  enableProfileActions: true,
  enablePasswordActions: true,
})

const emit = defineEmits<{
  (e: 'update:org', value: string): void
  (e: 'update:locale', value: string): void
  (e: 'update:theme', value: string): void
  (e: 'save-profile', value: { displayName: string }): void
  (e: 'save-password', value: { currentPassword: string; newPassword: string; confirmPassword: string }): void
  (e: 'logout'): void
}>()

const slots = useSlots()
const menuRef = ref<HTMLDetailsElement | null>(null)
const profileDialogOpen = ref(false)
const passwordDialogOpen = ref(false)
const sidebarOpen = ref(false)
const sidebarCompact = ref(false)
const isMobile = ref(false)
const profileForm = reactive({ displayName: props.userDisplayName })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

watch(() => props.userDisplayName, (value) => {
  profileForm.displayName = value
})

const shouldRenderSidebar = computed(() => props.showSidebar || Boolean(slots.sidebar))

const resolvedTitle = computed(() => props.title || props.appName || 'Workbench')
const resolvedSubtitle = computed(() => props.subtitle || props.topbarSubtitle || props.userSubtitle || props.orgCode)
const resolvedBrandTitle = computed(() => props.brandTitle || props.appName || props.title || 'Workbench')
const resolvedBrandSubtitle = computed(() => props.brandSubtitle || props.userSubtitle || props.subtitle || props.orgCode)
const hasUserMenu = computed(() => props.enableUserMenu || Boolean(props.userDisplayName || props.username))

const layoutClasses = computed(() => ({
  'efs-main-layout--sidebar-compact': sidebarCompact.value,
  'efs-main-layout--sidebar-hidden': !shouldRenderSidebar.value,
}))

function syncViewport() {
  if (typeof window === 'undefined') return
  isMobile.value = window.innerWidth <= 960
  sidebarOpen.value = shouldRenderSidebar.value && !isMobile.value
  if (isMobile.value) sidebarCompact.value = false
}

onMounted(() => {
  syncViewport()
  if (typeof window !== 'undefined') window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
})

const initials = computed(() => {
  const source = (props.userDisplayName || props.username || resolvedTitle.value).trim()
  if (!source) return 'U'
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || source.slice(0, 1).toUpperCase()
})

const brandInitial = computed(() => resolvedBrandTitle.value.trim().slice(0, 1).toUpperCase() || 'A')
const showPasswordMismatch = computed(() => Boolean(passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword))
const passwordSubmitDisabled = computed(() => !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || showPasswordMismatch.value)

const localeShortLabel = computed(() => {
  const current = props.localeOptions.find((option) => option.value === props.locale)
  const label = current?.label ?? current?.title ?? props.locale
  if (!label) return '中'
  if (label.startsWith('简')) return '中'
  if (label.toLowerCase().startsWith('en')) return 'EN'
  return label.slice(0, 2).toUpperCase()
})

const themeGlyph = computed(() => (props.theme === 'dark' ? '☾' : '☀'))

function getNextOptionValue(options: LayoutOption[], currentValue: string) {
  if (options.length === 0) return currentValue
  const currentIndex = options.findIndex((option) => option.value === currentValue)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0
  return options[nextIndex]?.value ?? currentValue
}

function toggleSidebar() {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
    return
  }
  sidebarCompact.value = !sidebarCompact.value
}

function closeSidebar() {
  if (isMobile.value) sidebarOpen.value = false
}

function onSidebarClick() {
  if (isMobile.value) closeSidebar()
}

function closeUserMenu() {
  if (menuRef.value) menuRef.value.open = false
}

function emitNextLocale() {
  emit('update:locale', getNextOptionValue(props.localeOptions, props.locale))
}

function emitNextTheme() {
  emit('update:theme', getNextOptionValue(props.themeOptions, props.theme))
}

function openProfileDialog() {
  passwordDialogOpen.value = false
  profileForm.displayName = props.userDisplayName
  closeUserMenu()
  profileDialogOpen.value = true
}

function openPasswordDialog() {
  profileDialogOpen.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  closeUserMenu()
  passwordDialogOpen.value = true
}

function submitProfile() {
  emit('save-profile', { displayName: profileForm.displayName.trim() })
  profileDialogOpen.value = false
}

function submitPassword() {
  if (passwordSubmitDisabled.value) return
  emit('save-password', {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
    confirmPassword: passwordForm.confirmPassword,
  })
  passwordDialogOpen.value = false
}

function emitLogout() {
  closeUserMenu()
  emit('logout')
}
</script>

<style scoped>
.efs-main-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: var(--efs-surface-soft, #f4f7fb);
  color: var(--efs-text, #172033);
}

.efs-main-layout[data-dense='true'],
.efs-main-layout--sidebar-compact {
  grid-template-columns: 88px minmax(0, 1fr);
}

.efs-main-layout--sidebar-hidden {
  grid-template-columns: minmax(0, 1fr);
}

.efs-main-layout__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 16px 14px;
  border-right: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 30;
}

.efs-main-layout__brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
}

.efs-main-layout__brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--efs-primary, #2563eb) 16%, var(--efs-surface, #fff));
  color: var(--efs-primary, #2563eb);
  font-weight: 800;
}

.efs-main-layout__brand-copy {
  min-width: 0;
  display: grid;
}

.efs-main-layout__brand {
  font-size: 1rem;
  font-weight: 800;
}

.efs-main-layout__brand-subtitle {
  color: var(--efs-text-muted, #64748b);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.efs-main-layout__nav {
  display: grid;
  gap: 12px;
  align-content: start;
}

.efs-main-layout__nav :deep(.efs-sidebar-group) {
  display: grid;
  gap: 6px;
}

.efs-main-layout__nav :deep(.efs-sidebar-group__title) {
  padding: 6px 10px;
  color: var(--efs-text-muted, #64748b);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.efs-main-layout__nav :deep(.efs-sidebar-link) {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
}

.efs-main-layout__nav :deep(.efs-sidebar-link:hover),
.efs-main-layout__nav :deep(.efs-sidebar-link.router-link-active) {
  background: var(--efs-surface-soft, #f4f7fb);
  color: var(--efs-primary, #2563eb);
}

.efs-main-layout__nav :deep(.efs-sidebar-link__icon) {
  width: 20px;
  text-align: center;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__label),
.efs-main-layout__nav :deep(.efs-sidebar-link__meta) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__body) {
  display: grid;
  min-width: 0;
}

.efs-main-layout__nav :deep(.efs-sidebar-link__meta) {
  font-size: 0.74rem;
  color: var(--efs-text-muted, #64748b);
}

.efs-main-layout--sidebar-compact .efs-main-layout__brand-copy,
.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-group__title),
.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-link__body) {
  display: none;
}

.efs-main-layout--sidebar-compact .efs-main-layout__nav :deep(.efs-sidebar-link) {
  grid-template-columns: 1fr;
  justify-items: center;
  padding: 0;
}

.efs-main-layout__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.efs-main-layout__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--efs-border, #dbe3ef);
  background: color-mix(in srgb, var(--efs-surface, #fff) 94%, transparent);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.efs-main-layout__header-left,
.efs-main-layout__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.efs-main-layout__toolbar {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.efs-main-layout__header-meta {
  min-width: 0;
}

.efs-main-layout__title {
  font-size: 1rem;
  font-weight: 700;
}

.efs-main-layout__subtitle {
  margin-top: 2px;
  color: var(--efs-text-muted, #64748b);
  font-size: 0.82rem;
}

.efs-main-layout__iconbutton {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  color: var(--efs-text, #172033);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.efs-main-layout__iconbutton--text {
  width: auto;
  min-width: 48px;
  padding: 0 12px;
  font-weight: 700;
}

.efs-main-layout__org-switcher {
  display: grid;
  gap: 4px;
  min-width: 180px;
}

.efs-main-layout__org-label {
  color: var(--efs-text-muted, #64748b);
  font-size: 0.78rem;
}

.efs-main-layout__org-switcher :deep(.efs-appselect) {
  min-height: 40px;
  padding: 8px 12px;
}

.efs-main-layout__usermenu {
  position: relative;
}

.efs-main-layout__usertrigger {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 6px 10px;
  border-radius: 14px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  cursor: pointer;
}

.efs-main-layout__usertrigger::-webkit-details-marker {
  display: none;
}

.efs-main-layout__avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--efs-primary, #2563eb) 14%, var(--efs-surface, #fff));
  color: var(--efs-primary, #2563eb);
  font-weight: 700;
  font-size: 0.82rem;
}

.efs-main-layout__usertext {
  display: grid;
  min-width: 0;
}

.efs-main-layout__usertext strong,
.efs-main-layout__usertext small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.efs-main-layout__usertext small {
  color: var(--efs-text-muted, #64748b);
}

.efs-main-layout__usermenu-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  display: grid;
  gap: 4px;
}

.efs-main-layout__usermenu-panel button {
  min-height: 40px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  padding: 0 12px;
  cursor: pointer;
}

.efs-main-layout__usermenu-panel button:hover {
  background: var(--efs-surface-soft, #f4f7fb);
}

.efs-main-layout__logout-action {
  color: var(--efs-danger, #dc2626);
}

.efs-main-layout__alerts {
  padding: 16px 20px 0;
}

.efs-main-layout__content {
  padding: 20px;
  min-width: 0;
}

.efs-main-layout__scrim {
  position: fixed;
  inset: 0;
  border: 0;
  background: rgba(15, 23, 42, 0.35);
  z-index: 25;
}

.efs-main-layout__dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.4);
  z-index: 40;
}

.efs-main-layout__dialog {
  width: min(100%, 480px);
}

.efs-main-layout__dialog-form {
  display: grid;
  gap: 16px;
}

.efs-main-layout__dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.efs-main-layout__dialog-note {
  margin: 0;
  color: var(--efs-danger, #dc2626);
}

@media (max-width: 960px) {
  .efs-main-layout,
  .efs-main-layout[data-dense='true'],
  .efs-main-layout--sidebar-compact {
    grid-template-columns: 1fr;
  }

  .efs-main-layout__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(86vw, 300px);
    height: auto;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
  }

  .efs-main-layout__sidebar--open {
    transform: translateX(0);
  }

  .efs-main-layout__header {
    flex-wrap: wrap;
  }

  .efs-main-layout__toolbar {
    width: 100%;
    justify-content: flex-end;
  }

  .efs-main-layout__org-switcher {
    flex: 1 1 180px;
  }
}

@media (max-width: 640px) {
  .efs-main-layout__content {
    padding: 16px;
  }

  .efs-main-layout__usertext {
    display: none;
  }
}
</style>
