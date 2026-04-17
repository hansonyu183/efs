<template>
 <section class="efs-emptystate">
  <div class="efs-emptystate__icon">{{ resolvedIcon }}</div>
  <div class="efs-emptystate__body">
   <strong class="efs-emptystate__title">{{ resolvedTitle }}</strong>
   <p class="efs-emptystate__description">{{ resolvedDescription }}</p>
  </div>
  <div v-if="$slots.actions" class="efs-emptystate__actions">
   <slot name="actions" />
  </div>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

defineOptions({ name: 'EmptyState' })

interface EmptyStateProps {
 variant?: 'default' | 'resource' | 'report'
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
 variant: 'default',
})

const instance = getCurrentInstance()
const resolvedTitle = computed(() => resolveOptionalLabel({ key: `${props.variant}.title`, instance, namespaces: ['efs.state.empty'] }) || '暂无数据')
const resolvedDescription = computed(() => resolveOptionalLabel({ key: `${props.variant}.description`, instance, namespaces: ['efs.state.empty'] }) || '当前没有可展示内容。')
const resolvedIcon = computed(() => resolveOptionalLabel({ key: `${props.variant}.icon`, instance, namespaces: ['efs.state.empty'] }) || '○')
</script>

<style scoped>
.efs-emptystate {
 padding: 28px 20px;
 border: 1px dashed var(--efs-border, #dbe3ef);
 border-radius: 18px;
 background: var(--efs-surface-soft, #f8fafc);
 display: grid;
 gap: 12px;
 justify-items: start;
}

.efs-emptystate__icon {
 width: 36px;
 height: 36px;
 display: grid;
 place-items: center;
 border-radius: 999px;
 background: #fff;
 border: 1px solid var(--efs-border, #dbe3ef);
 color: var(--efs-text-muted, #64748b);
}

.efs-emptystate__title {
 display: block;
}

.efs-emptystate__description {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-emptystate__actions {
 display: flex;
 gap: 10px;
 flex-wrap: wrap;
}
</style>
