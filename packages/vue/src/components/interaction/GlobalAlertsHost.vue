<template>
 <AppAlerts :items="items" @close="remove" />
</template>

<script setup lang="ts">
import AppAlerts from './AppAlerts.vue'
import { useAppAlerts } from '../../shared/app-alerts'

defineOptions({ name: 'GlobalAlertsHost' })

const { items, remove } = useAppAlerts()
</script>
