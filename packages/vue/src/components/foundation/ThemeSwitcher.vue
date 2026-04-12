<template>
  <div class="efs-themeswitcher">
    <button data-efs-allow-raw-button type="button">theme: {{ props.modelValue }}</button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ThemeSwitcher' })

interface ThemeSwitcherProps {
  modelValue?: boolean
}

const props = withDefaults(defineProps<ThemeSwitcherProps>(), {
  modelValue: false
})
</script>
