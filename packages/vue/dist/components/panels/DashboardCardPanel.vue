<template>
 <section class="efs-dashboardcardpanel">
  <header class="efs-dashboardcardpanel__header">
   <div>
    <p v-if="props.eyebrow" class="efs-dashboardcardpanel__eyebrow">{{ props.eyebrow }}</p>
    <h3 class="efs-dashboardcardpanel__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-dashboardcardpanel__subtitle">{{ props.subtitle }}</p>
   </div>
   <strong class="efs-dashboardcardpanel__value">{{ props.value }}</strong>
  </header>
  <div v-if="$slots.default" class="efs-dashboardcardpanel__body">
   <slot />
  </div>
 </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'DashboardCardPanel' })

interface DashboardCardPanelProps {
 title?: string
 value?: number | string
 subtitle?: string
 eyebrow?: string
}

const props = withDefaults(defineProps<DashboardCardPanelProps>(), {
 title: '',
 value: 0,
 subtitle: '',
 eyebrow: '',
})
</script>

<style scoped>
.efs-dashboardcardpanel {
 padding: 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
 display: grid;
 gap: 16px;
}

.efs-dashboardcardpanel__header {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 align-items: start;
}

.efs-dashboardcardpanel__eyebrow {
 margin: 0 0 6px;
 color: var(--efs-primary, #2563eb);
 font-size: 0.76rem;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.05em;
}

.efs-dashboardcardpanel__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-dashboardcardpanel__subtitle {
 margin: 6px 0 0;
 color: var(--efs-text-muted, #64748b);
}

.efs-dashboardcardpanel__value {
 font-size: 1.9rem;
 line-height: 1;
 white-space: nowrap;
}

.efs-dashboardcardpanel__body {
 min-width: 0;
}
</style>
