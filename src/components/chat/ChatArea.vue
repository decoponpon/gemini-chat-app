<template>
  <div class="chat-area">
    <!-- チャット履歴 -->
    <div class="chat-history" ref="chatHistory">
      <div v-if="currentMessages.length === 0" class="empty-chat">
        <div class="empty-message">
          <h2>新しいチャットを開始</h2>
          <p>メッセージを入力してGeminiと会話を始めましょう</p>
        </div>
      </div>
      <div v-else class="messages">
        <ChatMessage
          v-for="message in currentMessages"
          :key="message.id"
          :message="message"
          @edit="editMessage"
        />
      </div>

      <!-- 生成中表示 -->
      <div v-if="isGenerating" class="generating-message">
        <div class="message assistant">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>生成中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 入力エリア -->
    <div class="chat-input-area">
      <div class="input-container">
        <BaseInput
          v-model="currentInput"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 8 }"
          placeholder="メッセージを入力してください..."
          :disabled="isGenerating"
          @keydown="handleKeyDown"
          class="chat-input"
        />
        <BaseButton
          type="primary"
          :disabled="!canSend"
          :loading="isGenerating"
          @click="sendMessage"
          class="send-button"
        >
          送信
        </BaseButton>
      </div>
      <div class="input-actions">
        <BaseButton
          :quaternary="true"
          size="small"
          @click="clearMessages"
          :disabled="currentMessages.length === 0"
        >
          履歴クリア
        </BaseButton>
        <BaseButton
          :quaternary="true"
          size="small"
          @click="exportHistory"
          :disabled="currentMessages.length === 0"
        >
          履歴保存
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useSettingsStore } from '@/stores/settings'
import { BaseInput, BaseButton } from '@/components/ui'
import ChatMessage from './ChatMessage.vue'
import { geminiService } from '@/services/geminiService'
import { exportChatHistory } from '@/utils/export'

// ストア
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const { currentInput, isGenerating, currentMessages, hasCurrentSession } = storeToRefs(chatStore)
const { settings } = storeToRefs(settingsStore)

// リアクティブな状態
const chatHistory = ref<HTMLElement | null>(null)

// 送信可能かどうかの判定
const canSend = computed(() => {
  return currentInput.value.trim().length > 0 && !isGenerating.value && hasCurrentSession.value
})

// メッセージ送信
const sendMessage = async () => {
  if (!canSend.value) return

  const message = currentInput.value.trim()
  currentInput.value = ''

  try {
    // セッションがない場合は新しいセッションを作成
    if (!hasCurrentSession.value) {
      await chatStore.createNewSession()
    }

    // ユーザーメッセージを追加
    chatStore.addMessage({
      type: 'user',
      content: message,
    })

    // セッションを保存
    await chatStore.saveCurrentSession()

    // チャット履歴を最下部にスクロール
    await scrollToBottom()

    // AI応答を生成
    isGenerating.value = true

    try {
      const response = await geminiService.generateResponse(message, settings.value)

      // アシスタントメッセージを追加
      chatStore.addMessage({
        type: 'assistant',
        content: response,
      })

      // セッションを保存
      await chatStore.saveCurrentSession()

      // チャット履歴を最下部にスクロール
      await scrollToBottom()
    } catch (error) {
      console.error('AI応答の生成に失敗しました:', error)

      // エラーメッセージを追加
      chatStore.addMessage({
        type: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      })
    }
  } catch (error) {
    console.error('メッセージの送信に失敗しました:', error)
    // TODO: エラーメッセージの表示
  } finally {
    isGenerating.value = false
  }
}

// キーボード処理
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// メッセージ編集
const editMessage = async (messageId: string, newContent: string) => {
  try {
    chatStore.editMessage(messageId, newContent)
    await chatStore.saveCurrentSession()
  } catch (error) {
    console.error('メッセージの編集に失敗しました:', error)
    // TODO: エラーメッセージの表示
  }
}

// メッセージクリア
const clearMessages = async () => {
  if (confirm('チャット履歴をクリアしますか？')) {
    try {
      chatStore.clearCurrentSessionMessages()
      await chatStore.saveCurrentSession()
    } catch (error) {
      console.error('メッセージのクリアに失敗しました:', error)
      // TODO: エラーメッセージの表示
    }
  }
}

// 履歴のエクスポート
const exportHistory = () => {
  if (currentMessages.value.length === 0) return

  try {
    exportChatHistory(currentMessages.value)
  } catch (error) {
    console.error('履歴のエクスポートに失敗しました:', error)
    // TODO: エラーメッセージの表示
  }
}

// チャット履歴を最下部にスクロール
const scrollToBottom = async () => {
  await nextTick()
  if (chatHistory.value) {
    chatHistory.value.scrollTop = chatHistory.value.scrollHeight
  }
}

// メッセージが追加されたときに自動スクロール
watch(
  currentMessages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)
</script>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-background);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-message h2 {
  color: var(--color-heading);
  margin-bottom: 8px;
  font-size: 24px;
}

.empty-message p {
  color: var(--color-text-2);
  font-size: 16px;
}

.messages {
  max-width: 800px;
  margin: 0 auto;
}

.generating-message {
  max-width: 800px;
  margin: 0 auto;
}

.message {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.message.assistant {
  background-color: var(--color-background-mute);
}

.message-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  gap: 2px;
}

.typing-indicator span {
  width: 4px;
  height: 4px;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0ms;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 200ms;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 400ms;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-area {
  padding: 16px;
  background-color: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.input-container {
  display: flex;
  gap: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-input {
  flex: 1;
}

.send-button {
  align-self: flex-end;
}

.input-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* スクロールバーのスタイル */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: var(--color-background-mute);
}

.chat-history::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}
</style>
