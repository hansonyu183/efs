export const semanticIconMap = {
  home: '⌂',
  workbench: '⌂',
  users: '◪',
  user: '◯',
  profile: '◯',
  password: '◇',
  logout: '↗',
  settings: '⚙',
  more: '⋯',
  theme: '◐',
  light: '☼',
  dark: '☾',
  locale: '文',
  report: '▣',
  finance: '¤',
  workflow: '⇄',
  folder: '▤',
  ban: '⊘',
  agent: '✦',
  menu: '☰',
  close: '✕',
  send: '➜',
  org: '◎',
  sessions: '☷',
} as const

export function resolveSemanticIcon(key?: string, fallback = '•') {
  if (!key) return fallback
  return semanticIconMap[key as keyof typeof semanticIconMap] || fallback
}
