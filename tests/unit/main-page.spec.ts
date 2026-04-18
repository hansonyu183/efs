import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MainPage from '@efs/vue/pages/MainPage.vue'
import { efsI18n } from '@efs/vue/i18n.ts'
import { vuetify } from '@efs/vue/vuetify.ts'
import { createTestSchema } from './fixtures/schema'

describe('MainPage', () => {
  it('渲染主页面标题和侧栏插槽', () => {
    const wrapper = mount(MainPage, {
      props: {
        schema: createTestSchema(),
        title: '控制台',
        locale: 'zh-CN',
        theme: 'dark',
      },
      slots: {
        sidebar: '<div class="test-sidebar">side</div>',
        default: '<div class="test-content">content</div>',
      },
      global: {
        plugins: [efsI18n, vuetify],
      },
    })

    expect(wrapper.text()).toContain('控制台')
    expect(wrapper.find('.test-sidebar').exists()).toBe(true)
    expect(wrapper.find('.test-content').exists()).toBe(true)
    wrapper.unmount()
  })
})
