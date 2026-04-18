import { computed, reactive, ref, watch, type Slots } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useAppAlerts } from '../app/alerts'
import type { EfsAppSchema } from '../../schema/index.ts'

export interface MainPageModelInput {
  schema: Readonly<EfsAppSchema>
  title?: string
  locale?: string
  theme?: string
  agentBusy?: boolean
  agentInput?: string
  agentSessionsOpen?: boolean
}

export interface MainPageModelEmit {
  (e: 'update:locale', value: string): void
  (e: 'update:theme', value: string): void
  (e: 'update:agentInput', value: string): void
  (e: 'update:agentSessionsOpen', value: boolean): void
  (e: 'submit-agent', value: string): void
  (e: 'submit-profile', value: { displayName: string }): void
  (e: 'submit-password', value: { currentPassword: string; newPassword: string; confirmPassword: string }): void
  (e: 'logout'): void
}

export function useMainPageModel(props: MainPageModelInput, slots: Slots, emit: MainPageModelEmit) {
  const globalAlerts = useAppAlerts()
  const moreMenuRef = ref<HTMLDetailsElement | null>(null)
  const profileDialogOpen = ref(false)
  const passwordDialogOpen = ref(false)
  const sidebarOpen = ref(false)
  const sidebarCompact = ref(false)
  const isMobile = ref(false)
  const mobileAgentBarOpen = ref(false)
  const { width } = useWindowSize()
  const profileForm = reactive({ displayName: '' })
  const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const agentDraft = ref(props.agentInput ?? '')
  const agentSessionsPanelOpen = ref(Boolean(props.agentSessionsOpen))

  watch(() => props.agentInput, (value) => {
    agentDraft.value = value ?? ''
  })

  watch(() => props.agentSessionsOpen, (value) => {
    agentSessionsPanelOpen.value = Boolean(value)
  })

  const appName = computed(() => props.schema.app.title || props.schema.app.name || 'Workbench')
  const brandIcon = computed(() => props.schema.app.brandIcon || '')
  const shouldRenderSidebar = computed(() => Boolean(slots.sidebar))
  const resolvedTitle = computed(() => props.title || appName.value)
  const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
  const showAgentBar = computed(() => !isMobile.value || mobileAgentBarOpen.value)
  const layoutClasses = computed(() => ({
    'efs-main-layout--sidebar-compact': sidebarCompact.value,
    'efs-main-layout--sidebar-hidden': !shouldRenderSidebar.value,
    'efs-main-layout--agent-sessions-open': agentSessionsPanelOpen.value,
  }))
  const initials = computed(() => {
    const source = (profileForm.displayName || resolvedTitle.value).trim()
    if (!source) return 'U'
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || source.slice(0, 1).toUpperCase()
  })
  const showPasswordMismatch = computed(() => Boolean(passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword))
  const passwordSubmitDisabled = computed(() => !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || showPasswordMismatch.value)

  watch(width, () => {
    syncViewport()
  }, { immediate: true })

  function syncViewport() {
    const nextIsMobile = width.value <= 960
    const wasMobile = isMobile.value
    isMobile.value = nextIsMobile
    sidebarOpen.value = shouldRenderSidebar.value && !isMobile.value
    if (isMobile.value) {
      sidebarCompact.value = false
      if (!wasMobile) mobileAgentBarOpen.value = false
    } else {
      mobileAgentBarOpen.value = true
    }
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

  function openProfileDialog() {
    passwordDialogOpen.value = false
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
    emit('submit-profile', { displayName: profileForm.displayName.trim() })
    profileDialogOpen.value = false
  }

  function submitPassword() {
    if (passwordSubmitDisabled.value) return
    emit('submit-password', {
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

  function toggleMobileAgentBar() {
    mobileAgentBarOpen.value = !mobileAgentBarOpen.value
    if (!mobileAgentBarOpen.value) {
      agentSessionsPanelOpen.value = false
      emit('update:agentSessionsOpen', false)
    }
    closeMoreMenu()
  }

  return {
    globalAlerts,
    moreMenuRef,
    profileDialogOpen,
    passwordDialogOpen,
    sidebarOpen,
    isMobile,
    profileForm,
    passwordForm,
    agentDraft,
    agentSessionsPanelOpen,
    appName,
    brandIcon,
    shouldRenderSidebar,
    resolvedTitle,
    showAlertsRegion,
    showAgentBar,
    layoutClasses,
    initials,
    showPasswordMismatch,
    passwordSubmitDisabled,
    toggleSidebar,
    closeSidebar,
    onSidebarClick,
    openProfileDialog,
    openPasswordDialog,
    submitProfile,
    submitPassword,
    emitLogout,
    handleAgentInput,
    submitAgent,
    handleAgentSessionsToggle,
    toggleMobileAgentBar,
  }
}
