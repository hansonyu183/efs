# Foundation Controls Standard

EFS 不只是沉淀Page，也必须沉淀布局和表单入口层的基础控件。

当前纳入 EFS 基础控件层的 P0 组件：

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppField`
- `AppPanel`

## 定位

这层组件用于承载：

1. 登录/认证页
2. 布局工具栏
3. 查询栏与轻表单
4. 弹窗内基础录入
5. 卡片/面板容器

它们不是业务语义组件，而是企业项目最常复用的基础交互与容器。

## 统一要求

1. 业务项目优先复用 EFS 基础控件，不再长期维护第二套通用按钮/输入/选择/字段/卡片。
2. 基础控件必须为 theme / i18n / permission / org-context 留出扩展位，但不把业务逻辑写进控件本身。
3. 组件增强优先沉淀进 EFS，再由业务项目回收使用。
4. 如果业务项目无法使用 EFS 基础控件，必须明确说明缺失能力，而不是直接另起一套。

## 当前约定

### `AppButton`
- 用途：统一动作按钮
- 最低能力：variant / size / loading / block / leading slot / trailing slot
- 默认用于登录提交、工具栏动作、弹窗确认/取消、列表操作按钮

### `AppInput`
- 用途：统一单行文本录入
- 最低能力：disabled / readonly / invalid / leading slot / trailing slot
- 默认用于登录、搜索、简单表单录入

### `AppSelect`
- 用途：统一下拉选择
- 最低能力：placeholder / disabled / optionLabelKey / optionValueKey / optionDisabledKey
- 默认用于组织切换、主题切换、语言切换、查询条件、基础枚举录入

### `AppField`
- 用途：统一字段标签、提示、错误反馈包装
- 最低能力：label / hint / error / required
- 默认作为 Input / Select / Textarea / 自定义控件的最外层字段包装

### `AppPanel`
- 用途：统一卡片/面板容器
- 最低能力：title / subtitle / padded / borderless / actions slot
- 默认用于登录卡片、仪表盘卡片、局部功能面板

## 不属于本层的内容

以下内容暂不直接纳入基础控件层：

- 强业务语义表单项
- 业务专用步骤条
- 复杂富文本、图表、文件上传
- 审批流专用控件

这些内容要么进入更高层 shell / runtime，要么先经过二次抽象后再进入标准库。
