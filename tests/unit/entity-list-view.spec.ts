import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, markRaw } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { defaultEfsMessages } from '@efs/vue/default-messages.ts'
import EntityListView from '@efs/vue/views/EntityListView.vue'
import { vuetify } from '@efs/vue/vuetify.ts'

const localeCases = [
  {
    locale: 'zh-CN',
    resourceTitle: '用户',
    queryField: '用户名',
    search: '查询',
    reset: '重置',
    filter: '筛选',
    create: '新建',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    close: '关闭',
    dirty: '存在未保存修改',
    rowValue: 'alice',
    deleteConfirm: '确认删除当前记录吗？',
  },
  {
    locale: 'en-US',
    resourceTitle: 'User',
    queryField: 'Username',
    search: 'Search',
    reset: 'Reset',
    filter: 'Filter',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    close: 'Close',
    dirty: 'Unsaved changes',
    rowValue: 'alice',
    deleteConfirm: 'Delete the current record?',
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

const CrudDialogStub = defineComponent({
  name: 'CrudDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  render() {
    if (!this.modelValue) return null
    return h('div', { class: 'crud-dialog-stub' }, [
      h('div', { class: 'crud-dialog-stub__title' }, this.title),
      this.$slots.default?.(),
      this.$slots.footer?.(),
    ])
  },
})

describe('EntityListView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    window.innerWidth = 1280
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('visualViewport', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      width: 1280,
      height: 720,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
    localStorage.clear()
  })

  it.each(localeCases)('覆盖 $locale CRUD 资源界面默认文案与行为', async ({
    locale,
    resourceTitle,
    queryField,
    search,
    reset,
    filter,
    create: createLabel,
    edit: editLabel,
    delete: deleteLabel,
    save: saveLabel,
    close,
    dirty,
    rowValue,
    deleteConfirm,
  }) => {
    const row = { id: 1, username: 'alice' }
    const query = vi.fn().mockResolvedValue({
      items: [row],
      total: 1,
      activeItem: row,
    })
    const createHandler = vi.fn()
    const editHandler = vi.fn().mockResolvedValue(row)
    const saveHandler = vi.fn().mockResolvedValue({
      refresh: false,
      close: true,
      activeItem: row,
    })
    const removeHandler = vi.fn().mockResolvedValue({
      refresh: false,
      activeItem: null,
    })

    const controller = markRaw({
      handlers: { query, create: createHandler, edit: editHandler, save: saveHandler, remove: removeHandler },
      actions: {
        actions: [
          { key: 'create' },
        ],
        rowActions: [
          { key: 'edit' },
          { key: 'delete' },
        ],
      },
    })

    const wrapper = mount(defineComponent({
      name: 'EntityListViewHarness',
      render() {
        return h(EntityListView, {
          rowKey: 'id',
          title: resourceTitle,
          queryFields: [
            { key: 'username', title: queryField, type: 'text' },
          ],
          columns: [
            { key: 'id', title: 'ID' },
            { key: 'username', title: queryField },
          ],
          formSections: [
            {
              key: 'main',
              title: 'main',
              fields: [
                { key: 'username', title: queryField, widget: 'text', required: true },
              ],
            },
          ],
          detailFields: [
            { key: 'id', title: 'ID' },
            { key: 'username', title: queryField },
          ],
          controller,
          storageKey: '',
        })
      },
    }), {
      global: {
        plugins: [createI18nFor(locale), vuetify],
        stubs: {
          CrudDialog: CrudDialogStub,
        },
      },
    })

    await flushPromises()

    expect(query).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain(search)
    expect(wrapper.text()).toContain(reset)
    expect(wrapper.find(`button[title="${filter}"]`).exists()).toBe(true)
    expect(wrapper.find(`button[title="${createLabel}"]`).exists()).toBe(true)
    expect(wrapper.text()).toContain(rowValue)
    expect(wrapper.text()).toContain(editLabel)
    expect(wrapper.text()).toContain(deleteLabel)

    await wrapper.find(`button[title="${createLabel}"]`).trigger('click')
    await flushPromises()

    expect(createHandler).toHaveBeenCalledTimes(1)
    expect(wrapper.find(`button[title="${close}"]`).exists()).toBe(true)
    expect(wrapper.text()).toContain(saveLabel)

    const formInput = wrapper.find('.efs-resourcecrudpage__form-title-input input')
    await formInput.setValue('bob')
    await flushPromises()

    expect(wrapper.text()).toContain(dirty)

    const saveButton = wrapper.findAll('button').find((button) => button.text().trim() === saveLabel)
    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')
    await flushPromises()

    expect(saveHandler).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'create',
      item: expect.objectContaining({ username: 'bob' }),
    }))

    const editButton = wrapper.findAll('button').find((button) => button.text().trim() === editLabel)
    expect(editButton).toBeTruthy()
    await editButton!.trigger('click')
    await flushPromises()

    expect(editHandler).toHaveBeenCalledWith(row)
    expect(wrapper.find(`button[title="${close}"]`).exists()).toBe(true)

    const editInput = wrapper.find('.efs-resourcecrudpage__form-title-input input')
    await editInput.setValue('carol')
    await flushPromises()

    const saveButtonAfterEdit = wrapper.findAll('button').find((button) => button.text().trim() === saveLabel)
    expect(saveButtonAfterEdit).toBeTruthy()
    await saveButtonAfterEdit!.trigger('click')
    await flushPromises()

    expect(saveHandler).toHaveBeenLastCalledWith(expect.objectContaining({
      mode: 'edit',
      item: expect.objectContaining({ id: 1, username: 'carol' }),
    }))

    const deleteButton = wrapper.findAll('button').find((button) => button.text().trim() === deleteLabel)
    expect(deleteButton).toBeTruthy()
    await deleteButton!.trigger('click')
    await flushPromises()

    expect(globalThis.confirm).toHaveBeenCalledWith(deleteConfirm)
    expect(removeHandler).toHaveBeenCalledWith(row)

    wrapper.unmount()
  })
})
