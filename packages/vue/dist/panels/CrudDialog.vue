<template>
 <div v-if="props.modelValue" class="efs-cruddialogshell" @click.self="handleBackdropClose">
  <section class="efs-cruddialogshell__dialog" :class="sizeClass" role="dialog" aria-modal="true">
   <header class="efs-cruddialogshell__header">
    <div>
     <h3 class="efs-cruddialogshell__title">{{ props.title }}</h3>
     <p v-if="props.subtitle" class="efs-cruddialogshell__subtitle">{{ props.subtitle }}</p>
    </div>
    <div class="efs-cruddialogshell__header-actions">
     <slot name="header-actions" />
     <button
     v-if="props.showClose"
     type="button"
     class="efs-cruddialogshell__icon-button"
     :aria-label="resolvedCloseLabel"
     :title="resolvedCloseLabel"
     @click="emitClose"
     >
      ×
     </button>
    </div>
   </header>

   <div v-if="$slots.summary || props.summary" class="efs-cruddialogshell__summary">
    <slot name="summary">
     {{ props.summary }}
    </slot>
   </div>

   <div class="efs-cruddialogshell__body">
    <slot />
   </div>

   <footer v-if="$slots.footer || resolvedFooter.showActions" class="efs-cruddialogshell__footer">
    <slot name="footer">
     <div class="efs-cruddialogshell__footer-meta">
      <span v-if="props.dirty" class="efs-cruddialogshell__dirty">{{ resolvedFooter.dirtyLabel }}</span>
     </div>
     <div class="efs-cruddialogshell__footer-actions">
      <button
       v-if="resolvedFooter.showActions"
       type="button"
       class="efs-cruddialogshell__button"
       :disabled="props.busy"
       @click="emitCancel"
      >
       {{ resolvedFooter.cancelLabel }}
      </button>
      <button
       v-if="resolvedFooter.showActions"
       type="button"
       class="efs-cruddialogshell__button efs-cruddialogshell__button--primary"
       :disabled="props.busy"
       @click="emitSubmit"
      >
       {{ props.busy ? resolvedFooter.savingLabel : resolvedFooter.submitLabel }}
      </button>
     </div>
    </slot>
   </footer>
  </section>
 </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { resolveOptionalLabel } from '../shared/label-resolver'

defineOptions({ name: 'CrudDialog' })

interface CrudDialogProps {
 modelValue?: boolean
 title?: string
 subtitle?: string
 summary?: string
 size?: 'sm' | 'md' | 'lg'
 busy?: boolean
 dirty?: boolean
 closeOnBackdrop?: boolean
 guardDirtyClose?: boolean
 showClose?: boolean
 footer?: {
  showActions?: boolean
 }
}

const props = withDefaults(defineProps<CrudDialogProps>(), {
 modelValue: false,
 title: '',
 subtitle: '',
 summary: '',
 size: 'md',
 busy: false,
 dirty: false,
 closeOnBackdrop: true,
 guardDirtyClose: false,
 showClose: true,
 footer: () => ({
  showActions: true,
 }),
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: boolean): void
 (e: 'submit'): void
 (e: 'cancel'): void
 (e: 'close'): void
 (e: 'request-close', payload: { source: 'close' | 'cancel' | 'backdrop' }): void
}>()

const instance = getCurrentInstance()
const sizeClass = computed(() => `efs-cruddialogshell__dialog--${props.size}`)
const resolvedCloseLabel = computed(() => resolveOptionalLabel({ key: 'closeLabel', instance, namespaces: ['efs.crudDialog'] }) || '关闭')
const resolvedFooter = computed(() => ({
 showActions: props.footer?.showActions ?? true,
 dirtyLabel: resolveOptionalLabel({ key: 'footer.dirtyLabel', instance, namespaces: ['efs.crudDialog'] }) || '存在未保存修改',
 submitLabel: resolveOptionalLabel({ key: 'footer.submitLabel', instance, namespaces: ['efs.crudDialog'] }) || '保存',
 savingLabel: resolveOptionalLabel({ key: 'footer.savingLabel', instance, namespaces: ['efs.crudDialog'] }) || '保存中...',
 cancelLabel: resolveOptionalLabel({ key: 'footer.cancelLabel', instance, namespaces: ['efs.crudDialog'] }) || '取消',
}))
const shouldGuardClose = computed(() => props.guardDirtyClose && props.dirty && !props.busy)

function requestClose(source: 'close' | 'cancel' | 'backdrop') {
 if (shouldGuardClose.value) {
  emit('request-close', { source })
  return true
 }
 return false
}

function emitClose() {
 if (requestClose('close')) return
 emit('update:modelValue', false)
 emit('close')
}

function emitCancel() {
 if (requestClose('cancel')) return
 emit('cancel')
 emit('update:modelValue', false)
}

function emitSubmit() {
 emit('submit')
}

function handleBackdropClose() {
 if (!props.closeOnBackdrop || props.busy) return
 if (requestClose('backdrop')) return
 emitClose()
}
</script>

<style scoped>
.efs-cruddialogshell {
 position: fixed;
 inset: 0;
 background: rgba(15, 23, 42, 0.4);
 display: grid;
 place-items: center;
 padding: 24px;
 z-index: 50;
}

.efs-cruddialogshell__dialog {
 width: min(100%, 640px);
 max-height: min(88vh, 900px);
 overflow: auto;
 border-radius: 20px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
 display: grid;
 gap: 16px;
 padding: 20px;
}

.efs-cruddialogshell__dialog--sm { width: min(100%, 420px); }
.efs-cruddialogshell__dialog--md { width: min(100%, 640px); }
.efs-cruddialogshell__dialog--lg { width: min(100%, 840px); }

.efs-cruddialogshell__header,
.efs-cruddialogshell__footer {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-cruddialogshell__title {
 margin: 0;
 font-size: 1.05rem;
}

.efs-cruddialogshell__subtitle,
.efs-cruddialogshell__summary,
.efs-cruddialogshell__footer-meta {
 color: var(--efs-text-muted, #64748b);
}

.efs-cruddialogshell__subtitle {
 margin: 6px 0 0;
}

.efs-cruddialogshell__header-actions,
.efs-cruddialogshell__footer-actions {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
}

.efs-cruddialogshell__icon-button,
.efs-cruddialogshell__button {
 min-height: 40px;
 border-radius: 10px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 padding: 0 14px;
 cursor: pointer;
}

.efs-cruddialogshell__icon-button {
 min-width: 40px;
 padding: 0;
}

.efs-cruddialogshell__button--primary {
 background: var(--efs-primary, #2563eb);
 border-color: var(--efs-primary, #2563eb);
 color: #fff;
}

.efs-cruddialogshell__dirty {
 color: var(--efs-warning, #d97706);
}

@media (max-width: 640px) {
 .efs-cruddialogshell {
  padding: 16px;
 }

 .efs-cruddialogshell__dialog {
  padding: 16px;
 }
}
</style>
