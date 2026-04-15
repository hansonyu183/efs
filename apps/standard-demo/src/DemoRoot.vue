<template>
  <EfsApp
    :app="app"
    title="EFS 标准演示"
    brand-title="Enterprise Frontend Standard"
    brand-subtitle="最小 EfsApp 运行时演示与构建冒烟校验"
  />
</template>

<script setup lang="ts">
import { EfsApp } from '@efs/vue'
import { app } from './demo-app'
</script>
