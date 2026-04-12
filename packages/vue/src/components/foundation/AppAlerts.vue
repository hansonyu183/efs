<template>
  <div class="efs-appalerts">
    <ul class="efs-app-alerts__list"><li v-for="item in props.items" :key="item.id">{{ item.level }} - {{ item.message }}</li></ul>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppAlerts' })

interface AppAlertsProps {
  items?: any[]
}

const props = withDefaults(defineProps<AppAlertsProps>(), {
  items: () => []
})
</script>
