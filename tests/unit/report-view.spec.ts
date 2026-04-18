import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { defaultEfsMessages } from '@efs/vue/default-messages.ts'
import ReportView from '@efs/vue/views/ReportView.vue'
import { vuetify } from '@efs/vue/vuetify.ts'

const localeCases = [
  {
    locale: 'zh-CN',
    queryTitle: '查询条件',
    resultTitle: '结果列表',
    search: '查询',
    reset: '重置',
    filtersSummary: '筛选字段：1',
    total: '总数：0',
    emptyTitle: '暂无结果',
    emptyDescription: '当前条件下没有可展示的报表结果。',
  },
  {
    locale: 'en-US',
    queryTitle: 'Query conditions',
    resultTitle: 'Results',
    search: 'Search',
    reset: 'Reset',
    filtersSummary: 'Filters：1',
    total: 'Total：0',
    emptyTitle: 'No results',
    emptyDescription: 'There are no report results for the current filters.',
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

describe('ReportView', () => {
  it.each(localeCases)('渲染 $locale 报表空态文案', ({ locale, queryTitle, resultTitle, search, reset, filtersSummary, total, emptyTitle, emptyDescription }) => {
    const wrapper = mount(ReportView, {
      props: {
        title: 'Revenue report',
        queryFields: [
          { key: 'status', title: '', type: 'text' },
        ],
        columns: [
          { key: 'name', title: 'Name' },
        ],
      },
      global: {
        plugins: [createI18nFor(locale), vuetify],
      },
    })

    expect(wrapper.text()).toContain(queryTitle)
    expect(wrapper.text()).toContain(resultTitle)
    expect(wrapper.text()).toContain(search)
    expect(wrapper.text()).toContain(reset)
    expect(wrapper.text()).toContain(filtersSummary)
    expect(wrapper.text()).toContain(total)
    expect(wrapper.text()).toContain(emptyTitle)
    expect(wrapper.text()).toContain(emptyDescription)

    wrapper.unmount()
  })
})
