<template>
  <span class="efs-apptag"><slot /></span>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppTag' })
</script>

<style scoped>
.efs-apptag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--efs-surface-soft, #f8fafc);
  border: 1px solid var(--efs-border, #dbe3ef);
  color: var(--efs-text-muted, #64748b);
}
</style>
