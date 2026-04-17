import type { FlatMenuNode } from './navigation-menu'
import type { DomainResPath } from '../types/resource-model'
import type { PlatformApp } from '../types/app'
import type { PlatformDomain } from '../types/domain'
import type { PlatformResource } from '../types/resource'

export function buildResPath<D extends string, R extends string>(domain: D, res: R): DomainResPath<D, R> {
  return `${domain}/${res}` as DomainResPath<D, R>
}

export function splitResPath(path: string): { domain: string, res: string } | null {
  if (typeof path !== 'string') return null
  const normalized = path.replace(/^\/+|\/+$/g, '')
  const parts = normalized.split('/').filter(Boolean)
  if (parts.length !== 2) return null
  const [domain, res] = parts
  if (!domain || !res) return null
  return { domain, res }
}

export function isResController(value: unknown): value is PlatformResource {
  return Boolean(
    value
      && typeof value === 'object'
      && (value as { kind?: unknown }).kind === 'res'
      && typeof (value as { domain?: unknown }).domain === 'string'
      && typeof (value as { res?: unknown }).res === 'string',
  )
}

export function listAllResControllers(app: PlatformApp): PlatformResource[] {
  return app.main.domains.flatMap((domain) => [...domain.items])
}

export function findDomainByKey<D extends string = string>(app: PlatformApp, domainKey: D): PlatformDomain<D> | undefined {
  return app.main.domains.find((domain) => domain.domain === domainKey) as PlatformDomain<D> | undefined
}

export function findResByPath(app: PlatformApp, path: string): PlatformResource | undefined {
  const parsed = splitResPath(path)
  if (!parsed) return undefined
  return listAllResControllers(app).find((item) => item.domain === parsed.domain && item.res === parsed.res)
}

export function flattenAppMenuNodes(app: PlatformApp): FlatMenuNode[] {
  const domainNodes: FlatMenuNode[] = app.main.domains.map((domain, index) => ({
    key: domain.domain,
    title: domain.title || domain.domain,
    icon: domain.icon || '',
    order: domain.order ?? (index + 1) * 10,
    type: 'group',
  }))

  const itemNodes: FlatMenuNode[] = app.main.domains.flatMap((domain, domainIndex) => domain.items.map((item, itemIndex) => ({
    key: buildResPath(item.domain, item.res),
    title: item.title || item.res,
    path: `/${buildResPath(item.domain, item.res)}`,
    icon: item.icon || '',
    order: item.order ?? ((domainIndex + 1) * 100 + (itemIndex + 1) * 10),
    parentKey: domain.domain,
    type: 'item',
  })))

  return [...domainNodes, ...itemNodes]
}
