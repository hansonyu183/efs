import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch, type Slots } from 'vue'
import { useAppAlerts } from '../app/alerts'
import { EFS_I18N_CONTEXT } from '../app/i18n'

export interface MainPageModelInput {
  title?: string
  subtitle?: string
  brandIcon?: string
  brandTitle?: string
  appName?: string
  brandSubtitle?: string
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
  const i18nContext = inject(EFS_I18N_CONTEXT, null)
  const moreMenuRef = ref<HTMLDetailsElement | null>(null)
  const profileDialogOpen = ref(false)
  const passwordDialogOpen = ref(false)
  const sidebarOpen = ref(false)
  const sidebarCompact = ref(false)
  const isMobile = ref(false)
  const mobileAgentBarOpen = ref(false)
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

  const shouldRenderSidebar = computed(() => Boolean(slots.sidebar))
  const resolvedTitle = computed(() => props.title || props.appName || 'Workbench')
  const resolvedSubtitle = computed(() => props.subtitle || '')
  const resolvedBrandTitle = computed(() => props.brandTitle || props.appName || 'Workbench')
  const resolvedBrandSubtitle = computed(() => props.brandSubtitle || props.subtitle || '')
  const resolvedMobileMenuLabel = computed(() => resolveCopy('efs.shell.mobileMenuLabel', '切换导航'))
  const resolvedLogoutLabel = computed(() => resolveCopy('efs.shell.logoutLabel', '退出登录'))
  const resolvedMoreLabel = computed(() => resolveCopy('efs.shell.moreLabel', '更多'))
  const resolvedAgentTitle = computed(() => resolveCopy('efs.shell.agentTitle', 'Agent'))
  const resolvedAgentPlaceholder = computed(() => resolveCopy('efs.shell.agentPlaceholder', '请输入你的问题或操作指令'))
  const resolvedAgentSubmitLabel = computed(() => resolveCopy('efs.shell.agentSubmitLabel', '发送'))
  const resolvedAgentSessionsLabel = computed(() => resolveCopy('efs.shell.agentSessionsLabel', '会话管理'))
  const resolvedAgentSessionsEmptyText = computed(() => resolveCopy('efs.shell.agentSessionsEmptyText', '暂无会话'))
  const resolvedCloseLabel = computed(() => resolveCopy('efs.shell.closeLabel', '关闭'))
  const resolvedAgentShowLabel = computed(() => resolveCopy('efs.shell.showAgentLabel', 'Agent'))
  const resolvedProfileDialog = computed(() => ({
    enabled: true,
    label: resolveCopy('efs.shell.profileDialog.label', '个人资料'),
    subtitle: resolveCopy('efs.shell.profileDialog.subtitle', '更新工作台中显示的个人资料信息。'),
    displayNameLabel: resolveCopy('efs.shell.profileDialog.displayNameLabel', '显示名称'),
    submitLabel: resolveCopy('efs.shell.profileDialog.submitLabel', '保存'),
    cancelLabel: resolveCopy('efs.shell.profileDialog.cancelLabel', '取消'),
  }))
  const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
  const resolvedPasswordDialog = computed(() => ({
    enabled: true,
    label: resolveCopy('efs.shell.passwordDialog.label', '修改密码'),
    subtitle: resolveCopy('efs.shell.passwordDialog.subtitle', '修改当前工作台账号使用的密码。'),
    currentPasswordLabel: resolveCopy('efs.shell.passwordDialog.currentPasswordLabel', '当前密码'),
    newPasswordLabel: resolveCopy('efs.shell.passwordDialog.newPasswordLabel', '新密码'),
    confirmPasswordLabel: resolveCopy('efs.shell.passwordDialog.confirmPasswordLabel', '确认密码'),
    mismatchMessage: resolveCopy('efs.shell.passwordDialog.mismatchMessage', '两次输入的新密码不一致。'),
    submitLabel: resolveCopy('efs.shell.passwordDialog.submitLabel', '保存'),
    cancelLabel: resolveCopy('efs.shell.passwordDialog.cancelLabel', '取消'),
  }))
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
  const brandInitial = computed(() => resolvedBrandTitle.value.trim().slice(0, 1).toUpperCase() || 'A')
  const showPasswordMismatch = computed(() => Boolean(passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword))
  const passwordSubmitDisabled = computed(() => !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || showPasswordMismatch.value)

  onMounted(() => {
    syncViewport()
    if (typeof window !== 'undefined') window.addEventListener('resize', syncViewport)
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
  })

  function syncViewport() {
    if (typeof window === 'undefined') return
    const nextIsMobile = window.innerWidth <= 960
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

  function resolveCopy(key: string, fallback: string) {
    return i18nContext?.translate(key) || fallback
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
    shouldRenderSidebar,
    resolvedTitle,
    resolvedSubtitle,
    resolvedBrandTitle,
    resolvedBrandSubtitle,
    resolvedMobileMenuLabel,
    resolvedLogoutLabel,
    resolvedMoreLabel,
    resolvedAgentTitle,
    resolvedAgentPlaceholder,
    resolvedAgentSubmitLabel,
    resolvedAgentSessionsLabel,
    resolvedAgentSessionsEmptyText,
    resolvedCloseLabel,
    resolvedAgentShowLabel,
    resolvedProfileDialog,
    showAlertsRegion,
    resolvedPasswordDialog,
    showAgentBar,
    layoutClasses,
    initials,
    brandInitial,
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
