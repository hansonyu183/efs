import test from 'node:test'
import assert from 'node:assert/strict'
import { renderDynamicPage } from '../packages/vue/src/runtime/DynamicPageRenderer.mjs'
import { MetadataFormRenderer } from '../packages/vue/src/runtime/MetadataFormRenderer.mjs'
import { MetadataTableRenderer } from '../packages/vue/src/runtime/MetadataTableRenderer.mjs'
import { ActionRenderer } from '../packages/vue/src/runtime/ActionRenderer.mjs'

test('renderDynamicPage builds standard shell plan for runtime metadata page', () => {
  const rendered = renderDynamicPage(
    { pageType: 'runtime-metadata-page' },
    {
      table: { columns: [{ key: 'code', label: '编码' }] },
      form: { fields: [{ key: 'code', label: '编码', required: true }] },
      actions: [{ id: 'query', label: '查询' }]
    }
  )

  assert.equal(rendered.pageType, 'runtime-metadata-page')
  assert.ok(rendered.shellPlan.includes('DynamicPageRenderer'))
  assert.equal(rendered.table.schema.columns[0].key, 'code')
  assert.equal(rendered.form.schema.fields[0].required, true)
  assert.equal(rendered.actions.actions[0].id, 'query')
})

test('metadata renderers normalize fields and columns', () => {
  const form = MetadataFormRenderer({ fields: [{ key: 'name' }] })
  const table = MetadataTableRenderer({ columns: [{ key: 'name' }] })
  const actions = ActionRenderer([{ label: '保存' }])

  assert.equal(form.schema.fields[0].widget, 'text')
  assert.equal(table.schema.columns[0].formatter, 'text')
  assert.equal(actions.actions[0].label, '保存')
})
