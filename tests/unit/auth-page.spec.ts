import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from '@efs/vue/pages/AuthPage.vue'
import { efsI18n } from '@efs/vue/i18n.ts'
import { vuetify } from '@efs/vue/vuetify.ts'
import { createTestSchema } from './fixtures/schema'

describe('AuthPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('默认显示中文登录文案并提交成功', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: { token: 'token-123', tokenType: 'Bearer' } }),
    } as Response)

    const wrapper = mount(AuthPage, {
      props: {
        schema: createTestSchema(),
        locale: 'zh-CN',
        theme: 'dark',
      },
      global: {
        plugins: [efsI18n, vuetify],
      },
    })

    expect(wrapper.text()).toContain('登录')

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
        plugins: [efsI18n, vuetify],
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
