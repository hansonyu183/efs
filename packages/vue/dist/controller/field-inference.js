export function inferFieldUses(field) {
    if (field.use?.length)
        return [...field.use];
    if (field.identity === 'primary')
        return ['detail'];
    if (field.identity === 'title')
        return ['query', 'list', 'form', 'detail'];
    if (field.identity === 'code')
        return ['query', 'list', 'detail'];
    if (field.kind === 'enum' || field.kind === 'ref')
        return ['query', 'list', 'form', 'detail'];
    if (field.kind === 'datetime')
        return ['list', 'detail'];
    if (field.kind === 'date')
        return ['query', 'list', 'detail'];
    return ['list', 'form', 'detail'];
}
export function inferFieldOrder(field) {
    if (typeof field.order === 'number')
        return field.order;
    if (field.identity === 'primary')
        return 10;
    if (field.identity === 'title')
        return 20;
    if (field.identity === 'code')
        return 30;
    if (isStatusLikeKey(field.key))
        return 40;
    if (isDateLikeKind(field.kind))
        return 90;
    return 60;
}
export function inferListColumns(res) {
    return getOrderedFields(res)
        .filter((field) => inferFieldUses(field).includes('list'))
        .map((field) => ({
        key: field.key,
        render: inferColumnRenderer(field),
        visible: true,
    }));
}
export function inferQueryFields(res) {
    return getOrderedFields(res)
        .filter((field) => inferFieldUses(field).includes('query'))
        .map((field) => ({
        key: field.key,
        type: inferQueryFieldType(field),
        options: toQueryOptions(field),
    }));
}
export function inferFormFields(res) {
    return getOrderedFields(res)
        .filter((field) => !field.readonly && inferFieldUses(field).includes('form'))
        .map((field) => ({
        key: field.key,
        widget: inferFormWidget(field),
    }));
}
export function inferFormSections(res) {
    const fields = inferFormFields(res);
    if (fields.length === 0)
        return [];
    return [{ key: 'basic', fields }];
}
export function inferDetailFields(res) {
    return getOrderedFields(res)
        .filter((field) => inferFieldUses(field).includes('detail'))
        .map((field) => ({ key: field.key }));
}
export function inferReportColumns(res) {
    return getOrderedFields(res)
        .filter((field) => inferFieldUses(field).includes('list'))
        .map((field) => ({
        key: field.key,
        render: inferColumnRenderer(field),
        visible: true,
    }));
}
export function inferReportSummaryMetrics(res, items = []) {
    const summaryFields = getOrderedFields(res).filter((field) => field.summary);
    return summaryFields.map((field) => ({
        key: field.key,
        value: resolveSummaryMetricValue(field.key, items),
    }));
}
function getOrderedFields(res) {
    return [...(res.fields ?? [])].sort((left, right) => {
        const orderDelta = inferFieldOrder(left) - inferFieldOrder(right);
        if (orderDelta !== 0)
            return orderDelta;
        return left.key.localeCompare(right.key, 'zh-Hans-CN-u-co-pinyin');
    });
}
function inferColumnRenderer(field) {
    if (field.render)
        return field.render;
    if (field.kind === 'tags')
        return 'tags';
    if (field.kind === 'enum' && isStatusLikeKey(field.key))
        return 'status';
    if (isStatusLikeKey(field.key))
        return 'status';
    return 'text';
}
function inferQueryFieldType(field) {
    if (field.queryType)
        return field.queryType;
    if (field.kind === 'enum' || field.kind === 'ref')
        return 'select';
    if (field.kind === 'date' || field.kind === 'datetime')
        return 'date';
    if (field.kind === 'number')
        return 'number';
    if (isSearchLikeKey(field.key))
        return 'search';
    return 'text';
}
function inferFormWidget(field) {
    if (field.widget)
        return field.widget;
    if (field.kind === 'enum' || field.kind === 'ref')
        return 'select';
    if (field.kind === 'bool')
        return 'switch';
    if (field.kind === 'number')
        return 'number';
    if (field.kind === 'date' || field.kind === 'datetime')
        return 'date';
    if (field.kind === 'tags')
        return 'tags';
    if (field.kind === 'json')
        return 'json';
    return 'text';
}
function toQueryOptions(field) {
    if ('options' in field && Array.isArray(field.options)) {
        return field.options.map((option) => ({
            key: option.key,
            value: option.value,
            disabled: option.disabled,
        }));
    }
    return undefined;
}
function isStatusLikeKey(key) {
    return ['status', 'state', 'tier'].some((token) => key.toLowerCase().includes(token.toLowerCase()));
}
function isSearchLikeKey(key) {
    return ['name', 'title', 'code'].some((token) => key.toLowerCase().includes(token.toLowerCase()));
}
function isDateLikeKind(kind) {
    return kind === 'date' || kind === 'datetime';
}
export function defaultDetailValueFormatter(value) {
    if (Array.isArray(value))
        return value.join('，') || '-';
    if (value === undefined || value === null || value === '')
        return '-';
    return value;
}
function resolveSummaryMetricValue(key, items) {
    if (items.length === 0)
        return 0;
    const lowerKey = key.toLowerCase();
    if (['count', 'total', 'totalcount'].includes(lowerKey))
        return items.length;
    const values = items.map((item) => item[key]);
    if (values.every((value) => typeof value === 'number')) {
        return values.reduce((sum, value) => sum + value, 0);
    }
    const truthyCount = values.filter((value) => Boolean(value)).length;
    return truthyCount;
}
