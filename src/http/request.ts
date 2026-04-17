export type HttpTransportOptions = {
  requestDataKey?: string
  responseDataKey?: string
  authHeader?: string
  authScheme?: string
}

export type HttpEndpoint = {
  path: string
  method?: string
}

export type HttpRequestOptions = {
  json?: unknown
  context?: any
  accessToken?: string
}

export async function requestJson(
  fetcher: typeof fetch,
  baseUrl: string,
  transport: HttpTransportOptions,
  endpoint: HttpEndpoint,
  options: HttpRequestOptions = {},
) {
  const method = endpoint.method || 'GET'
  const { url, body } = buildRequest(baseUrl, transport, endpoint, options.context, options.json)
  const headers: Record<string, string> = {}
  if (body != null) headers['content-type'] = 'application/json'
  if (options.accessToken) {
    headers[transport.authHeader || 'Authorization'] = `${transport.authScheme || 'Bearer'} ${options.accessToken}`
  }
  const response = await fetcher(url, {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: body == null ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data: any = undefined
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  const unwrapped = unwrapResponseData(data, transport)
  const isOk = typeof response.ok === 'boolean' ? response.ok : true
  if (!isOk) {
    const message = asOptionalString(data?.message ?? unwrapped?.message) || `${response.status} ${response.statusText}`
    throw new Error(message)
  }
  return unwrapped
}

export function buildRequest(
  baseUrl: string,
  transport: HttpTransportOptions,
  endpoint: HttpEndpoint,
  context: any,
  explicitJson: unknown,
) {
  const method = endpoint.method || 'GET'
  const path = interpolatePath(endpoint.path, context)
  const url = buildUrl(baseUrl, path)

  if (method === 'GET') {
    const target = new URL(url)
    const queryValues = context?.queryValues && typeof context.queryValues === 'object' ? context.queryValues : {}
    for (const [key, value] of Object.entries(queryValues)) {
      if (value == null || value === '') continue
      target.searchParams.set(key, String(value))
    }
    if (typeof context?.page === 'number') target.searchParams.set('page', String(context.page))
    if (typeof context?.pageSize === 'number') target.searchParams.set('pageSize', String(context.pageSize))
    return { url: target.toString(), body: undefined }
  }

  const payload = explicitJson !== undefined
    ? explicitJson
    : context?.item && typeof context.item === 'object'
      ? context.item
      : context

  return { url, body: wrapRequestData(payload, transport) }
}

export function buildUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const resolvedBase = resolveBaseUrl(baseUrl)
  const normalizedBase = resolvedBase.replace(/\/+$/, '')
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

export function resolveBaseUrl(baseUrl: string) {
  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
    return 'http://127.0.0.1'
  }
  if (/^https?:\/\//i.test(baseUrl)) return baseUrl
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`
  }
  return `http://127.0.0.1${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`
}

export function wrapRequestData(payload: unknown, transport: HttpTransportOptions) {
  if (!transport.requestDataKey) return payload
  return {
    [transport.requestDataKey]: payload,
  }
}

export function unwrapResponseData(data: any, transport: HttpTransportOptions) {
  if (!transport.responseDataKey) return data
  if (data && typeof data === 'object' && transport.responseDataKey in data) return data[transport.responseDataKey]
  return data
}

function interpolatePath(path: string, context: any) {
  const item = context?.item && typeof context.item === 'object' ? context.item : undefined
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const value = context?.[key] ?? item?.[key] ?? item?.id
    return encodeURIComponent(String(value ?? key))
  })
}

function asOptionalString(value: unknown) {
  return value == null ? undefined : String(value)
}
