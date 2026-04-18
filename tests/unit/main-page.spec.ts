import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import MainPage from '@efs/vue/pages/MainPage.vue'
import { defaultEfsMessages } from '@efs/vue/default-messages.ts'
import { vuetify } from '@efs/vue/vuetify.ts'
import { createTestSchema } from './fixtures/schema'

const localeCases = [
  {
    locale: 'zh-CN',
    title: '控制台',
    more: '更多',
    logout: '退出登录',
    agentPlaceholder: '请输入你的问题或操作指令',
    agentSessions: '会话管理',
    agentSessionsEmpty: '暂无会话',
    profile: '个人资料',
    password: '修改密码',
    passwordMismatch: '两次输入的新密码不一致。',
  },
  {
    locale: 'en-US',
    title: 'Console',
    more: 'More',
    logout: 'Sign out',
    agentPlaceholder: 'Ask a question or enter a command',
    agentSessions: 'Sessions',
    agentSessionsEmpty: 'No sessions yet',
    profile: 'Profile',
    password: 'Change password',
    passwordMismatch: 'The new passwords do not match.',
  },
] as const

function createI18nFor(locale: 'zh-CN' | 'en-US') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'zh-CN',
    messages: defaultEfsMessages,
  })
}

describe('MainPage', () => {
  it.each(localeCases)('渲染 $locale 主页面文案与交互', async ({
    locale,
    title,
    more,
    logout,
    agentPlaceholder,
    agentSessions,
    agentSessionsEmpty,
    profile,
    password,
    passwordMismatch,
  }) => {
    const wrapper = mount(MainPage, {
      props: {
        schema: createTestSchema(),
        title,
        locale,
        theme: 'dark',
      },
      slots: {
        sidebar: '<div class="test-sidebar">side</div>',
        default: '<div class="test-content">content</div>',
      },
      global: {
        plugins: [createI18nFor(locale), vuetify],
      },
    })

    expect(wrapper.text()).toContain(title)
    expect(wrapper.find(`summary[title="${more}"]`).exists()).toBe(true)
    expect(wrapper.text()).toContain(logout)
    expect(wrapper.find(`input[placeholder="${agentPlaceholder}"]`).exists()).toBe(true)
    expect(wrapper.find('.test-sidebar').exists()).toBe(true)
    expect(wrapper.find('.test-content').exists()).toBe(true)

    await wrapper.find(`button[title="${profile}"]`).trigger('click')
    expect(wrapper.text()).toContain(profile)

    await wrapper.find(`button[title="${password}"]`).trigger('click')
    const passwordDialog = wrapper.findAll('.efs-main-layout__dialog')[0]
    const passwordInputs = passwordDialog?.findAll('input') ?? []
    await passwordInputs[0]?.setValue('old-secret')
    await passwordInputs[1]?.setValue('new-secret')
    await passwordInputs[2]?.setValue('different-secret')

    expect(wrapper.text()).toContain(password)
    expect(wrapper.text()).toContain(passwordMismatch)

    await wrapper.find(`button[title="${agentSessions}"]`).trigger('click')
    expect(wrapper.emitted('update:agentSessionsOpen')).toEqual([[true]])
    expect(wrapper.text()).toContain(agentSessionsEmpty)

    wrapper.unmount()
  })
})
