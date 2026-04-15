<template>
 <AppAlerts :items="mutableItems" @close="remove" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppAlerts from './AppAlerts.vue'
import { useAppAlerts } from '../shared/app-alerts'

defineOptions({ name: 'GlobalAlertsHost' })

const { items, remove } = useAppAlerts()
const mutableItems = computed(() => [...items.value])
</script>
