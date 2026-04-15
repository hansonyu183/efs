export function buildResPath(domain, res) {
    return `${domain}/${res}`;
}
export function splitResPath(path) {
    if (typeof path !== 'string')
        return null;
    const normalized = path.replace(/^\/+|\/+$/g, '');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length !== 2)
        return null;
    const [domain, res] = parts;
    if (!domain || !res)
        return null;
    return { domain, res };
}
export function isResController(value) {
    return Boolean(value
        && typeof value === 'object'
        && value.kind === 'res'
        && typeof value.domain === 'string'
        && typeof value.res === 'string');
}
export function listAllResControllers(app) {
    return app.main.domains.flatMap((domain) => [...domain.items]);
}
export function findDomainByKey(app, domainKey) {
    return app.main.domains.find((domain) => domain.domain === domainKey);
}
export function findResByPath(app, path) {
    const parsed = splitResPath(path);
    if (!parsed)
        return undefined;
    return listAllResControllers(app).find((item) => item.domain === parsed.domain && item.res === parsed.res);
}
export function flattenAppMenuNodes(app) {
    const domainNodes = app.main.domains.map((domain, index) => ({
        key: domain.domain,
        title: domain.title || domain.domain,
        icon: domain.icon || '',
        order: domain.order ?? (index + 1) * 10,
        type: 'group',
    }));
    const itemNodes = app.main.domains.flatMap((domain, domainIndex) => domain.items.map((item, itemIndex) => ({
        key: buildResPath(item.domain, item.res),
        title: item.title || item.res,
        path: `/${buildResPath(item.domain, item.res)}`,
        icon: item.icon || '',
        order: item.order ?? ((domainIndex + 1) * 100 + (itemIndex + 1) * 10),
        parentKey: domain.domain,
        type: 'item',
    })));
    return [...domainNodes, ...itemNodes];
}
