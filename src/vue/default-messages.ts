export type EfsI18nMessages = {
  [key: string]: string | EfsI18nMessages
}

const zhCNFlatMessages: Record<string, string> = {
  'efs.brand.title': 'EFS',
  'efs.brand.subtitle': '企业前端服务',
  'efs.auth.title': '登录到 EFS',
  'efs.auth.subtitle': '请输入账号凭证继续访问平台。',
  'efs.auth.nameLabel': '用户名',
  'efs.auth.namePlaceholder': '请输入用户名',
  'efs.auth.passwordLabel': '密码',
  'efs.auth.passwordPlaceholder': '请输入密码',
  'efs.auth.submitLabel': '登录',
  'efs.auth.submittingLabel': '登录中…',
  'efs.shell.localeLabel': '语言',
  'efs.localeOptions.zh-CN': '中',
  'efs.localeOptions.en-US': 'EN',
  'efs.shell.themeLabel': '主题',
  'efs.themeOptions.light': '明',
  'efs.themeOptions.dark': '暗',
  'efs.shell.mobileMenuLabel': '切换导航',
  'efs.shell.moreLabel': '更多',
  'efs.shell.closeLabel': '关闭',
  'efs.shell.logoutLabel': '退出登录',
  'efs.shell.showAgentLabel': 'Agent',
  'efs.shell.agentTitle': 'Agent',
  'efs.shell.agentSessionsLabel': '会话管理',
  'efs.shell.agentSessionsEmptyText': '暂无会话',
  'efs.shell.agentPlaceholder': '请输入你的问题或操作指令',
  'efs.shell.agentSubmitLabel': '发送',
  'efs.shell.profileDialog.label': '个人资料',
  'efs.shell.profileDialog.subtitle': '更新当前账号的展示名称。',
  'efs.shell.profileDialog.displayNameLabel': '显示名称',
  'efs.shell.profileDialog.cancelLabel': '取消',
  'efs.shell.profileDialog.submitLabel': '保存',
  'efs.shell.passwordDialog.label': '修改密码',
  'efs.shell.passwordDialog.subtitle': '更新当前账号的登录密码。',
  'efs.shell.passwordDialog.currentPasswordLabel': '当前密码',
  'efs.shell.passwordDialog.newPasswordLabel': '新密码',
  'efs.shell.passwordDialog.confirmPasswordLabel': '确认新密码',
  'efs.shell.passwordDialog.mismatchMessage': '两次输入的新密码不一致。',
  'efs.shell.passwordDialog.cancelLabel': '取消',
  'efs.shell.passwordDialog.submitLabel': '提交',
  'efs.runtime.emptyTitle': '资源不存在',
  'efs.runtime.emptySubtitle': '当前 path 未注册对应资源。',
}

const enUSFlatMessages: Record<string, string> = {
  'efs.brand.title': 'EFS',
  'efs.brand.subtitle': 'Enterprise Frontend Service',
  'efs.auth.title': 'Sign in to EFS',
  'efs.auth.subtitle': 'Enter your credentials to continue.',
  'efs.auth.nameLabel': 'Username',
  'efs.auth.namePlaceholder': 'Enter username',
  'efs.auth.passwordLabel': 'Password',
  'efs.auth.passwordPlaceholder': 'Enter password',
  'efs.auth.submitLabel': 'Sign in',
  'efs.auth.submittingLabel': 'Signing in…',
  'efs.shell.localeLabel': 'Locale',
  'efs.localeOptions.zh-CN': '中',
  'efs.localeOptions.en-US': 'EN',
  'efs.shell.themeLabel': 'Theme',
  'efs.themeOptions.light': 'Light',
  'efs.themeOptions.dark': 'Dark',
  'efs.shell.mobileMenuLabel': 'Toggle navigation',
  'efs.shell.moreLabel': 'More',
  'efs.shell.closeLabel': 'Close',
  'efs.shell.logoutLabel': 'Sign out',
  'efs.shell.showAgentLabel': 'Agent',
  'efs.shell.agentTitle': 'Agent',
  'efs.shell.agentSessionsLabel': 'Sessions',
  'efs.shell.agentSessionsEmptyText': 'No sessions yet',
  'efs.shell.agentPlaceholder': 'Ask a question or enter a command',
  'efs.shell.agentSubmitLabel': 'Send',
  'efs.shell.profileDialog.label': 'Profile',
  'efs.shell.profileDialog.subtitle': 'Update the display name for the current account.',
  'efs.shell.profileDialog.displayNameLabel': 'Display name',
  'efs.shell.profileDialog.cancelLabel': 'Cancel',
  'efs.shell.profileDialog.submitLabel': 'Save',
  'efs.shell.passwordDialog.label': 'Change password',
  'efs.shell.passwordDialog.subtitle': 'Update the login password for the current account.',
  'efs.shell.passwordDialog.currentPasswordLabel': 'Current password',
  'efs.shell.passwordDialog.newPasswordLabel': 'New password',
  'efs.shell.passwordDialog.confirmPasswordLabel': 'Confirm new password',
  'efs.shell.passwordDialog.mismatchMessage': 'The new passwords do not match.',
  'efs.shell.passwordDialog.cancelLabel': 'Cancel',
  'efs.shell.passwordDialog.submitLabel': 'Submit',
  'efs.runtime.emptyTitle': 'Resource not found',
  'efs.runtime.emptySubtitle': 'No resource is registered for the current path.',
}

export const defaultEfsMessages: Record<string, EfsI18nMessages> = {
  'zh-CN': expandFlatMessages(zhCNFlatMessages),
  'en-US': expandFlatMessages(enUSFlatMessages),
}

function expandFlatMessages(flatMessages: Record<string, string>) {
  const nested: EfsI18nMessages = {}

  for (const [flatKey, value] of Object.entries(flatMessages)) {
    const segments = flatKey.split('.').filter(Boolean)
    let current: EfsI18nMessages = nested

    for (const [index, segment] of segments.entries()) {
      if (index === segments.length - 1) {
        current[segment] = value
        continue
      }

      const existing = current[segment]
      if (!existing || typeof existing === 'string') {
        current[segment] = {}
      }
      current = current[segment] as EfsI18nMessages
    }
  }

  return nested
}
