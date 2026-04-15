import type { FlatMenuNode } from '../shared/NavigationMenu'
import type { DomainResPath } from './shared-types'
import type { AppController } from './app-controller'
import type { DomainController } from './domain-controller'
import type { ResController } from './res-controller'

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

export function isResController(value: unknown): value is ResController {
  return Boolean(
    value
      && typeof value === 'object'
      && (value as { kind?: unknown }).kind === 'res'
      && typeof (value as { domain?: unknown }).domain === 'string'
      && typeof (value as { res?: unknown }).res === 'string',
  )
}

export function listAllResControllers(app: AppController): ResController[] {
  return app.main.domains.flatMap((domain) => [...domain.items])
}

export function findDomainByKey<D extends string = string>(app: AppController, domainKey: D): DomainController<D> | undefined {
  return app.main.domains.find((domain) => domain.domain === domainKey) as DomainController<D> | undefined
}

export function findResByPath(app: AppController, path: string): ResController | undefined {
  const parsed = splitResPath(path)
  if (!parsed) return undefined
  return listAllResControllers(app).find((item) => item.domain === parsed.domain && item.res === parsed.res)
}

export function flattenAppMenuNodes(app: AppController): FlatMenuNode[] {
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
