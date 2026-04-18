import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import AuthPage from '@efs/vue/pages/AuthPage.vue'
import { defaultEfsMessages } from '@efs/vue/default-messages.ts'
import { vuetify } from '@efs/vue/vuetify.ts'
import { createTestSchema } from './fixtures/schema'

const localeCases = [
  {
    locale: 'zh-CN',
    title: '登录到 EFS',
    subtitle: '请输入账号凭证继续访问平台。',
    username: '用户名',
    password: '密码',
    submit: '登录',
  },
  {
    locale: 'en-US',
    title: 'Sign in to EFS',
    subtitle: 'Enter your credentials to continue.',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
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

describe('AuthPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each(localeCases)('渲染 $locale 登录文案并提交成功', async ({ locale, title, subtitle, username, password, submit }) => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: { token: 'token-123', tokenType: 'Bearer' } }),
    } as Response)

    const wrapper = mount(AuthPage, {
      props: {
        schema: createTestSchema(),
        locale,
        theme: 'dark',
      },
      global: {
        plugins: [createI18nFor(locale), vuetify],
      },
    })

    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain(subtitle)
    expect(wrapper.text()).toContain(username)
    expect(wrapper.text()).toContain(password)
    expect(wrapper.text()).toContain(submit)

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('demo')
    await inputs[1]?.setValue('secret')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('login-success')).toBeTruthy()
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('登录失败时显示错误信息', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => JSON.stringify({ message: 'bad credentials' }),
    } as Response)

    const wrapper = mount(AuthPage, {
      props: {
        schema: createTestSchema(),
        locale: 'zh-CN',
        theme: 'dark',
      },
      global: {
        plugins: [createI18nFor('zh-CN'), vuetify],
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('demo')
    await inputs[1]?.setValue('bad')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('bad credentials')
    expect(wrapper.emitted('login-success')).toBeFalsy()
    wrapper.unmount()
  })
})
