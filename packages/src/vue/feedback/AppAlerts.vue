<template>
 <div v-if="props.items.length > 0" class="efs-appalerts" :class="{ 'efs-appalerts--stacked': props.stacked }" role="status" aria-live="polite">
  <article
   v-for="item in props.items"
   :key="item.key"
   class="efs-appalerts__item"
   :class="`efs-appalerts__item--${item.tone ?? 'info'}`"
  >
   <div class="efs-appalerts__content">
    <strong v-if="item.title" class="efs-appalerts__title">{{ item.title }}</strong>
    <span v-if="item.message" class="efs-appalerts__message">{{ item.message }}</span>
   </div>
   <button
    v-if="item.closable !== false"
    type="button"
    class="efs-appalerts__close"
    aria-label="关闭提示"
    title="关闭提示"
    @click="emit('close', item.key)"
   >
    ×
   </button>
  </article>
 </div>
</template>

<script setup lang="ts">
import type { AppAlertItem } from '../../model/app/alerts'

defineOptions({ name: 'AppAlerts' })

interface AppAlertsProps {
 items?: AppAlertItem[]
 stacked?: boolean
}

const props = withDefaults(defineProps<AppAlertsProps>(), {
 items: () => [],
 stacked: true,
})

const emit = defineEmits<{
 (e: 'close', key: string): void
}>()
</script>

<style scoped>
.efs-appalerts {
 display: grid;
 gap: 10px;
}

.efs-appalerts__item {
 display: flex;
 align-items: start;
 justify-content: space-between;
 gap: 12px;
 padding: 12px 14px;
 border-radius: 14px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.efs-appalerts__item--info {
 border-color: color-mix(in srgb, var(--efs-primary, #2563eb) 24%, var(--efs-border, #dbe3ef));
 background: color-mix(in srgb, var(--efs-primary, #2563eb) 7%, var(--efs-surface, #fff));
}

.efs-appalerts__item--success {
 border-color: rgba(22, 163, 74, 0.24);
 background: rgba(22, 163, 74, 0.08);
}

.efs-appalerts__item--warning {
 border-color: rgba(217, 119, 6, 0.26);
 background: rgba(217, 119, 6, 0.08);
}

.efs-appalerts__item--danger {
 border-color: rgba(220, 38, 38, 0.24);
 background: rgba(220, 38, 38, 0.08);
}

.efs-appalerts__content {
 min-width: 0;
 display: grid;
 gap: 4px;
}

.efs-appalerts__title {
 font-size: 0.92rem;
}

.efs-appalerts__message {
 color: var(--efs-text-muted, #64748b);
 font-size: 0.88rem;
 line-height: 1.45;
 word-break: break-word;
}

.efs-appalerts__close {
 min-width: 32px;
 height: 32px;
 border-radius: 999px;
 border: 0;
 background: transparent;
 color: inherit;
 cursor: pointer;
}

.efs-appalerts__close:hover {
 background: rgba(15, 23, 42, 0.06);
}
</style>
