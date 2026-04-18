import { describe, expect, it } from 'vitest'
import { defaultEfsMessages, type EfsI18nMessages } from '@efs/vue/default-messages.ts'

function flattenMessages(messages: EfsI18nMessages, prefix = ''): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      acc[nextKey] = value
      return acc
    }

    Object.assign(acc, flattenMessages(value, nextKey))
    return acc
  }, {})
}

describe('defaultEfsMessages', () => {
  it('保持 zh-CN 与 en-US 默认文案 key 集合一致', () => {
    const zhCN = flattenMessages(defaultEfsMessages['zh-CN'])
    const enUS = flattenMessages(defaultEfsMessages['en-US'])

    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(enUS).sort())
    expect(Object.values(zhCN).every((value) => value.length > 0)).toBe(true)
    expect(Object.values(enUS).every((value) => value.length > 0)).toBe(true)
  })

  it('保留核心布局与报表文案', () => {
    const zhCN = flattenMessages(defaultEfsMessages['zh-CN'])
    const enUS = flattenMessages(defaultEfsMessages['en-US'])

    expect(zhCN['efs.auth.title']).toBe('登录到 EFS')
    expect(enUS['efs.auth.title']).toBe('Sign in to EFS')
    expect(zhCN['efs.shell.logoutLabel']).toBe('退出登录')
    expect(enUS['efs.shell.logoutLabel']).toBe('Sign out')
    expect(zhCN['efs.reportPanel.resultEmptyText']).toBe('暂无报表结果。')
    expect(enUS['efs.reportPanel.resultEmptyText']).toBe('No report results available.')
  })
})
