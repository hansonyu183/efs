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
            <SemanticIcon name="menu" :label="props.mobileMenuLabel" aria-hidden="true" />
          </button>

          <div class="efs-main-layout__header-meta">
            <slot name="header-title">
              <div class="efs-main-layout__title">{{ resolvedTitle }}</div>
              <div v-if="resolvedSubtitle" class="efs-main-layout__subtitle">{{ resolvedSubtitle }}</div>
            </slot>
          </div>
        </div>

        <details ref="moreMenuRef" class="efs-main-layout__moremenu">
          <summary class="efs-main-layout__iconbutton" :aria-label="props.moreLabel" :title="props.moreLabel">
            <SemanticIcon name="more" :label="props.moreLabel" aria-hidden="true" />
          </summary>
          <div class="efs-main-layout__moremenu-panel">
            <button type="button" :title="props.localeLabel" :aria-label="props.localeLabel" @click="emitNextLocale">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon name="locale" :label="props.localeLabel" size="sm" />
              </span>
              <span class="efs-main-layout__menulabel">{{ localeShortLabel }}</span>
            </button>
            <button type="button" :title="props.themeLabel" :aria-label="props.themeLabel" @click="emitNextTheme">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon :name="themeIconName" :label="props.themeLabel" size="sm" />
              </span>
              <span class="efs-main-layout__menulabel">{{ themeTextLabel }}</span>
            </button>

            <label v-if="props.orgOptions.length > 0" class="efs-main-layout__menu-field" :aria-label="props.orgLabel">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon name="org" :label="props.orgLabel" size="sm" />
              </span>
              <span class="efs-main-layout__visually-hidden">{{ props.orgLabel }}</span>
              <AppSelect
                :model-value="props.currentOrgCode || props.orgCode"
                :options="props.orgOptions"
                @update:model-value="(value) => emit('update:org', value)"
              />
            </label>

            <div v-if="$slots.toolbar" class="efs-main-layout__moremenu-extra">
              <slot name="toolbar" />
            </div>

            <button v-if="props.enableProfileActions" type="button" :title="props.profileLabel" :aria-label="props.profileLabel" @click="openProfileDialog">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon name="profile" :label="props.profileLabel" size="sm" />
              </span>
            </button>
            <button v-if="props.enablePasswordActions" type="button" :title="props.passwordLabel" :aria-label="props.passwordLabel" @click="openPasswordDialog">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon name="password" :label="props.passwordLabel" size="sm" />
              </span>
            </button>
            <button type="button" class="efs-main-layout__logout-action" :title="props.logoutLabel" :aria-label="props.logoutLabel" @click="emitLogout">
              <span class="efs-main-layout__menuicon" aria-hidden="true">
                <SemanticIcon name="logout" :label="props.logoutLabel" size="sm" />
              </span>
            </button>
          </div>
        </details>
      </header>

      <section v-if="$slots.alerts" class="efs-main-layout__alerts">
        <slot name="alerts" />
      </section>

      <main class="efs-main-layout__content">
        <slot />
      </main>

      <section v-if="props.showAgentBar" class="efs-main-layout__agentbar">
        <div class="efs-main-layout__agentbar-main">
          <div class="efs-main-layout__agentbar-header">
            <strong>{{ props.agentTitle }}</strong>
            <button
              type="button"
              class="efs-main-layout__agentlink"
              :title="props.agentSessionsLabel"
              :aria-label="props.agentSessionsLabel"
              @click="handleAgentSessionsToggle"
            >
              <SemanticIcon name="sessions" :label="props.agentSessionsLabel" aria-hidden="true" />
            </button>
          </div>
          <div v-if="$slots['agent-output']" class="efs-main-layout__agent-output">
            <slot name="agent-output" />
          </div>
          <div class="efs-main-layout__agentbar-form">
            <AppInput :model-value="agentDraft" :placeholder="props.agentPlaceholder" @update:model-value="handleAgentInput" @keyup.enter="submitAgent" />
            <AppButton
              variant="primary"
              :disabled="props.agentBusy || !agentDraft.trim()"
              :title="props.agentSubmitLabel"
              :aria-label="props.agentSubmitLabel"
              @click="submitAgent"
            >
              <SemanticIcon name="send" :label="props.agentSubmitLabel" aria-hidden="true" />
            </AppButton>
          </div>
        </div>
      </section>
    </div>

    <aside v-if="agentSessionsPanelOpen" class="efs-main-layout__agent-sessions">
      <header class="efs-main-layout__agent-sessions-header">
        <strong>{{ props.agentSessionsLabel }}</strong>
        <button
          type="button"
          class="efs-main-layout__iconbutton"
          :aria-label="props.cancelLabel"
          :title="props.cancelLabel"
          @click="handleAgentSessionsToggle"
        >
          <SemanticIcon name="close" :label="props.cancelLabel" aria-hidden="true" />
        </button>
      </header>
      <div class="efs-main-layout__agent-sessions-body">
        <slot name="agent-sessions">
          <div class="efs-main-layout__agent-sessions-empty">{{ props.agentSessionsEmptyText }}</div>
        </slot>
      </div>
    </aside>

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
import SemanticIcon from './SemanticIcon.vue'

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
  enableProfileActions?: boolean
  enablePasswordActions?: boolean
  moreLabel?: string
  showAgentBar?: boolean
  agentTitle?: string
  agentPlaceholder?: string
  agentSubmitLabel?: string
  agentSessionsLabel?: string
  agentSessionsEmptyText?: string
  agentBusy?: boolean
  agentInput?: string
  agentSessionsOpen?: boolean
  iconOnly?: boolean
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
  profileLabel: 'Profile',
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
  locale: 'zh-CN',
  theme: 'light',
  userDisplayName: '',
  username: '',
  userSubtitle: '',
  orgOptions: () => [],
  localeOptions: () => [
    { title: '简体中文', value: 'zh-CN' },
    { title: 'English', value: 'en-US' },
  ],
  themeOptions: () => [
    { title: 'Light', value: 'light' },
    { title: 'Dark', value: 'dark' },
  ],
  enableProfileActions: true,
  enablePasswordActions: true,
  moreLabel: '更多',
  showAgentBar: true,
  agentTitle: 'Agent',
  agentPlaceholder: '请输入你的问题或操作指令',
  agentSubmitLabel: '发送',
  agentSessionsLabel: '会话管理',
  agentSessionsEmptyText: '暂无会话',
  agentBusy: false,
  agentInput: '',
  agentSessionsOpen: false,
  iconOnly: true,
})

const emit = defineEmits<{
  (e: 'update:org', value: string): void
  (e: 'update:locale', value: string): void
  (e: 'update:theme', value: string): void
  (e: 'update:agentInput', value: string): void
  (e: 'update:agentSessionsOpen', value: boolean): void
  (e: 'submit-agent', value: string): void
  (e: 'save-profile', value: { displayName: string }): void
  (e: 'save-password', value: { currentPassword: string; newPassword: string; confirmPassword: string }): void
  (e: 'logout'): void
}>()

const slots = useSlots()
const moreMenuRef = ref<HTMLDetailsElement | null>(null)
const profileDialogOpen = ref(false)
const passwordDialogOpen = ref(false)
const sidebarOpen = ref(false)
const sidebarCompact = ref(false)
const isMobile = ref(false)
const profileForm = reactive({ displayName: props.userDisplayName })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const agentDraft = ref(props.agentInput)
const agentSessionsPanelOpen = ref(props.agentSessionsOpen)

watch(() => props.userDisplayName, (value) => {
  profileForm.displayName = value
})
watch(() => props.agentInput, (value) => {
  agentDraft.value = value
})
watch(() => props.agentSessionsOpen, (value) => {
  agentSessionsPanelOpen.value = value
})

const shouldRenderSidebar = computed(() => props.showSidebar || Boolean(slots.sidebar))
const resolvedTitle = computed(() => props.title || props.appName || 'Workbench')
const resolvedSubtitle = computed(() => props.subtitle || props.topbarSubtitle || props.userSubtitle || props.orgCode)
const resolvedBrandTitle = computed(() => props.brandTitle || props.appName || 'Workbench')
const resolvedBrandSubtitle = computed(() => props.brandSubtitle || props.userSubtitle || props.subtitle || props.orgCode)
const layoutClasses = computed(() => ({
  'efs-main-layout--sidebar-compact': sidebarCompact.value,
  'efs-main-layout--sidebar-hidden': !shouldRenderSidebar.value,
  'efs-main-layout--agent-sessions-open': agentSessionsPanelOpen.value,
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
const localeShortLabel = computed(() => (props.locale === 'en-US' ? 'EN' : '中'))
const themeIconName = computed(() => (props.theme === 'dark' ? 'dark' : 'light'))
const themeTextLabel = computed(() => (props.theme === 'dark' ? '暗' : '明'))

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

function closeMoreMenu() {
  if (moreMenuRef.value) moreMenuRef.value.open = false
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
  closeMoreMenu()
  profileDialogOpen.value = true
}

function openPasswordDialog() {
  profileDialogOpen.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  closeMoreMenu()
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
  closeMoreMenu()
  emit('logout')
}

function handleAgentInput(value: string) {
  agentDraft.value = value
  emit('update:agentInput', value)
}

function submitAgent() {
  const text = agentDraft.value.trim()
  if (!text || props.agentBusy) return
  emit('submit-agent', text)
}

function handleAgentSessionsToggle() {
  const next = !agentSessionsPanelOpen.value
  agentSessionsPanelOpen.value = next
  emit('update:agentSessionsOpen', next)
  closeMoreMenu()
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
  min-height: 100vh;
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

.efs-main-layout__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
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
  min-width: 40px;
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
  padding: 0 12px;
}

.efs-main-layout__menuicon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  font-size: 0.95rem;
}

.efs-main-layout__menulabel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.86rem;
  font-weight: 600;
}

.efs-main-layout__moremenu {
  position: relative;
}

.efs-main-layout__moremenu summary {
  list-style: none;
}

.efs-main-layout__moremenu summary::-webkit-details-marker {
  display: none;
}

.efs-main-layout__moremenu-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  display: grid;
  gap: 6px;
  z-index: 30;
}

.efs-main-layout__moremenu-panel button {
  min-height: 40px;
  min-width: 40px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  padding: 0 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.efs-main-layout__moremenu-panel button:hover {
  background: var(--efs-surface-soft, #f4f7fb);
}

.efs-main-layout__menuicon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  color: currentColor;
}

.efs-main-layout__menu-field {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.86rem;
  color: var(--efs-text-muted, #64748b);
}

.efs-main-layout__menu-field :deep(.efs-appselect) {
  min-width: 0;
}

.efs-main-layout__visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.efs-main-layout__moremenu-extra {
  padding: 4px 0;
  border-top: 1px solid var(--efs-border, #dbe3ef);
  border-bottom: 1px solid var(--efs-border, #dbe3ef);
}

.efs-main-layout__moremenu-panel .efs-main-layout__menulabel {
  display: none;
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
  flex: 1;
}

.efs-main-layout__agentbar {
  position: sticky;
  bottom: 0;
  z-index: 18;
  padding: 12px 20px 20px;
  background: linear-gradient(180deg, rgba(244, 247, 251, 0), rgba(244, 247, 251, 0.92) 24%, rgba(244, 247, 251, 1) 100%);
}

.efs-main-layout__agentbar-main {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 12px;
}

.efs-main-layout__agentbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.efs-main-layout__agentlink {
  width: 36px;
  height: 36px;
  border: 1px solid var(--efs-border, #dbe3ef);
  border-radius: 10px;
  background: var(--efs-surface, #fff);
  color: var(--efs-primary, #2563eb);
  cursor: pointer;
}

.efs-main-layout__agent-output {
  max-height: 120px;
  overflow: auto;
  color: var(--efs-text-muted, #64748b);
}

.efs-main-layout__agentbar-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.efs-main-layout__agentbar-form :deep(.efs-appbutton) {
  min-width: 44px;
}

.efs-main-layout__agent-sessions {
  position: fixed;
  top: 0;
  right: 0;
  width: min(360px, 90vw);
  height: 100vh;
  border-left: 1px solid var(--efs-border, #dbe3ef);
  background: var(--efs-surface, #fff);
  box-shadow: -18px 0 40px rgba(15, 23, 42, 0.12);
  z-index: 35;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.efs-main-layout__agent-sessions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--efs-border, #dbe3ef);
}

.efs-main-layout__agent-sessions-body {
  min-height: 0;
  overflow: auto;
  padding: 16px;
}

.efs-main-layout__agent-sessions-empty {
  color: var(--efs-text-muted, #64748b);
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
}

@media (min-width: 641px) {
  .efs-main-layout:not([data-dense='true']) .efs-main-layout__moremenu-panel .efs-main-layout__menulabel {
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .efs-main-layout__content {
    padding: 16px;
  }

  .efs-main-layout__header,
  .efs-main-layout__agentbar,
  .efs-main-layout__alerts {
    padding-left: 16px;
    padding-right: 16px;
  }

  .efs-main-layout__agentbar-form {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .efs-main-layout__sidebar {
    transition: none;
  }
}
</style>
