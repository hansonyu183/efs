<template>
 <section class="efs-masterdetailshell">
  <header v-if="props.title || props.subtitle || $slots['header-actions']" class="efs-masterdetailshell__header">
   <div>
    <h3 v-if="props.title" class="efs-masterdetailshell__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-masterdetailshell__subtitle">{{ props.subtitle }}</p>
   </div>
   <div v-if="$slots['header-actions']" class="efs-masterdetailshell__header-actions">
    <slot name="header-actions" />
   </div>
  </header>

  <div class="efs-masterdetailshell__body" :style="splitStyle">
   <section class="efs-masterdetailshell__panel">
    <header class="efs-masterdetailshell__panel-header">
     <strong>{{ resolvedMasterTitle }}</strong>
     <span v-if="props.masterCountText" class="efs-masterdetailshell__panel-meta">{{ props.masterCountText }}</span>
    </header>
    <div class="efs-masterdetailshell__panel-body">
     <slot name="master" />
    </div>
   </section>

   <section class="efs-masterdetailshell__panel">
    <header class="efs-masterdetailshell__panel-header">
     <strong>{{ resolvedDetailTitle }}</strong>
     <span v-if="props.detailStatusText" class="efs-masterdetailshell__panel-meta">{{ props.detailStatusText }}</span>
    </header>
    <div class="efs-masterdetailshell__panel-body">
     <slot v-if="$slots.detail" name="detail" />
     <div v-else class="efs-masterdetailshell__empty-state">
      <strong>{{ resolvedDetailEmptyTitle }}</strong>
      <p>{{ resolvedDetailEmptyDescription }}</p>
     </div>
    </div>
   </section>
  </div>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

defineOptions({ name: 'MasterDetailPanel' })

interface MasterDetailPanelProps {
 title?: string
 subtitle?: string
 splitRatio?: string
 masterCountText?: string
 detailStatusText?: string
}

const props = withDefaults(defineProps<MasterDetailPanelProps>(), {
 title: '',
 subtitle: '',
 splitRatio: '40/60',
 masterCountText: '',
 detailStatusText: '',
})

const instance = getCurrentInstance()
const resolvedMasterTitle = computed(() => resolveOptionalLabel({ key: 'masterTitle', instance, namespaces: ['efs.masterDetail'] }) || '主列表')
const resolvedDetailTitle = computed(() => resolveOptionalLabel({ key: 'detailTitle', instance, namespaces: ['efs.masterDetail'] }) || '详情')
const resolvedDetailEmptyTitle = computed(() => resolveOptionalLabel({ key: 'detailEmptyTitle', instance, namespaces: ['efs.masterDetail'] }) || '请选择一条记录')
const resolvedDetailEmptyDescription = computed(() => resolveOptionalLabel({ key: 'detailEmptyDescription', instance, namespaces: ['efs.masterDetail'] }) || '选中主列表记录后展示详情内容。')

const splitStyle = computed(() => {
 const [leftRaw, rightRaw] = props.splitRatio.split('/')
 const left = Number(leftRaw) || 40
 const right = Number(rightRaw) || 60
 const total = left + right || 100
 return {
  '--efs-master-col-left': `${(left / total) * 100}%`,
  '--efs-master-col-right': `${(right / total) * 100}%`,
 }
})
</script>

<style scoped>
.efs-masterdetailshell {
 padding: 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-masterdetailshell__header,
.efs-masterdetailshell__panel-header {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-masterdetailshell__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-masterdetailshell__subtitle,
.efs-masterdetailshell__panel-meta,
.efs-masterdetailshell__empty-state {
 color: var(--efs-text-muted, #64748b);
}

.efs-masterdetailshell__subtitle {
 margin: 6px 0 0;
}

.efs-masterdetailshell__body {
 display: grid;
 grid-template-columns: minmax(280px, var(--efs-master-col-left, 40%)) minmax(0, var(--efs-master-col-right, 60%));
 gap: 16px;
}

.efs-masterdetailshell__panel {
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 16px;
 background: var(--efs-surface-soft, #f8fafc);
 padding: 16px;
 display: grid;
 gap: 12px;
 min-width: 0;
}

.efs-masterdetailshell__panel-body {
 min-width: 0;
}

.efs-masterdetailshell__empty-state {
 display: grid;
 gap: 8px;
 min-height: 180px;
 place-content: center;
 text-align: center;
}

.efs-masterdetailshell__empty-state p {
 margin: 0;
}

@media (max-width: 960px) {
 .efs-masterdetailshell__body {
  grid-template-columns: 1fr;
 }
}
</style>
