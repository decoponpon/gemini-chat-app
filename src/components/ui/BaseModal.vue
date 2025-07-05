<template>
  <n-modal
    v-model:show="modalShow"
    :mask-closable="maskClosable"
    :closable="closable"
    :auto-focus="autoFocus"
    :close-on-esc="closeOnEsc"
    :preset="preset"
    :title="title"
    :size="size"
    :style="style"
    @update:show="$emit('update:show', $event)"
    @close="$emit('close')"
    @after-enter="$emit('after-enter')"
    @after-leave="$emit('after-leave')"
  >
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal } from 'naive-ui'

interface Props {
  show?: boolean
  maskClosable?: boolean
  closable?: boolean
  autoFocus?: boolean
  closeOnEsc?: boolean
  preset?: 'dialog' | 'card'
  title?: string
  size?: 'small' | 'medium' | 'large' | 'huge'
  style?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  maskClosable: true,
  closable: true,
  autoFocus: true,
  closeOnEsc: true,
  preset: 'card',
  title: '',
  size: 'medium',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
  'after-enter': []
  'after-leave': []
}>()

const modalShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})
</script>
