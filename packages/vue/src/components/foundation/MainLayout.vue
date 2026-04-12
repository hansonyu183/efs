<template>
  <div class="efs-main-layout" :data-dense="props.dense ? 'true' : 'false'">
    <aside v-if="$slots.sidebar || props.showSidebar" class="efs-main-layout__sidebar">
      <slot name="brand">
        <div class="efs-main-layout__brand">{{ props.brandTitle || props.title }}</div>
      </slot>
      <slot name="sidebar" />
    </aside>

    <div class="efs-main-layout__main">
      <header class="efs-main-layout__header">
        <div class="efs-main-layout__header-meta">
          <slot name="header-title">
            <div class="efs-main-layout__title">{{ props.title }}</div>
            <div v-if="props.subtitle || props.orgCode" class="efs-main-layout__subtitle">
              {{ props.subtitle || props.orgCode }}
            </div>
          </slot>
        </div>
        <div v-if="$slots.toolbar" class="efs-main-layout__toolbar">
          <slot name="toolbar" />
        </div>
      </header>

      <section v-if="$slots.alerts" class="efs-main-layout__alerts">
        <slot name="alerts" />
      </section>

      <main class="efs-main-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MainLayout' })

interface MainLayoutProps {
  title?: string
  subtitle?: string
  brandTitle?: string
  orgCode?: string
  showSidebar?: boolean
  dense?: boolean
}

const props = withDefaults(defineProps<MainLayoutProps>(), {
  title: '',
  subtitle: '',
  brandTitle: '',
  orgCode: '',
  showSidebar: true,
  dense: false,
})
</script>

<style scoped>
.efs-main-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  background: var(--efs-color-bg, #f5f7fb);
  color: var(--efs-color-text, #1f2937);
}

.efs-main-layout[data-dense='true'] {
  grid-template-columns: 200px minmax(0, 1fr);
}

.efs-main-layout__sidebar {
  border-right: 1px solid var(--efs-color-border, #d7deea);
  background: var(--efs-color-surface, #ffffff);
  padding: 20px 16px;
}

.efs-main-layout__brand {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.efs-main-layout__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.efs-main-layout__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--efs-color-border, #d7deea);
  background: var(--efs-color-surface, #ffffff);
}

.efs-main-layout__title {
  font-size: 18px;
  font-weight: 700;
}

.efs-main-layout__subtitle {
  font-size: 12px;
  color: var(--efs-color-text-secondary, #6b7280);
  margin-top: 4px;
}

.efs-main-layout__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.efs-main-layout__alerts {
  padding: 16px 20px 0;
}

.efs-main-layout__content {
  padding: 20px;
}

@media (max-width: 960px) {
  .efs-main-layout,
  .efs-main-layout[data-dense='true'] {
    grid-template-columns: 1fr;
  }

  .efs-main-layout__sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--efs-color-border, #d7deea);
  }

  .efs-main-layout__header {
    flex-direction: column;
    align-items: stretch;
  }

  .efs-main-layout__toolbar {
    justify-content: flex-start;
  }
}
</style>
