import type { FlatMenuNode } from './navigation-menu'
import type { DomainResPath } from '../types/resource-model'
import type { EfsAppSchema } from '../../schema/index.ts'

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

export function flattenAppMenuNodes(app: Readonly<EfsAppSchema>): FlatMenuNode[] {
  const domainNodes: FlatMenuNode[] = app.domains.map((rawDomain, index) => {
    const domain = rawDomain as typeof rawDomain & { icon?: string; order?: number }
    return {
      key: domain.key,
      title: domain.title || domain.key,
      icon: domain.icon || '',
      order: domain.order ?? (index + 1) * 10,
      type: 'group' as const,
    }
  })

  const itemNodes: FlatMenuNode[] = app.domains.flatMap((rawDomain, domainIndex) => {
    const domain = rawDomain as typeof rawDomain & { icon?: string; order?: number }
    return domain.resources.map((rawItem, itemIndex) => {
      const item = rawItem as typeof rawItem & { icon?: string; order?: number }
      return {
        key: buildResPath(domain.key, item.key),
        title: item.title || item.key,
        path: `/${buildResPath(domain.key, item.key)}`,
        icon: item.icon || '',
        order: item.order ?? ((domainIndex + 1) * 100 + (itemIndex + 1) * 10),
        parentKey: domain.key,
        type: 'item' as const,
      }
    })
  })

  return [...domainNodes, ...itemNodes]
}
