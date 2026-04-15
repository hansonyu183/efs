import { computed, readonly, ref } from 'vue';
const alertItems = ref([]);
function normalizeAlert(input) {
    return {
        key: input.key ?? createAlertKey(),
        tone: input.tone ?? 'info',
        title: input.title ?? '',
        message: input.message ?? '',
        closable: input.closable !== false,
    };
}
function createAlertKey() {
    return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function push(input) {
    const next = normalizeAlert(input);
    alertItems.value = [...alertItems.value.filter((item) => item.key !== next.key), next];
    return next.key;
}
function remove(key) {
    alertItems.value = alertItems.value.filter((item) => item.key !== key);
}
function clear() {
    alertItems.value = [];
}
export function useAppAlerts() {
    return {
        items: readonly(alertItems),
        hasItems: computed(() => alertItems.value.length > 0),
        push,
        remove,
        clear,
        info(input) {
            return push({ ...input, tone: 'info' });
        },
        success(input) {
            return push({ ...input, tone: 'success' });
        },
        warning(input) {
            return push({ ...input, tone: 'warning' });
        },
        danger(input) {
            return push({ ...input, tone: 'danger' });
        },
    };
}
