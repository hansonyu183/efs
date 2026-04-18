<template>
 <VDialog :model-value="props.modelValue" :max-width="dialogWidth" @click:outside="handleBackdropClose" @update:model-value="(value) => !value && emitClose()">
  <AppPanel class="efs-cruddialogshell__dialog" :title="props.title" :subtitle="props.subtitle">
   <template #actions>
    <slot name="header-actions" />
    <AppButton
     v-if="props.showClose"
     variant="ghost"
     size="sm"
     :aria-label="resolvedCloseLabel"
     :title="resolvedCloseLabel"
     @click="emitClose"
    >
     <template #leading>×</template>
    </AppButton>
   </template>

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
      <AppButton
       v-if="resolvedFooter.showActions"
       :disabled="props.busy"
       @click="emitCancel"
      >
       {{ resolvedFooter.cancelLabel }}
      </AppButton>
      <AppButton
       v-if="resolvedFooter.showActions"
       variant="primary"
       :disabled="props.busy"
       :loading="props.busy"
       @click="emitSubmit"
      >
       {{ props.busy ? resolvedFooter.savingLabel : resolvedFooter.submitLabel }}
      </AppButton>
     </div>
    </slot>
   </footer>
  </AppPanel>
 </VDialog>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { VDialog } from 'vuetify/components'
import AppButton from '../controls/AppButton.vue'
import AppPanel from '../controls/AppPanel.vue'
import { resolveOptionalLabel } from '../../model/resource/label-resolver'

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
const dialogWidth = computed(() => {
 if (props.size === 'sm') return 420
 if (props.size === 'lg') return 840
 return 640
})
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
.efs-cruddialogshell__dialog {
 max-height: min(88vh, 900px);
 overflow: auto;
 display: grid;
 gap: 16px;
}

.efs-cruddialogshell__footer {
 display: flex;
 justify-content: space-between;
 align-items: start;
 gap: 12px;
 flex-wrap: wrap;
}
.efs-cruddialogshell__summary,
.efs-cruddialogshell__footer-meta {
 color: var(--efs-text-muted, #64748b);
}
.efs-cruddialogshell__footer-actions {
 display: flex;
 align-items: center;
 gap: 12px;
 flex-wrap: wrap;
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
