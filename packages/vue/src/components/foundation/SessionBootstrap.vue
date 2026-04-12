<template>
  <div class="efs-sessionbootstrap">
    <div>{{ props.ready ? "ready" : "bootstrapping" }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SessionBootstrap' })

interface SessionBootstrapProps {
  ready?: boolean
}

const props = withDefaults(defineProps<SessionBootstrapProps>(), {
  ready: false
})
</script>
