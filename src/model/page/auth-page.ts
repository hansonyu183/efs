import { computed, type Slots } from 'vue'
import { useAppAlerts } from '../app/alerts'

export interface AuthPageModelInput {
  appName?: string
  logoSrc?: string
}

export function useAuthPageModel(props: AuthPageModelInput, slots: Slots) {
  const globalAlerts = useAppAlerts()
  // Locale/theme controls have built-in fallback content, so the actions bar is shown by default.
  const showActionsBar = computed(() => true)
  const showTopBar = computed(() => Boolean(slots.brand) || Boolean(props.logoSrc) || Boolean(props.appName) || showActionsBar.value)
  const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
  const contentStyle = computed(() => ({ maxWidth: '560px', '--efs-auth-panel-width': '100%' }))
  const layoutClasses = computed(() => ({
    'efs-auth-layout--centered': true,
  }))

  return {
    globalAlerts,
    showActionsBar,
    showTopBar,
    showAlertsRegion,
    contentStyle,
    layoutClasses,
  }
}
