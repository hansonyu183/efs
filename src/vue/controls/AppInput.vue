<template>
 <label class="efs-appinput" :class="{ 'is-disabled': props.disabled, 'is-invalid': props.invalid }">
  <span v-if="$slots.leading" class="efs-appinput__affix efs-appinput__affix--leading">
   <slot name="leading" />
  </span>
  <input
   :value="props.modelValue"
   class="efs-appinput__control"
   :placeholder="props.placeholder"
   :type="props.type"
   :autocomplete="props.autocomplete"
   :disabled="props.disabled"
   :readonly="props.readonly"
   @input="onInput"
  />
  <span v-if="$slots.trailing" class="efs-appinput__affix efs-appinput__affix--trailing">
   <slot name="trailing" />
  </span>
 </label>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppInput' })

interface AppInputProps {
 modelValue?: string
 placeholder?: string
 type?: string
 autocomplete?: string
 disabled?: boolean
 readonly?: boolean
 invalid?: boolean
}

const props = withDefaults(defineProps<AppInputProps>(), {
 modelValue: '',
 placeholder: '',
 type: 'text',
 autocomplete: '',
 disabled: false,
 readonly: false,
 invalid: false,
})

const emit = defineEmits<{
 (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
 emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.efs-appinput {
 display: flex;
 align-items: center;
 gap: 10px;
 width: 100%;
 min-height: 44px;
 padding: 0 12px;
 box-sizing: border-box;
 border-radius: 12px;
 border: 1px solid var(--efs-border, #dbe3ef);
 background: var(--efs-surface, #fff);
 color: var(--efs-text, #172033);
}

.efs-appinput.is-disabled {
 opacity: 0.65;
}

.efs-appinput.is-invalid {
 border-color: var(--efs-danger, #dc2626);
}

.efs-appinput__control {
 flex: 1;
 min-width: 0;
 min-height: 42px;
 border: 0;
 outline: 0;
 background: transparent;
 color: inherit;
 font-size: 16px;
 line-height: 1.5;
}

.efs-appinput__affix {
 display: inline-flex;
 align-items: center;
 color: var(--efs-text-muted, #64748b);
}
</style>
