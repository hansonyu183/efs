const DEFAULT_OPERATION_ACTIONS = [
    { key: 'create', placement: 'page' },
    { key: 'update', placement: 'row' },
    { key: 'remove', placement: 'row' },
    { key: 'export', placement: 'page' },
];
const DEFAULT_RUNTIME_ACTIONS = ['filter', 'refresh'];
export function inferResourceRuntime(resource, ui) {
    const mode = inferResourceViewMode(resource, ui);
    const actions = [];
    const actionIndex = new Map();
    const operationKeys = Object.keys(resource.operations || {});
    for (const { key, placement } of DEFAULT_OPERATION_ACTIONS) {
        if (!operationKeys.includes(key)) {
            continue;
        }
        actionIndex.set(key, actions.length);
        actions.push({
            key,
            kind: 'operation',
            placement,
            hidden: false,
            api: key,
        });
    }
    for (const runtimeKey of DEFAULT_RUNTIME_ACTIONS) {
        if (runtimeKey === 'filter' && !resource.operations?.query) {
            continue;
        }
        actionIndex.set(runtimeKey, actions.length);
        actions.push({
            key: runtimeKey,
            kind: 'runtime',
            placement: 'page',
            hidden: false,
            runtime: runtimeKey,
        });
    }
    for (const [key, override] of Object.entries(ui?.actions || {})) {
        const index = actionIndex.get(key);
        if (index == null) {
            const inferred = createActionFromOverride(key, override);
            if (inferred) {
                actionIndex.set(key, actions.length);
                actions.push(inferred);
            }
            continue;
        }
        const current = actions[index];
        actions[index] = {
            ...current,
            hidden: override.hidden ?? current.hidden,
            label: override.label ?? current.label,
            placement: override.placement ?? current.placement,
            api: override.api ?? current.api,
            runtime: override.runtime ?? current.runtime,
            kind: override.api ? 'operation' : override.runtime ? 'runtime' : current.kind,
        };
    }
    return { mode, actions };
}
function inferResourceViewMode(resource, ui) {
    if (ui?.view?.mode) {
        return ui.view.mode;
    }
    if (resource.operations?.create || resource.operations?.update || resource.operations?.remove) {
        return 'crud';
    }
    if (resource.operations?.query) {
        return 'report';
    }
    return 'custom';
}
function createActionFromOverride(key, override) {
    if (override.api) {
        return {
            key,
            kind: 'operation',
            placement: override.placement ?? inferPlacementFromOperation(override.api),
            hidden: override.hidden ?? false,
            label: override.label,
            api: override.api,
        };
    }
    if (override.runtime) {
        return {
            key,
            kind: 'runtime',
            placement: override.placement ?? 'page',
            hidden: override.hidden ?? false,
            label: override.label,
            runtime: override.runtime,
        };
    }
    return null;
}
function inferPlacementFromOperation(operation) {
    const matched = DEFAULT_OPERATION_ACTIONS.find((item) => item.key === operation);
    return matched?.placement ?? 'page';
}
