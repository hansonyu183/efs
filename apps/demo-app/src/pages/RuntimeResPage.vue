<template>
 <EfsApp :app="demoApp" />
</template>

<script setup lang="ts">
import EfsApp from '../../../../packages/vue/src/components/pages/EfsApp.vue'
import { demoApp } from '../runtime/demo-app'
</script>
