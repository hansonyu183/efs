export interface EfsFieldSchema {
  key: string
  title?: string
  type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'ref' | 'json'
  required?: boolean
  readonly?: boolean
  identity?: 'id' | 'title' | 'code'
  options?: EfsFieldOption[]
  ref?: string
  description?: string
}

export interface EfsFieldOption {
  key: string
  value: string
  title?: string
  disabled?: boolean
}
