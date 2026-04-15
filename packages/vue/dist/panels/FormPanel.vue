<template>
 <section class="efs-formshell">
  <header v-if="props.title || props.subtitle || $slots.actions" class="efs-formshell__header">
   <div class="efs-formshell__heading">
    <h3 v-if="props.title" class="efs-formshell__title">{{ props.title }}</h3>
    <p v-if="props.subtitle" class="efs-formshell__subtitle">{{ props.subtitle }}</p>
   </div>
   <div v-if="$slots.actions" class="efs-formshell__actions">
    <slot name="actions" />
   </div>
  </header>

  <div v-if="$slots.summary || props.summary || normalizedSections.length > 0" class="efs-formshell__summary">
   <slot name="summary">
    <span v-if="props.summary">{{ props.summary }}</span>
    <span v-else>{{ props.sectionsLabel }} {{ normalizedSections.length }}</span>
   </slot>
  </div>

  <div class="efs-formshell__body">
   <slot v-if="$slots.default" />
   <div v-else-if="normalizedSections.length > 0" class="efs-formshell__sections">
    <article v-for="section in normalizedSections" :key="section.key" class="efs-formshell__section">
     <header class="efs-formshell__section-header">
      <strong class="efs-formshell__section-title">{{ section.title }}</strong>
      <span v-if="section.description" class="efs-formshell__section-description">{{ section.description }}</span>
     </header>
     <div class="efs-formshell__section-body">
      <slot :name="`section-${section.key}`" :section="section">
       <div class="efs-formshell__field-list">
        <div v-for="field in section.fields" :key="field.key" class="efs-formshell__field-item">
         <span class="efs-formshell__field-label">{{ field.label ?? field.key }}</span>
         <span class="efs-formshell__field-meta">{{ field.widget ?? 'text' }}</span>
        </div>
       </div>
      </slot>
     </div>
    </article>
   </div>
   <div v-else class="efs-formshell__empty">{{ props.emptyText }}</div>
  </div>

  <footer v-if="$slots.footer || resolvedFooter.showActions" class="efs-formshell__footer">
   <slot name="footer">
    <div class="efs-formshell__footer-meta">
     <span v-if="props.requiredHint">{{ props.requiredHint }}</span>
     <span v-if="props.dirty" class="efs-formshell__dirty">{{ resolvedFooter.dirtyLabel }}</span>
    </div>
    <div class="efs-formshell__footer-actions">
     <button
      v-if="resolvedFooter.showActions"
      type="button"
      class="efs-formshell__button"
      :disabled="props.busy"
      @click="emit('cancel')"
     >
      {{ resolvedFooter.cancelLabel }}
     </button>
     <button
      v-if="resolvedFooter.showActions"
      type="button"
      class="efs-formshell__button efs-formshell__button--primary"
      :disabled="props.busy"
      @click="emit('submit')"
     >
      {{ props.busy ? resolvedFooter.savingLabel : resolvedFooter.submitLabel }}
     </button>
    </div>
   </slot>
  </footer>
 </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveLabel, resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'FormPanel' })

type FormFieldDescriptor = {
 key: string
 widget?: string
}

type FormSection = {
 key: string
 fields?: FormFieldDescriptor[]
}

type FormPanelFooter = {
 showActions?: boolean
 dirtyLabel?: string
 submitLabel?: string
 savingLabel?: string
 cancelLabel?: string
}

interface FormPanelProps {
 title?: string
 subtitle?: string
 sections?: FormSection[]
 sectionsLabel?: string
 summary?: string
 emptyText?: string
 requiredHint?: string
 dirty?: boolean
 busy?: boolean
 footer?: FormPanelFooter
}

const props = withDefaults(defineProps<FormPanelProps>(), {
 title: '',
 subtitle: '',
 sections: () => [],
 sectionsLabel: '分组数：',
 summary: '',
 emptyText: '未配置表单分组。',
 requiredHint: '* 必填字段',
 dirty: false,
 busy: false,
 footer: () => ({
  showActions: true,
  dirtyLabel: '存在未保存修改',
  submitLabel: '保存',
  savingLabel: '保存中...',
  cancelLabel: '取消',
 }),
})

const emit = defineEmits<{
 (e: 'submit'): void
 (e: 'cancel'): void
}>()

const instance = getCurrentInstance()
const resolvedFooter = computed(() => ({
 showActions: props.footer?.showActions ?? true,
 dirtyLabel: props.footer?.dirtyLabel ?? '存在未保存修改',
 submitLabel: props.footer?.submitLabel ?? '保存',
 savingLabel: props.footer?.savingLabel ?? '保存中...',
 cancelLabel: props.footer?.cancelLabel ?? '取消',
}))

const normalizedSections = computed(() => props.sections.map((section) => ({
 key: section.key,
 title: resolveLabel({
  key: section.key,
  instance,
  namespaces: ['resourceCrud.formSections', 'formSections', 'sections'],
 }),
 description: resolveOptionalLabel({
  key: section.key,
  instance,
  namespaces: ['resourceCrud.formSectionDescriptions', 'formSectionDescriptions', 'descriptions'],
 }),
 fields: (section.fields ?? []).map((field) => ({
  key: field.key,
  label: resolveLabel({
   key: field.key,
   instance,
   namespaces: ['resourceCrud.formFields', 'formFields', 'fields'],
  }),
  widget: field.widget,
 })),
})))
</script>

<style scoped>
.efs-formshell {
 padding: 20px;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
 display: grid;
 gap: 16px;
}

.efs-formshell__header,
.efs-formshell__footer {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-formshell__heading {
 min-width: 0;
}

.efs-formshell__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-formshell__subtitle,
.efs-formshell__summary,
.efs-formshell__footer-meta,
.efs-formshell__section-description,
.efs-formshell__field-meta,
.efs-formshell__empty {
 color: var(--efs-text-muted, #64748b);
}

.efs-formshell__subtitle {
 margin: 6px 0 0;
}

.efs-formshell__body,
.efs-formshell__sections {
 display: grid;
 gap: 16px;
}

.efs-formshell__section {
 border: 1px solid var(--efs-border, #dbe3ef);
 border-radius: 16px;
 background: var(--efs-surface-soft, #f8fafc);
 padding: 16px;
 display: grid;
 gap: 12px;
}

.efs-formshell__section-header,
.efs-formshell__field-list,
.efs-formshell__footer-actions {
 display: grid;
 gap: 8px;
}

.efs-formshell__field-item {
 display: flex;
 justify-content: space-between;
 gap: 12px;
 flex-wrap: wrap;
 padding: 10px 12px;
 border-radius: 12px;
 background: var(--efs-surface, #fff);
}

.efs-formshell__field-label,
.efs-formshell__section-title {
 font-weight: 600;
}

.efs-formshell__footer-meta,
.efs-formshell__footer-actions,
.efs-formshell__actions {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-formshell__dirty {
 color: var(--efs-warning, #d97706);
}

.efs-formshell__button {
 min-height: 40px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 padding: 0 14px;
 cursor: pointer;
}

.efs-formshell__button--primary {
 background: var(--efs-primary, #2563eb);
 border-color: var(--efs-primary, #2563eb);
 color: #fff;
}

@media (max-width: 640px) {
 .efs-formshell__footer {
  flex-direction: column;
  align-items: stretch;
 }

 .efs-formshell__footer-actions {
  width: 100%;
  justify-content: stretch;
 }

 .efs-formshell__button {
  flex: 1;
 }
}
</style>
