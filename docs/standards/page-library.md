# 标准页面库清单

## P0
- login
- workbench
- query-list
- paginated-list
- crud-dialog-page
- form-page
- readonly-detail

## P1
- list-detail
- master-detail
- report-page
- base-data-page
- rbac-page
- org-management
- system-config
- runtime-metadata-page

## P2
- approval-task-page
- workflow-process-page
- multi-step-wizard
- advanced-analysis-page

## 页面接入规则

1. 新页面必须声明 `pageType`。
2. 新页面必须列出使用的标准组件。
3. 如果标准库不满足，必须填写 `exceptionReason` 与 `exceptionExpiresAt`。
4. runtime page 也必须使用标准页面模式，不得自定义旁路。
5. 运行时 shorthand `list / form / detail / report` 必须在渲染前归一化为标准 pageType：`query-list / form-page / readonly-detail / report-page`。
