<template>
  <n-input
    v-model:value="inputValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
    :autosize="autosize"
    :rows="rows"
    :maxlength="maxlength"
    :clearable="clearable"
    :show-count="showCount"
    :round="round"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @keydown="$emit('keydown', $event)"
    @keyup="$emit('keyup', $event)"
    @keypress="$emit('keypress', $event)"
  >
    <template #prefix v-if="$slots.prefix">
      <slot name="prefix"></slot>
    </template>
    <template #suffix v-if="$slots.suffix">
      <slot name="suffix"></slot>
    </template>
  </n-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NInput } from 'naive-ui'

interface Props {
  modelValue?: string
  type?: 'text' | 'password' | 'textarea'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  autosize?: boolean | { minRows?: number; maxRows?: number }
  rows?: number
  maxlength?: number
  clearable?: boolean
  showCount?: boolean
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  size: 'medium',
  autosize: false,
  rows: 3,
  clearable: false,
  showCount: false,
  round: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
  keypress: [event: KeyboardEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>
