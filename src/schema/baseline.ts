import { appI18n } from './app.i18n'

export const baselineSchema = {
  "schemaVersion": "v1",
  "app": {
    "id": "agentos",
    "name": "agentos",
    "title": "AgentOS",
    "locale": "zh-CN",
    "theme": "light",
    "defaultDomain": "admin",
    "defaultRes": "user"
  },
  "auth": {
    "mode": "token",
    "login": {
      "path": "/user/login",
      "method": "POST"
    },
    "logout": {
      "path": "/user/logout",
      "method": "POST"
    },
    "token": {
      "accessTokenField": "token",
      "tokenTypeField": "tokenType"
    }
  },
  "services": {
    "api": {
      "kind": "http",
      "baseUrl": "/agentos-api",
      "port": 8002,
      "healthPath": "/healthz",
      "devCommand": "go run ./cmd/server",
      "workingDir": "../../../go-dev/AgentOS",
      "transport": {
        "requestDataKey": "data",
        "responseDataKey": "data",
        "authHeader": "Authorization",
        "authScheme": "Bearer"
      }
    }
  },
  "i18n": appI18n,
  "domains": [
    {
      "key": "admin",
      "title": "平台管理",
      "resources": [
        {
          "key": "user",
          "title": "用户",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "username",
              "title": "用户名",
              "type": "string",
              "required": true
            },
            {
              "key": "displayName",
              "title": "显示名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "password",
              "title": "密码",
              "type": "string"
            },
            {
              "key": "memberships",
              "title": "成员关系",
              "type": "json"
            }
          ],
          "operations": {
            "create": {
              "path": "/admin/user/create",
              "method": "POST"
            },
            "query": {
              "path": "/admin/user/query",
              "method": "POST"
            },
            "detail": {
              "path": "/admin/user/detail",
              "method": "POST"
            },
            "update": {
              "path": "/admin/user/update",
              "method": "POST"
            },
            "reset-password": {
              "path": "/admin/user/reset-password",
              "method": "POST"
            },
            "delete": {
              "path": "/admin/user/delete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "username",
              "title": "用户名",
              "type": "text"
            },
            {
              "key": "displayName",
              "title": "显示名称",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "username",
              "title": "用户名"
            },
            {
              "key": "displayName",
              "title": "显示名称"
            },
            {
              "key": "memberships",
              "title": "成员关系"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "username",
                  "title": "用户名",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "displayName",
                  "title": "显示名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "password",
                  "title": "密码",
                  "widget": "text"
                },
                {
                  "key": "memberships",
                  "title": "成员关系",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "username",
              "title": "用户名"
            },
            {
              "key": "displayName",
              "title": "显示名称"
            },
            {
              "key": "memberships",
              "title": "成员关系"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "resetPassword",
                "title": "重置密码",
                "api": "reset-password"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "role",
          "title": "角色",
          "fields": [
            {
              "key": "code",
              "title": "角色编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "角色名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "permissions",
              "title": "权限",
              "type": "json"
            }
          ],
          "operations": {
            "create": {
              "path": "/admin/role/create",
              "method": "POST"
            },
            "query": {
              "path": "/admin/role/query",
              "method": "POST"
            },
            "detail": {
              "path": "/admin/role/detail",
              "method": "POST"
            },
            "update": {
              "path": "/admin/role/update",
              "method": "POST"
            },
            "delete": {
              "path": "/admin/role/delete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "code",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "code",
              "title": "角色编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "角色名称",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "code",
              "title": "角色编码"
            },
            {
              "key": "name",
              "title": "角色名称"
            },
            {
              "key": "permissions",
              "title": "权限"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "角色编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "角色名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "permissions",
                  "title": "权限",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "code",
              "title": "角色编码"
            },
            {
              "key": "name",
              "title": "角色名称"
            },
            {
              "key": "permissions",
              "title": "权限"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "organization",
          "title": "组织",
          "fields": [
            {
              "key": "code",
              "title": "组织编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "组织名称",
              "type": "string",
              "identity": "title",
              "required": true
            }
          ],
          "operations": {
            "create": {
              "path": "/admin/organization/create",
              "method": "POST"
            },
            "query": {
              "path": "/admin/organization/query",
              "method": "POST"
            },
            "detail": {
              "path": "/admin/organization/detail",
              "method": "POST"
            },
            "update": {
              "path": "/admin/organization/update",
              "method": "POST"
            },
            "delete": {
              "path": "/admin/organization/delete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "code",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "code",
              "title": "组织编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "组织名称",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "code",
              "title": "组织编码"
            },
            {
              "key": "name",
              "title": "组织名称"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "组织编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "组织名称",
                  "widget": "text",
                  "required": true
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "code",
              "title": "组织编码"
            },
            {
              "key": "name",
              "title": "组织名称"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "membership",
          "title": "成员关系",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "userId",
              "title": "用户ID",
              "type": "number",
              "required": true
            },
            {
              "key": "orgCode",
              "title": "组织编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "roleCode",
              "title": "角色编码",
              "type": "string",
              "identity": "title",
              "required": true
            }
          ],
          "operations": {
            "create": {
              "path": "/admin/membership/create",
              "method": "POST"
            },
            "query": {
              "path": "/admin/membership/query",
              "method": "POST"
            },
            "detail": {
              "path": "/admin/membership/detail",
              "method": "POST"
            },
            "update": {
              "path": "/admin/membership/update",
              "method": "POST"
            },
            "delete": {
              "path": "/admin/membership/delete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "userId",
              "title": "用户ID",
              "type": "number"
            },
            {
              "key": "orgCode",
              "title": "组织编码",
              "type": "text"
            },
            {
              "key": "roleCode",
              "title": "角色编码",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "userId",
              "title": "用户ID"
            },
            {
              "key": "orgCode",
              "title": "组织编码"
            },
            {
              "key": "roleCode",
              "title": "角色编码"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "userId",
                  "title": "用户ID",
                  "widget": "number",
                  "required": true
                },
                {
                  "key": "orgCode",
                  "title": "组织编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "roleCode",
                  "title": "角色编码",
                  "widget": "text",
                  "required": true
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "userId",
              "title": "用户ID"
            },
            {
              "key": "orgCode",
              "title": "组织编码"
            },
            {
              "key": "roleCode",
              "title": "角色编码"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "permission",
          "title": "权限目录",
          "fields": [
            {
              "key": "domain",
              "title": "领域",
              "type": "string"
            },
            {
              "key": "resource",
              "title": "资源",
              "type": "string"
            },
            {
              "key": "operation",
              "title": "操作",
              "type": "string"
            },
            {
              "key": "method",
              "title": "方法",
              "type": "string"
            },
            {
              "key": "path",
              "title": "路径",
              "type": "string"
            },
            {
              "key": "permission",
              "title": "权限标识",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "handlerName",
              "title": "处理器",
              "type": "string"
            }
          ],
          "operations": {
            "query": {
              "path": "/admin/permission/query",
              "method": "POST"
            },
            "detail": {
              "path": "/admin/permission/detail",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "permission",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "domain",
              "title": "领域",
              "type": "text"
            },
            {
              "key": "resource",
              "title": "资源",
              "type": "text"
            },
            {
              "key": "operation",
              "title": "操作",
              "type": "text"
            },
            {
              "key": "method",
              "title": "方法",
              "type": "text"
            },
            {
              "key": "path",
              "title": "路径",
              "type": "text"
            },
            {
              "key": "permission",
              "title": "权限标识",
              "type": "text"
            },
            {
              "key": "handlerName",
              "title": "处理器",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "domain",
              "title": "领域"
            },
            {
              "key": "resource",
              "title": "资源"
            },
            {
              "key": "operation",
              "title": "操作"
            },
            {
              "key": "method",
              "title": "方法"
            },
            {
              "key": "path",
              "title": "路径"
            },
            {
              "key": "permission",
              "title": "权限标识"
            },
            {
              "key": "handlerName",
              "title": "处理器"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "domain",
                  "title": "领域",
                  "widget": "text"
                },
                {
                  "key": "resource",
                  "title": "资源",
                  "widget": "text"
                },
                {
                  "key": "operation",
                  "title": "操作",
                  "widget": "text"
                },
                {
                  "key": "method",
                  "title": "方法",
                  "widget": "text"
                },
                {
                  "key": "path",
                  "title": "路径",
                  "widget": "text"
                },
                {
                  "key": "permission",
                  "title": "权限标识",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "handlerName",
                  "title": "处理器",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "domain",
              "title": "领域"
            },
            {
              "key": "resource",
              "title": "资源"
            },
            {
              "key": "operation",
              "title": "操作"
            },
            {
              "key": "method",
              "title": "方法"
            },
            {
              "key": "path",
              "title": "路径"
            },
            {
              "key": "permission",
              "title": "权限标识"
            },
            {
              "key": "handlerName",
              "title": "处理器"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [],
            "batch": []
          }
        }
      ]
    },
    {
      "key": "masterdata",
      "title": "基础资料",
      "resources": [
        {
          "key": "customer",
          "title": "客户主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/customer/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/customer/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/customer/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/customer/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/customer/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/customer/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "supplier",
          "title": "供应商主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/supplier/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/supplier/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/supplier/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/supplier/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/supplier/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/supplier/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "department",
          "title": "部门主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/department/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/department/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/department/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/department/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/department/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/department/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "position",
          "title": "岗位主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/position/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/position/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/position/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/position/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/position/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/position/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "employee",
          "title": "员工主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/employee/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/employee/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/employee/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/employee/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/employee/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/employee/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "product",
          "title": "产品主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/product/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/product/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/product/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/product/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/product/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/product/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "service",
          "title": "服务主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/service/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/service/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/service/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/service/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/service/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/service/submit",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "编码"
            },
            {
              "key": "name",
              "title": "名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "category",
          "title": "分类主数据",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "setCode",
              "title": "分类集编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "setName",
              "title": "分类集名称",
              "type": "string"
            },
            {
              "key": "name",
              "title": "分类名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            }
          ],
          "operations": {
            "create": {
              "path": "/masterdata/category/create",
              "method": "POST"
            },
            "query": {
              "path": "/masterdata/category/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/category/detail",
              "method": "POST"
            },
            "update": {
              "path": "/masterdata/category/update",
              "method": "POST"
            },
            "delete": {
              "path": "/masterdata/category/delete",
              "method": "POST"
            },
            "submit": {
              "path": "/masterdata/category/submit",
              "method": "POST"
            },
            "bind": {
              "path": "/masterdata/category/bind",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "setCode",
              "title": "分类集编码",
              "type": "text"
            },
            {
              "key": "setName",
              "title": "分类集名称",
              "type": "text"
            },
            {
              "key": "name",
              "title": "分类名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "setCode",
              "title": "分类集编码"
            },
            {
              "key": "setName",
              "title": "分类集名称"
            },
            {
              "key": "name",
              "title": "分类名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "setCode",
                  "title": "分类集编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "setName",
                  "title": "分类集名称",
                  "widget": "text"
                },
                {
                  "key": "name",
                  "title": "分类名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "text"
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "setCode",
              "title": "分类集编码"
            },
            {
              "key": "setName",
              "title": "分类集名称"
            },
            {
              "key": "name",
              "title": "分类名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              },
              {
                "key": "submit",
                "title": "提交变更",
                "api": "submit"
              },
              {
                "key": "bind",
                "title": "绑定分类",
                "api": "bind"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        },
        {
          "key": "change",
          "title": "主数据变更单",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "resource",
              "title": "资源",
              "type": "string"
            },
            {
              "key": "changeType",
              "title": "变更类型",
              "type": "string"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "string"
            },
            {
              "key": "title",
              "title": "标题",
              "type": "string",
              "identity": "title"
            }
          ],
          "operations": {
            "query": {
              "path": "/masterdata/change/query",
              "method": "POST"
            },
            "detail": {
              "path": "/masterdata/change/detail",
              "method": "POST"
            },
            "approve": {
              "path": "/masterdata/change/approve",
              "method": "POST"
            },
            "reject": {
              "path": "/masterdata/change/reject",
              "method": "POST"
            }
          },
          "view": {
            "kind": "report",
            "pageSizeOptions": [
              10,
              20,
              50
            ]
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "resource",
              "title": "资源",
              "type": "text"
            },
            {
              "key": "changeType",
              "title": "变更类型",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "text"
            },
            {
              "key": "title",
              "title": "标题",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "resource",
              "title": "资源"
            },
            {
              "key": "changeType",
              "title": "变更类型"
            },
            {
              "key": "status",
              "title": "状态"
            },
            {
              "key": "title",
              "title": "标题"
            }
          ],
          "summary": [
            {
              "key": "id",
              "title": "ID"
            }
          ],
          "actions": {
            "report": [
              {
                "key": "approve",
                "title": "审批通过",
                "api": "approve"
              },
              {
                "key": "reject",
                "title": "驳回变更",
                "api": "reject"
              }
            ]
          }
        }
      ]
    },
    {
      "key": "crm",
      "title": "客户中心",
      "resources": [
        {
          "key": "customer",
          "title": "客户",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "code",
              "title": "客户编码",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "name",
              "title": "客户名称",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "enum",
              "options": [
                {
                  "key": "active",
                  "value": "active",
                  "title": "启用"
                },
                {
                  "key": "inactive",
                  "value": "inactive",
                  "title": "停用"
                }
              ]
            }
          ],
          "operations": {
            "create": {
              "path": "/crm/customer/create",
              "method": "POST"
            },
            "query": {
              "path": "/crm/customer/query",
              "method": "POST"
            },
            "detail": {
              "path": "/crm/customer/detail",
              "method": "POST"
            },
            "update": {
              "path": "/crm/customer/update",
              "method": "POST"
            },
            "delete": {
              "path": "/crm/customer/delete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "crud",
            "rowKey": "id",
            "pageSizeOptions": [
              10,
              20,
              50
            ],
            "selectableRows": true
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "code",
              "title": "客户编码",
              "type": "text"
            },
            {
              "key": "name",
              "title": "客户名称",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "select",
              "options": [
                {
                  "key": "active",
                  "value": "active",
                  "title": "启用"
                },
                {
                  "key": "inactive",
                  "value": "inactive",
                  "title": "停用"
                }
              ]
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "客户编码"
            },
            {
              "key": "name",
              "title": "客户名称"
            },
            {
              "key": "status",
              "title": "状态",
              "render": "status"
            }
          ],
          "formSections": [
            {
              "key": "main",
              "title": "基本信息",
              "fields": [
                {
                  "key": "code",
                  "title": "客户编码",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "name",
                  "title": "客户名称",
                  "widget": "text",
                  "required": true
                },
                {
                  "key": "status",
                  "title": "状态",
                  "widget": "select",
                  "options": [
                    {
                      "key": "active",
                      "value": "active",
                      "title": "启用"
                    },
                    {
                      "key": "inactive",
                      "value": "inactive",
                      "title": "停用"
                    }
                  ]
                }
              ]
            }
          ],
          "detailFields": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "code",
              "title": "客户编码"
            },
            {
              "key": "name",
              "title": "客户名称"
            },
            {
              "key": "status",
              "title": "状态"
            }
          ],
          "actions": {
            "page": [
              {
                "key": "create",
                "title": "新建",
                "builtin": "create"
              },
              {
                "key": "refresh",
                "title": "刷新",
                "builtin": "refresh"
              }
            ],
            "row": [
              {
                "key": "update",
                "title": "编辑",
                "builtin": "update"
              },
              {
                "key": "delete",
                "title": "删除",
                "api": "delete"
              }
            ],
            "batch": []
          }
        }
      ]
    },
    {
      "key": "workflow",
      "title": "流程中心",
      "resources": [
        {
          "key": "process",
          "title": "流程实例",
          "description": "对应 AgentOS workflow/process 资源的 schema-first 演示。",
          "fields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number",
              "identity": "id",
              "readonly": true
            },
            {
              "key": "definitionCode",
              "title": "流程定义",
              "type": "string",
              "identity": "code",
              "required": true
            },
            {
              "key": "title",
              "title": "标题",
              "type": "string",
              "identity": "title",
              "required": true
            },
            {
              "key": "status",
              "title": "状态",
              "type": "enum",
              "options": [
                {
                  "key": "pending",
                  "value": "pending",
                  "title": "待处理"
                },
                {
                  "key": "approved",
                  "value": "approved",
                  "title": "已通过"
                },
                {
                  "key": "cancelled",
                  "value": "cancelled",
                  "title": "已取消"
                },
                {
                  "key": "completed",
                  "value": "completed",
                  "title": "已完成"
                }
              ]
            },
            {
              "key": "currentStep",
              "title": "当前步骤",
              "type": "string"
            },
            {
              "key": "assigneeName",
              "title": "处理人",
              "type": "string"
            }
          ],
          "operations": {
            "query": {
              "path": "/workflow/process/query",
              "method": "POST"
            },
            "detail": {
              "path": "/workflow/process/detail",
              "method": "POST"
            },
            "start": {
              "path": "/workflow/process/start",
              "method": "POST"
            },
            "approve": {
              "path": "/workflow/process/approve",
              "method": "POST"
            },
            "cancel": {
              "path": "/workflow/process/cancel",
              "method": "POST"
            },
            "complete": {
              "path": "/workflow/process/complete",
              "method": "POST"
            }
          },
          "view": {
            "kind": "report",
            "pageSizeOptions": [
              10,
              20,
              50
            ]
          },
          "queryFields": [
            {
              "key": "id",
              "title": "ID",
              "type": "number"
            },
            {
              "key": "definitionCode",
              "title": "流程定义",
              "type": "text"
            },
            {
              "key": "title",
              "title": "标题",
              "type": "text"
            },
            {
              "key": "status",
              "title": "状态",
              "type": "select",
              "options": [
                {
                  "key": "pending",
                  "value": "pending",
                  "title": "待处理"
                },
                {
                  "key": "approved",
                  "value": "approved",
                  "title": "已通过"
                },
                {
                  "key": "cancelled",
                  "value": "cancelled",
                  "title": "已取消"
                },
                {
                  "key": "completed",
                  "value": "completed",
                  "title": "已完成"
                }
              ]
            },
            {
              "key": "currentStep",
              "title": "当前步骤",
              "type": "text"
            },
            {
              "key": "assigneeName",
              "title": "处理人",
              "type": "text"
            }
          ],
          "columns": [
            {
              "key": "id",
              "title": "ID"
            },
            {
              "key": "definitionCode",
              "title": "流程定义"
            },
            {
              "key": "title",
              "title": "标题"
            },
            {
              "key": "status",
              "title": "状态",
              "render": "status"
            },
            {
              "key": "currentStep",
              "title": "当前步骤"
            },
            {
              "key": "assigneeName",
              "title": "处理人"
            }
          ],
          "summary": [
            {
              "key": "id",
              "title": "ID"
            }
          ],
          "actions": {
            "report": [
              {
                "key": "start",
                "title": "发起流程",
                "api": "start"
              },
              {
                "key": "approve",
                "title": "审批通过",
                "api": "approve"
              },
              {
                "key": "cancel",
                "title": "取消流程",
                "api": "cancel"
              },
              {
                "key": "complete",
                "title": "完成流程",
                "api": "complete"
              }
            ]
          }
        }
      ]
    }
  ]
}

export type BaselineSchema = typeof baselineSchema
