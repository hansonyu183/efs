import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { useMainPageModel } from '@efs/model/page/main-page'
import type { MainPageModelEmit } from '@efs/model/page/main-page'
import { createTestSchema } from './fixtures/schema'

function createHarness() {
  return defineComponent({
    name: 'MainPageModelHarness',
    setup() {
      const events: Array<[string, unknown]> = []
      const emit: MainPageModelEmit = ((event: string, value: unknown) => {
        events.push([event, value])
      }) as MainPageModelEmit
      return {
        events,
        ...useMainPageModel({
          schema: createTestSchema(),
          title: '控制台',
          locale: 'zh-CN',
          theme: 'dark',
          agentBusy: false,
          agentInput: '',
          agentSessionsOpen: false,
        }, {
          sidebar: () => [h('div', 'sidebar')],
        }, emit),
      }
    },
    render() {
      return h('div')
    },
  })
}

describe('useMainPageModel', () => {
  afterEach(() => {
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('根据视口切换移动端状态', async () => {
    window.innerWidth = 1200
    const wrapper = mount(createHarness())
    await nextTick()

    expect(wrapper.vm.isMobile).toBe(false)
    expect(wrapper.vm.sidebarOpen).toBe(true)

    window.innerWidth = 480
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.vm.isMobile).toBe(true)
    expect(wrapper.vm.sidebarOpen).toBe(false)
    wrapper.unmount()
  })

  it('切换会话面板时发出更新事件', async () => {
    const wrapper = mount(createHarness())
    wrapper.vm.handleAgentSessionsToggle()
    await nextTick()

    expect(wrapper.vm.agentSessionsPanelOpen).toBe(true)
    expect(wrapper.vm.events).toContainEqual(['update:agentSessionsOpen', true])
    wrapper.unmount()
  })
})
