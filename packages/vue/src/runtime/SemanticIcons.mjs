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
}

export function resolveSemanticIcon(key, fallback = '•') {
  if (!key) return fallback
  return semanticIconMap[key] || fallback
}
