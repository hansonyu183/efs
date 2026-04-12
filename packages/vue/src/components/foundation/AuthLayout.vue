<template>
  <main class="efs-auth-layout" :data-centered="props.centered ? 'true' : 'false'">
    <div class="efs-auth-layout__content" :style="{ maxWidth: props.maxWidth }">
      <header v-if="props.title || props.subtitle || $slots.header" class="efs-auth-layout__header">
        <slot name="header">
          <div class="efs-auth-layout__title">{{ props.title }}</div>
          <div v-if="props.subtitle" class="efs-auth-layout__subtitle">{{ props.subtitle }}</div>
        </slot>
      </header>

      <section v-if="$slots.alerts" class="efs-auth-layout__alerts">
        <slot name="alerts" />
      </section>

      <section class="efs-auth-layout__body">
        <slot />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'AuthLayout' })

interface AuthLayoutProps {
  title?: string
  subtitle?: string
  maxWidth?: string
  centered?: boolean
}

const props = withDefaults(defineProps<AuthLayoutProps>(), {
  title: '',
  subtitle: '',
  maxWidth: '1120px',
  centered: true,
})
</script>

<style scoped>
.efs-auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 26%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.1), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.efs-auth-layout__content {
  width: min(100%, 1120px);
}

.efs-auth-layout__header {
  margin-bottom: 20px;
}

.efs-auth-layout[data-centered='true'] .efs-auth-layout__header {
  text-align: center;
}

.efs-auth-layout[data-centered='false'] .efs-auth-layout__header {
  text-align: left;
}

.efs-auth-layout__title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.efs-auth-layout__subtitle {
  margin-top: 8px;
  color: #4b5563;
}

.efs-auth-layout__alerts {
  margin-bottom: 16px;
}

.efs-auth-layout__body {
  display: block;
}

@media (max-width: 640px) {
  .efs-auth-layout {
    padding: 24px 16px;
  }

  .efs-auth-layout__title {
    font-size: 24px;
  }
}
</style>
