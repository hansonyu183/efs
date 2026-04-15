export interface EfsFieldSchema {
  key: string
  title?: string
  kind?: 'text' | 'number' | 'bool' | 'date' | 'datetime' | 'enum' | 'ref' | 'tags' | 'json'
  use?: Array<'query' | 'list' | 'form' | 'detail'>
  required?: boolean
  readonly?: boolean
  order?: number
  identity?: 'primary' | 'title' | 'code'
  queryType?: 'text' | 'search' | 'date' | 'number' | 'select'
  widget?: 'text' | 'number' | 'switch' | 'date' | 'select' | 'tags' | 'json'
  render?: 'text' | 'status' | 'tags'
  summary?: boolean
  options?: EfsFieldOption[]
  ref?: string
}

export interface EfsFieldOption {
  key: string
  value: string
  title?: string
  disabled?: boolean
}
