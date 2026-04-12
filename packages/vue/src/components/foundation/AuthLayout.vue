<template>
  <main class="efs-auth-layout" :data-centered="props.centered ? 'true' : 'false'">
    <div class="efs-auth-layout__content" :style="{ maxWidth: props.maxWidth }">
      <div v-if="$slots.brand || props.logoSrc || props.appName" class="efs-auth-layout__brand">
        <slot name="brand">
          <img v-if="props.logoSrc" class="efs-auth-layout__logo" :src="props.logoSrc" :alt="props.logoAlt || props.appName" />
          <div v-else class="efs-auth-layout__wordmark">{{ props.appName }}</div>
        </slot>
      </div>

      <header v-if="props.title || props.subtitle || $slots.header" class="efs-auth-layout__header">
        <slot name="header">
          <div class="efs-auth-layout__title">{{ props.title }}</div>
          <div v-if="props.subtitle" class="efs-auth-layout__subtitle">{{ props.subtitle }}</div>
        </slot>
      </header>

      <section v-if="$slots.alerts" class="efs-auth-layout__alerts">
        <slot name="alerts" />
      </section>

      <section class="efs-auth-layout__panel">
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
  appName?: string
  logoSrc?: string
  logoAlt?: string
}

const props = withDefaults(defineProps<AuthLayoutProps>(), {
  title: '',
  subtitle: '',
  maxWidth: '1120px',
  centered: true,
  appName: '',
  logoSrc: '',
  logoAlt: '',
})
</script>

<style scoped>
.efs-auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.1), transparent 24%),
    linear-gradient(180deg, var(--efs-surface-soft, #f8fafc) 0%, color-mix(in srgb, var(--efs-surface-soft, #f8fafc) 76%, white) 100%);
}

.efs-auth-layout__content {
  width: min(100%, 1120px);
  display: grid;
  gap: 20px;
}

.efs-auth-layout__brand {
  display: flex;
  justify-content: center;
}

.efs-auth-layout__logo {
  width: min(100%, 240px);
  height: auto;
  display: block;
}

.efs-auth-layout__wordmark {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--efs-text, #172033);
}

.efs-auth-layout__header {
  margin-bottom: 4px;
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
  margin-bottom: 4px;
}

.efs-auth-layout__panel {
  min-width: 0;
}

@media (max-width: 640px) {
  .efs-auth-layout {
    padding: 20px 14px;
  }

  .efs-auth-layout__content {
    gap: 16px;
  }

  .efs-auth-layout__title {
    font-size: 24px;
  }

  .efs-auth-layout__logo {
    width: min(100%, 180px);
  }
}
</style>
