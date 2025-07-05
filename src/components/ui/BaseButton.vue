<template>
  <n-button
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :ghost="ghost"
    :circle="circle"
    :quaternary="quaternary"
    :secondary="secondary"
    :tertiary="tertiary"
    :text="text"
    :block="block"
    :strong="strong"
    @click="$emit('click', $event)"
  >
    <template #icon v-if="$slots.icon">
      <slot name="icon"></slot>
    </template>
    <slot></slot>
  </n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

interface Props {
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  size?: 'tiny' | 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  ghost?: boolean
  circle?: boolean
  quaternary?: boolean
  secondary?: boolean
  tertiary?: boolean
  text?: boolean
  block?: boolean
  strong?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
  ghost: false,
  circle: false,
  quaternary: false,
  secondary: false,
  tertiary: false,
  text: false,
  block: false,
  strong: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
