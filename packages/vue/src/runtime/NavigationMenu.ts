export type FlatMenuNode = {
  key: string
  title: string
  path?: string
  icon?: string
  order: number
  parentKey?: string | null
  type: 'group' | 'item'
  visible?: boolean
  disabled?: boolean
}

export type SidebarMenuTreeNode = {
  key: string
  title: string
  path?: string
  icon?: string
  order: number
  parentKey?: string | null
  type: 'group' | 'item'
  disabled?: boolean
  children: SidebarMenuTreeNode[]
}

function isFiniteOrder(value: unknown): value is number {
  return Number.isFinite(value)
}

function normalizeNode(node: Partial<FlatMenuNode> | null | undefined): SidebarMenuTreeNode | null {
  if (!node || typeof node !== 'object') return null
  if (!node.key || typeof node.key !== 'string') return null
  if (!isFiniteOrder(node.order)) return null
  if (node.visible === false) return null
  if (node.type !== 'group' && node.type !== 'item') return null
  if (node.type === 'item' && (!node.path || typeof node.path !== 'string')) return null

  return {
    key: node.key,
    title: node.title || node.key,
    path: node.path || '',
    icon: node.icon || '',
    order: Number(node.order),
    parentKey: node.parentKey ?? null,
    type: node.type,
    disabled: Boolean(node.disabled),
    children: [],
  }
}

function sortByOrder(items: SidebarMenuTreeNode[]) {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return String(a.key).localeCompare(String(b.key), 'zh-Hans-CN-u-co-pinyin')
  })
}

export function buildSidebarMenuTree(flatNodes: Array<Partial<FlatMenuNode>> = []): SidebarMenuTreeNode[] {
  const normalized = flatNodes.map(normalizeNode).filter(Boolean) as SidebarMenuTreeNode[]
  const byKey = new Map(normalized.map((node) => [node.key, node]))
  const roots: SidebarMenuTreeNode[] = []

  for (const node of normalized) {
    if (!node.parentKey) {
      roots.push(node)
      continue
    }
    const parent = byKey.get(node.parentKey)
    if (!parent || parent.type !== 'group') {
      continue
    }
    parent.children.push(node)
  }

  function finalize(nodes: SidebarMenuTreeNode[]): SidebarMenuTreeNode[] {
    return sortByOrder(nodes)
      .map((node) => ({ ...node, children: finalize(node.children || []) }))
      .filter((node) => node.type !== 'group' || node.children.length > 0)
  }

  return finalize(roots)
}
