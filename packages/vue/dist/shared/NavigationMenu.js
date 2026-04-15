function isFiniteOrder(value) {
    return Number.isFinite(value);
}
function normalizeNode(node) {
    if (!node || typeof node !== 'object')
        return null;
    if (!node.key || typeof node.key !== 'string')
        return null;
    if (!isFiniteOrder(node.order))
        return null;
    if (node.visible === false)
        return null;
    if (node.type !== 'group' && node.type !== 'item')
        return null;
    if (node.type === 'item' && (!node.path || typeof node.path !== 'string'))
        return null;
    return {
        key: node.key,
        title: node.title || node.key,
        path: node.path || '',
        icon: node.icon || '',
        order: Number(node.order),
        parentKey: node.parentKey ?? null,
        type: node.type,
        disabled: Boolean(node.disabled),
        children: [],
    };
}
function sortByOrder(items) {
    return [...items].sort((a, b) => {
        if (a.order !== b.order)
            return a.order - b.order;
        return String(a.key).localeCompare(String(b.key), 'zh-Hans-CN-u-co-pinyin');
    });
}
export function buildSidebarMenuTree(flatNodes = []) {
    const normalized = flatNodes.map(normalizeNode).filter(Boolean);
    const byKey = new Map(normalized.map((node) => [node.key, node]));
    const roots = [];
    for (const node of normalized) {
        if (!node.parentKey) {
            roots.push(node);
            continue;
        }
        const parent = byKey.get(node.parentKey);
        if (!parent || parent.type !== 'group') {
            continue;
        }
        parent.children.push(node);
    }
    function finalize(nodes) {
        return sortByOrder(nodes)
            .map((node) => ({ ...node, children: finalize(node.children || []) }))
            .filter((node) => node.type !== 'group' || node.children.length > 0);
    }
    return finalize(roots);
}
