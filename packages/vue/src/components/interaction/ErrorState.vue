<template>
 <section class="efs-errorstate">
  <div class="efs-errorstate__icon">{{ props.icon }}</div>
  <div class="efs-errorstate__body">
   <strong class="efs-errorstate__title">{{ props.title }}</strong>
   <p class="efs-errorstate__message">{{ props.message }}</p>
  </div>
  <div v-if="$slots.actions" class="efs-errorstate__actions">
   <slot name="actions" />
  </div>
 </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorState' })

interface ErrorStateProps {
 title?: string
 message?: string
 icon?: string
}

const props = withDefaults(defineProps<ErrorStateProps>(), {
 title: '加载失败',
 message: '请求未成功，请稍后重试。',
 icon: '!',
})
</script>

<style scoped>
.efs-errorstate {
 padding: 28px 20px;
 border: 1px solid rgba(220, 38, 38, 0.18);
 border-radius: 18px;
 background: rgba(254, 242, 242, 0.9);
 display: grid;
 gap: 12px;
 justify-items: start;
}

.efs-errorstate__icon {
 width: 36px;
 height: 36px;
 display: grid;
 place-items: center;
 border-radius: 999px;
 background: rgba(220, 38, 38, 0.1);
 color: #b91c1c;
 border: 1px solid rgba(220, 38, 38, 0.18);
}

.efs-errorstate__message {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-errorstate__actions {
 display: flex;
 gap: 10px;
 flex-wrap: wrap;
}
</style>
