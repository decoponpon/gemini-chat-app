<template>
  <div class="chat-message" :class="messageClass">
    <div class="message-header">
      <div class="message-sender">
        <span class="sender-icon">{{ senderIcon }}</span>
        <span class="sender-name">{{ senderName }}</span>
      </div>
      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
    </div>

    <div class="message-content">
      <div v-if="isEditing" class="message-edit">
        <BaseInput
          v-model="editContent"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          ref="editInput"
          @keydown.enter.ctrl="saveEdit"
          @keydown.esc="cancelEdit"
        />
        <div class="edit-actions">
          <BaseButton size="small" @click="saveEdit">保存</BaseButton>
          <BaseButton size="small" :quaternary="true" @click="cancelEdit">キャンセル</BaseButton>
        </div>
      </div>

      <div v-else class="message-text" @dblclick="startEdit">
        <div v-if="shouldRenderMarkdown" v-html="renderedContent" class="markdown-content"></div>
        <div v-else class="plain-content">{{ message.content }}</div>
      </div>
    </div>

    <div class="message-actions" v-if="!isEditing">
      <BaseButton :quaternary="true" size="small" @click="startEdit" title="編集"> ✏️ </BaseButton>
      <BaseButton :quaternary="true" size="small" @click="copyMessage" title="コピー">
        📋
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import dayjs from 'dayjs'
import type { ChatMessage } from '@/types'
import { BaseInput, BaseButton } from '@/components/ui'

interface Props {
  message: ChatMessage
}

interface Emits {
  edit: [messageId: string, newContent: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// リアクティブな状態
const isEditing = ref(false)
const editContent = ref('')
const editInput = ref<InstanceType<typeof BaseInput> | null>(null)

// 計算プロパティ
const messageClass = computed(() => ({
  'message-user': props.message.type === 'user',
  'message-assistant': props.message.type === 'assistant',
}))

const senderIcon = computed(() => {
  return props.message.type === 'user' ? '👤' : '🤖'
})

const senderName = computed(() => {
  return props.message.type === 'user' ? 'あなた' : 'Gemini'
})

const shouldRenderMarkdown = computed(() => {
  // アシスタントのメッセージでマークダウン記法が含まれている場合のみレンダリング
  return props.message.type === 'assistant' && containsMarkdown(props.message.content)
})

const renderedContent = computed(() => {
  if (!shouldRenderMarkdown.value) return ''

  try {
    return marked(props.message.content, {
      breaks: true,
      gfm: true,
    })
  } catch (error) {
    console.error('マークダウンのレンダリングに失敗しました:', error)
    return props.message.content
  }
})

// マークダウン記法が含まれているかの判定
const containsMarkdown = (content: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s+/m, // ヘッダー
    /\*\*.*?\*\*/, // 太字
    /\*.*?\*/, // 斜体
    /`.*?`/, // インラインコード
    /```[\s\S]*?```/, // コードブロック
    /^\s*[-*+]\s+/m, // リスト
    /^\s*\d+\.\s+/m, // 番号付きリスト
    /\[.*?\]\(.*?\)/, // リンク
  ]

  return markdownPatterns.some((pattern) => pattern.test(content))
}

// 編集開始
const startEdit = async () => {
  if (props.message.type !== 'user') return // ユーザーメッセージのみ編集可能

  isEditing.value = true
  editContent.value = props.message.content

  await nextTick()
  editInput.value?.focus?.()
}

// 編集保存
const saveEdit = () => {
  if (!editContent.value.trim()) {
    cancelEdit()
    return
  }

  emit('edit', props.message.id, editContent.value.trim())
  isEditing.value = false
  editContent.value = ''
}

// 編集キャンセル
const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

// メッセージのコピー
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // TODO: コピー完了のトースト表示
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error)
  }
}

// 時刻のフォーマット
const formatTime = (timestamp: Date) => {
  return dayjs(timestamp).format('HH:mm')
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-background-soft);
  transition: background-color 0.2s;
}

.chat-message:hover {
  background-color: var(--color-background-hover);
}

.message-user {
  background-color: var(--color-primary-light);
  margin-left: 48px;
}

.message-assistant {
  background-color: var(--color-background-mute);
  margin-right: 48px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-sender {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-icon {
  font-size: 16px;
}

.sender-name {
  font-weight: 600;
  color: var(--color-heading);
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: var(--color-text-2);
}

.message-content {
  margin-bottom: 8px;
}

.message-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.message-text {
  cursor: pointer;
  user-select: text;
}

.plain-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: var(--color-text);
}

.markdown-content {
  line-height: 1.6;
  color: var(--color-text);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: var(--color-heading);
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 24px;
}
.markdown-content :deep(h2) {
  font-size: 20px;
}
.markdown-content :deep(h3) {
  font-size: 18px;
}
.markdown-content :deep(h4) {
  font-size: 16px;
}
.markdown-content :deep(h5) {
  font-size: 14px;
}
.markdown-content :deep(h6) {
  font-size: 12px;
}

.markdown-content :deep(p) {
  margin: 8px 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(code) {
  background-color: var(--color-background-mute);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: var(--color-background-mute);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 16px;
  margin: 8px 0;
  color: var(--color-text-2);
}

.markdown-content :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.message-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-message:hover .message-actions {
  opacity: 1;
}

.message-actions .n-button {
  font-size: 12px;
  padding: 4px 8px;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .message-user {
    background-color: var(--color-primary-dark);
  }
}
</style>
