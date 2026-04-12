export function normalizeFormSchema(schema = {}) {
  const fields = Array.isArray(schema.fields) ? schema.fields : []
  return {
    title: schema.title || '',
    fields: fields.map((field, index) => ({
      key: field.key || `field_${index + 1}`,
      label: field.label || field.key || `Field ${index + 1}`,
      widget: field.widget || 'text',
      required: Boolean(field.required),
      readonly: Boolean(field.readonly),
      permission: field.permission || null
    }))
  }
}

export function MetadataFormRenderer(schema = {}) {
  return {
    kind: 'form',
    schema: normalizeFormSchema(schema)
  }
}
