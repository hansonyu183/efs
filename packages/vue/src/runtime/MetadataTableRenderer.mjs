export function normalizeTableSchema(schema = {}) {
  const columns = Array.isArray(schema.columns) ? schema.columns : []
  return {
    title: schema.title || '',
    columns: columns.map((column, index) => ({
      key: column.key || `column_${index + 1}`,
      label: column.label || column.key || `Column ${index + 1}`,
      formatter: column.formatter || 'text',
      visible: column.visible !== false,
      permission: column.permission || null
    }))
  }
}

export function MetadataTableRenderer(schema = {}) {
  return {
    kind: 'table',
    schema: normalizeTableSchema(schema)
  }
}
