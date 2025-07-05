<template>
  <n-slider
    v-model:value="sliderValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :marks="marks"
    :tooltip="tooltip"
    :show-tooltip="showTooltip"
    :vertical="vertical"
    @update:value="$emit('update:value', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NSlider } from 'naive-ui'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  marks?: Record<number, string>
  tooltip?: boolean
  showTooltip?: boolean
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  tooltip: true,
  showTooltip: true,
  vertical: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'update:value': [value: number]
}>()

const sliderValue = computed({
  get: () => props.modelValue,
  set: (value: number) => emit('update:modelValue', value),
})
</script>
