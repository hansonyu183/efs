<template>
  <div class="efs-columnsettings">
    <div>columns: {{ props.columns.length }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ColumnSettings' })

interface ColumnSettingsProps {
  columns?: any[]
}

const props = withDefaults(defineProps<ColumnSettingsProps>(), {
  columns: () => []
})
</script>
