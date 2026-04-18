type SchemaOption = {
  key: string
  value: string
  title: string
}

type SchemaField = {
  key: string
  title: string
  type: string
  identity?: string
  required?: boolean
  readonly?: boolean
  options?: SchemaOption[]
}

type SchemaOperation = {
  path: string
  method: string
}

type SchemaQueryField = {
  key: string
  title: string
  type: string
  options?: SchemaOption[]
}

type SchemaColumn = {
  key: string
  title: string
  render?: string
}

type SchemaFormField = {
  key: string
  title: string
  widget: string
  required?: boolean
  options?: SchemaOption[]
}

type SchemaFormSection = {
  key: string
  title: string
  fields: SchemaFormField[]
}

type SchemaDetailField = {
  key: string
  title: string
}

type SchemaAction = {
  key: string
  title: string
  builtin?: string
  api?: string
}

type SchemaCrudView = {
  kind: 'crud'
  rowKey: string
  pageSizeOptions: number[]
  selectableRows: boolean
}

type SchemaReportView = {
  kind: 'report'
  pageSizeOptions: number[]
  selectableRows?: boolean
}

type SchemaResource = {
  key: string
  title: string
  description?: string
  fields: SchemaField[]
  operations: Record<string, SchemaOperation>
  view: SchemaCrudView | SchemaReportView
  queryFields: SchemaQueryField[]
  columns: SchemaColumn[]
  formSections: SchemaFormSection[]
  detailFields: SchemaDetailField[]
  summary: SchemaDetailField[]
  actions: {
    page: SchemaAction[]
    row: SchemaAction[]
    batch: SchemaAction[]
    report: SchemaAction[]
  }
}

type SchemaDomain = {
  key: string
  title: string
  resources: SchemaResource[]
}

type BaselineSchemaValue = {
  app: {
    id: string
    title: string
    brandIcon: string
    locale: string
    theme: string
    defaultDomain: string
    defaultRes: string
  }
  auth: {
    mode: string
    login: SchemaOperation
    logout: SchemaOperation
    token: {
      accessTokenField: string
      tokenTypeField: string
    }
  }
  services: {
    api: {
      kind: string
      baseUrl: string
      port: number
      healthPath: string
      transport: {
        requestDataKey: string
        responseDataKey: string
        authHeader: string
        authScheme: string
      }
    }
  }
  i18n: Record<string, unknown>
  domains: SchemaDomain[]
}

export const baselineSchema: BaselineSchemaValue = {
  app: {
    id: '',
    title: '',
    brandIcon: '',
    locale: 'zh-CN',
    theme: 'dark',
    defaultDomain: '',
    defaultRes: '',
  },
  auth: {
    mode: 'token',
    login: {
      path: '/user/login',
      method: 'POST',
    },
    logout: {
      path: '/user/logout',
      method: 'POST',
    },
    token: {
      accessTokenField: 'token',
      tokenTypeField: 'tokenType',
    },
  },
  services: {
    api: {
      kind: 'http',
      baseUrl: '',
      port: 0,
      healthPath: '/healthz',
      transport: {
        requestDataKey: 'data',
        responseDataKey: 'data',
        authHeader: 'Authorization',
        authScheme: 'Bearer',
      },
    },
  },
  i18n: {},
  domains: [
    {
      key: '',
      title: '',
      resources: [
        {
          key: '',
          title: '',
          description: '',
          fields: [
            {
              key: '',
              title: '',
              type: '',
              identity: '',
              required: false,
              readonly: false,
              options: [
                {
                  key: '',
                  value: '',
                  title: '',
                },
              ],
            },
          ],
          operations: {
            '': {
              path: '',
              method: '',
            },
          },
          view: {
            kind: 'crud',
            rowKey: '',
            pageSizeOptions: [0],
            selectableRows: false,
          },
          queryFields: [
            {
              key: '',
              title: '',
              type: '',
              options: [
                {
                  key: '',
                  value: '',
                  title: '',
                },
              ],
            },
          ],
          columns: [
            {
              key: '',
              title: '',
              render: '',
            },
          ],
          formSections: [
            {
              key: '',
              title: '',
              fields: [
                {
                  key: '',
                  title: '',
                  widget: '',
                  required: false,
                  options: [
                    {
                      key: '',
                      value: '',
                      title: '',
                    },
                  ],
                },
              ],
            },
          ],
          detailFields: [
            {
              key: '',
              title: '',
            },
          ],
          summary: [
            {
              key: '',
              title: '',
            },
          ],
          actions: {
            page: [
              {
                key: '',
                title: '',
                builtin: '',
                api: '',
              },
            ],
            row: [
              {
                key: '',
                title: '',
                builtin: '',
                api: '',
              },
            ],
            batch: [
              {
                key: '',
                title: '',
                builtin: '',
                api: '',
              },
            ],
            report: [
              {
                key: '',
                title: '',
                builtin: '',
                api: '',
              },
            ],
          },
        },
      ],
    },
  ],
}

export type BaselineSchema = typeof baselineSchema
