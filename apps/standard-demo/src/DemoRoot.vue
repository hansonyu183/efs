<template>
  <EfsApp
    :app="app"
    app-name="Enterprise Frontend Standard"
  />
</template>

<script setup lang="ts">
import { EfsApp } from '@efs/vue'
import { app } from './demo-app'
</script>
