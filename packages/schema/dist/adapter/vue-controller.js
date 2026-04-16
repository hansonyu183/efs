import { inferResourceRuntime } from '../inference/resource-runtime.js';
export function adaptAppSchemaToVueController(options) {
    const { schema } = options;
    return {
        kind: 'app',
        auth: {
            kind: 'auth',
            login: options.auth.login,
            logout: options.auth.logout,
            getOrgs: options.auth.getOrgs,
            getCurrentOrgCode: options.auth.getCurrentOrgCode,
            setCurrentOrgCode: options.auth.setCurrentOrgCode,
            getCurrentAccessToken: options.auth.getCurrentAccessToken,
            setCurrentAccessToken: options.auth.setCurrentAccessToken,
        },
        main: {
            kind: 'main',
            defaultPath: buildDefaultPath(schema),
            domains: schema.domains.map((domain) => ({
                kind: 'domain',
                domain: domain.key,
                title: domain.title,
                items: domain.resources.map((resource) => adaptResourceToVueController(schema, domain.key, resource, options.resources?.[`${domain.key}/${resource.key}`])),
            })),
        },
    };
}
function adaptResourceToVueController(schema, domainKey, resource, handlers) {
    const resourceUi = schema.ui?.domains?.[domainKey]?.resources?.[resource.key];
    const inferred = inferResourceRuntime(resource, resourceUi);
    const fieldDefs = adaptFields(resource, inferred.mode, resourceUi);
    return {
        kind: 'res',
        domain: domainKey,
        res: resource.key,
        title: resource.title,
        runtimeKind: inferred.mode === 'report' ? 'report' : 'crud',
        fields: fieldDefs,
        query: adaptQueryHandler(resource, handlers, inferred.mode),
        save: inferred.mode === 'crud' ? adaptSaveHandler(handlers) : undefined,
        remove: inferred.mode === 'crud' ? adaptRemoveHandler(handlers) : undefined,
        export: inferred.mode === 'report' ? adaptReportExportHandler(handlers) : undefined,
        actions: inferred.mode === 'report'
            ? buildReportActions(inferred, handlers)
            : buildCrudActions(inferred, handlers),
    };
}
function adaptQueryHandler(resource, handlers, mode) {
    const operationKey = mode === 'report' ? 'query' : resource.operations?.list ? 'list' : resource.operations?.query ? 'query' : undefined;
    if (!operationKey)
        return undefined;
    const handler = handlers?.[operationKey];
    if (!handler)
        return undefined;
    return async ({ queryValues, page, pageSize }) => {
        const result = await handler({ queryValues, page, pageSize });
        return {
            items: result?.items ?? [],
            total: result?.total,
            activeItem: result?.activeItem,
            summary: result?.summary,
        };
    };
}
function adaptSaveHandler(handlers) {
    if (!handlers?.create && !handlers?.update)
        return undefined;
    return async ({ mode, item, queryValues, page, pageSize }) => {
        const handler = mode === 'create' ? handlers?.create : handlers?.update;
        if (!handler)
            return undefined;
        return await handler({ item, queryValues, page, pageSize });
    };
}
function adaptRemoveHandler(handlers) {
    if (!handlers?.remove)
        return undefined;
    return async (item) => await handlers.remove?.({ item });
}
function adaptReportExportHandler(handlers) {
    const exportHandler = handlers?.export;
    if (!exportHandler)
        return undefined;
    return async ({ queryValues, page, pageSize, items, total, summary }) => {
        await exportHandler({ queryValues, page, pageSize, items, total, summary });
    };
}
function buildCrudActions(inferred, handlers) {
    const page = [];
    const row = [];
    const custom = {};
    for (const action of inferred.actions) {
        if (action.hidden)
            continue;
        if (action.kind === 'runtime') {
            if (action.key === 'refresh') {
                page.push({ key: action.key });
            }
            continue;
        }
        if (action.api === 'create') {
            page.push({ key: 'create' });
            continue;
        }
        if (action.api === 'update') {
            row.push({ key: 'update' });
            continue;
        }
        if (action.api === 'remove') {
            row.push({ key: 'remove' });
            continue;
        }
        if (action.api && handlers?.[action.api]) {
            if (action.placement === 'row')
                row.push({ key: action.key });
            else
                page.push({ key: action.key });
            custom[action.key] = async (payload) => {
                await handlers[action.api]?.(payload);
            };
        }
    }
    return {
        page,
        row,
        custom,
    };
}
function buildReportActions(inferred, handlers) {
    const report = [];
    const custom = {};
    for (const action of inferred.actions) {
        if (action.hidden)
            continue;
        if (action.kind === 'runtime') {
            continue;
        }
        if (action.api === 'export') {
            continue;
        }
        if (action.api && handlers?.[action.api]) {
            report.push({ key: action.key });
            custom[action.key] = async (payload) => {
                await handlers[action.api]?.(payload);
            };
        }
    }
    return {
        report,
        custom,
    };
}
function adaptFields(resource, mode, ui) {
    return (resource.fields || [])
        .filter((field) => !ui?.fields?.[field.key]?.hidden)
        .map((field) => {
        const kind = adaptFieldKind(field.type);
        const uses = inferFieldUses(field, mode);
        const base = {
            key: field.key,
            title: ui?.fields?.[field.key]?.label || field.title,
            kind,
            use: uses,
            required: field.required,
            readonly: field.readonly,
            identity: adaptIdentity(field.identity),
            queryType: inferQueryType(field.type, field.options?.length ? true : false),
            widget: inferWidget(field.type, field.options?.length ? true : false),
            render: field.type === 'enum' ? 'status' : undefined,
            summary: mode === 'report' && field.type === 'number',
        };
        if (field.type === 'enum') {
            return {
                ...base,
                kind: 'enum',
                options: field.options?.map((option) => ({ key: option.key, value: option.value, disabled: option.disabled })),
            };
        }
        if (field.type === 'ref' && field.ref) {
            return {
                ...base,
                kind: 'ref',
                ref: field.ref,
                options: field.options?.map((option) => ({ key: option.key, value: option.value, disabled: option.disabled })),
            };
        }
        return base;
    });
}
function inferFieldUses(field, mode) {
    if (mode === 'report') {
        return ['query', 'list', 'detail'];
    }
    const uses = ['list', 'detail'];
    if (supportsQueryField(field.type)) {
        uses.unshift('query');
    }
    if (!field.readonly) {
        uses.push('form');
    }
    return uses;
}
function supportsQueryField(type) {
    return type !== 'json';
}
function adaptFieldKind(type) {
    if (type === 'string')
        return 'text';
    if (type === 'boolean')
        return 'bool';
    if (type === 'enum')
        return 'enum';
    if (type === 'ref')
        return 'ref';
    if (type === 'number' || type === 'date' || type === 'datetime' || type === 'json')
        return type;
    return 'text';
}
function adaptIdentity(identity) {
    if (identity === 'id')
        return 'primary';
    if (identity === 'title' || identity === 'code')
        return identity;
    return undefined;
}
function inferQueryType(type, hasOptions) {
    if (type === 'number')
        return 'number';
    if (type === 'date' || type === 'datetime')
        return 'date';
    if (type === 'enum' || type === 'ref' || hasOptions)
        return 'select';
    return 'search';
}
function inferWidget(type, hasOptions) {
    if (type === 'number')
        return 'number';
    if (type === 'boolean')
        return 'switch';
    if (type === 'date' || type === 'datetime')
        return 'date';
    if (type === 'enum' || type === 'ref' || hasOptions)
        return 'select';
    return 'text';
}
function buildDefaultPath(schema) {
    if (schema.app.defaultDomain && schema.app.defaultRes) {
        return `${schema.app.defaultDomain}/${schema.app.defaultRes}`;
    }
    const firstDomain = schema.domains[0];
    const firstResource = firstDomain?.resources[0];
    if (!firstDomain || !firstResource)
        return '';
    return `${firstDomain.key}/${firstResource.key}`;
}
