import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEfsAppModel } from '@efs/model/app/efs-app'
import { clearStoredAuthSession } from '@efs/model/app/auth-session'
import { createTestSchema } from './fixtures/schema'

function createHarness() {
  return defineComponent({
    name: 'EfsAppModelHarness',
    setup() {
      return useEfsAppModel(createTestSchema())
    },
    render() {
      return h('div')
    },
  })
}

describe('useEfsAppModel', () => {
  beforeEach(() => {
    localStorage.clear()
    clearStoredAuthSession()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: {} }),
    } as Response))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('未登录时显示登录页，登录成功后进入主壳', async () => {
    const wrapper = mount(createHarness())
    await nextTick()

    expect(wrapper.vm.showAuthPage).toBe(true)
    expect(wrapper.vm.currentPath).toBe('/login')

    wrapper.vm.handleLoginSuccess({ accessToken: 'token-123' })
    await nextTick()

    expect(wrapper.vm.showAuthPage).toBe(false)
    expect(wrapper.vm.currentPath).toBe('/admin/user')
    expect(localStorage.getItem('efs.auth.accessToken')).toBe('token-123')
    wrapper.unmount()
  })

  it('登出后清 session 并回登录页', async () => {
    const wrapper = mount(createHarness())
    wrapper.vm.handleLoginSuccess({ accessToken: 'token-123' })
    await nextTick()

    await wrapper.vm.handleLogout()
    await nextTick()

    expect(wrapper.vm.showAuthPage).toBe(true)
    expect(wrapper.vm.currentPath).toBe('/login')
    expect(localStorage.getItem('efs.auth.accessToken')).toBeNull()
    wrapper.unmount()
  })
})
