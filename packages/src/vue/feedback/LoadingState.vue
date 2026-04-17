<template>
 <section class="efs-loadingstate">
  <div class="efs-loadingstate__spinner" aria-hidden="true"></div>
  <div class="efs-loadingstate__body">
   <strong class="efs-loadingstate__title">{{ resolvedTitle }}</strong>
   <p class="efs-loadingstate__message">{{ resolvedMessage }}</p>
  </div>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

defineOptions({ name: 'LoadingState' })

interface LoadingStateProps {
 variant?: 'default' | 'resource' | 'report'
}

const props = withDefaults(defineProps<LoadingStateProps>(), {
 variant: 'default',
})

const instance = getCurrentInstance()
const resolvedTitle = computed(() => resolveOptionalLabel({ key: `${props.variant}.title`, instance, namespaces: ['efs.state.loading'] }) || '正在加载数据')
const resolvedMessage = computed(() => resolveOptionalLabel({ key: `${props.variant}.message`, instance, namespaces: ['efs.state.loading'] }) || '请稍候，系统正在准备当前资源内容。')
</script>

<style scoped>
.efs-loadingstate {
 padding: 28px 20px;
 border: 1px dashed var(--efs-border, #dbe3ef);
 border-radius: 18px;
 background: var(--efs-surface-soft, #f8fafc);
 display: grid;
 gap: 12px;
 justify-items: start;
}

.efs-loadingstate__spinner {
 width: 32px;
 height: 32px;
 border-radius: 999px;
 border: 3px solid rgba(37, 99, 235, 0.14);
 border-top-color: var(--efs-primary, #2563eb);
 animation: efs-loadingstate-spin 0.9s linear infinite;
}

.efs-loadingstate__message {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

@keyframes efs-loadingstate-spin {
 to { transform: rotate(360deg); }
}
</style>
