<template>
  <div class="efs-localeswitcher">
    <button data-efs-allow-raw-button type="button">locale: {{ props.modelValue }}</button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LocaleSwitcher' })

interface LocaleSwitcherProps {
  modelValue?: boolean
}

const props = withDefaults(defineProps<LocaleSwitcherProps>(), {
  modelValue: false
})
</script>
