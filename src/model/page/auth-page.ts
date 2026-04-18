import { computed, ref, type Slots } from 'vue'
import { requestJson } from '../../http/index.ts'
import type { EfsAppSchema } from '../../schema/index.ts'
import { resolvePrimaryService, resolveTransportOptions } from '../app/service-config'
import { useAppAlerts } from '../app/alerts'
import type { AuthLoginInput, AuthLoginResult } from '../types/auth'

export interface AuthPageModelInput {
  schema: Readonly<EfsAppSchema>
}

type RuntimeAuthSchema = NonNullable<EfsAppSchema['auth']> & {
  login: { path: string; method: string }
  token?: {
    accessTokenField?: string
    refreshTokenField?: string
    expiresAtField?: string
    tokenTypeField?: string
  }
}

export function useAuthPageModel(
  props: AuthPageModelInput,
  slots: Slots,
  onLoginSuccess: (result: AuthLoginResult) => void | Promise<void>,
) {
  const globalAlerts = useAppAlerts()
  const loginName = ref('')
  const loginPwd = ref('')
  const authBusy = ref(false)
  const authError = ref('')
  // Locale/theme controls have built-in fallback content, so the actions bar is shown by default.
  const showActionsBar = computed(() => true)
  const showTopBar = computed(() => Boolean(slots.brand) || Boolean(props.schema.app.brandIcon) || Boolean(props.schema.app.title || props.schema.app.name) || showActionsBar.value)
  const showAlertsRegion = computed(() => Boolean(slots.alerts) || globalAlerts.hasItems.value)
  const contentStyle = computed(() => ({ maxWidth: '560px', '--efs-auth-panel-width': '100%' }))
  const layoutClasses = computed(() => ({
    'efs-auth-layout--centered': true,
  }))
  const auth = props.schema.auth as RuntimeAuthSchema | undefined

  async function handleLogin() {
    authBusy.value = true
    authError.value = ''
    try {
      const result = await loginWithSchema(props.schema, auth, {
        name: loginName.value,
        pwd: loginPwd.value,
      })
      loginPwd.value = ''
      await onLoginSuccess(result)
    } catch (error) {
      authError.value = describeError(error)
    } finally {
      authBusy.value = false
    }
  }

  return {
    globalAlerts,
    loginName,
    loginPwd,
    authBusy,
    authError,
    showActionsBar,
    showTopBar,
    showAlertsRegion,
    contentStyle,
    layoutClasses,
    handleLogin,
  }
}

async function loginWithSchema(schema: Readonly<EfsAppSchema>, auth: RuntimeAuthSchema | undefined, input: AuthLoginInput): Promise<AuthLoginResult> {
  const fetcher = globalThis.fetch
  if (!fetcher) {
    throw new Error('fetch is not available; cannot submit login request')
  }

  if (!auth?.login) {
    return {
      accessToken: 'anonymous-token',
    }
  }

  const service = resolvePrimaryService(schema)
  const baseUrl = service?.baseUrl ?? ''
  const transport = resolveTransportOptions(service)
  const accessTokenField = auth.token?.accessTokenField || 'accessToken'
  const refreshTokenField = auth.token?.refreshTokenField || 'refreshToken'
  const expiresAtField = auth.token?.expiresAtField || 'expiresAt'
  const tokenTypeField = auth.token?.tokenTypeField || 'tokenType'

  const data = await requestJson(fetcher, baseUrl, transport, auth.login, {
    json: {
      ...input,
      username: input.name,
      password: input.pwd,
    },
  })

  return {
    accessToken: asOptionalString(readPath(data, accessTokenField) ?? data?.accessToken) || 'anonymous-token',
    refreshToken: asOptionalString(readPath(data, refreshTokenField)),
    expiresAt: asOptionalString(readPath(data, expiresAtField)),
    tokenType: asOptionalString(readPath(data, tokenTypeField)) ?? transport.authScheme,
  }
}

function readPath(value: any, path: string) {
  if (!value || !path) return undefined
  let current = value
  for (const segment of path.split('.').filter(Boolean)) {
    if (!current || typeof current !== 'object') return undefined
    current = current[segment]
  }
  return current
}

function asOptionalString(value: unknown) {
  return value == null ? undefined : String(value)
}

function describeError(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return '登录失败，请稍后重试。'
}
