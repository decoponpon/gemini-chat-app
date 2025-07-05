<template>
  <div class="session-list">
    <div v-if="sessions.length === 0" class="empty-state">
      <p>チャット履歴がありません</p>
    </div>
    <div v-else class="session-items">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: isCurrentSession(session.id) }"
        @click="selectSession(session.id)"
      >
        <div class="session-content">
          <div v-if="editingSessionId === session.id" class="session-title-edit">
            <BaseInput
              v-model="editingTitle"
              :maxlength="50"
              size="small"
              @keydown.enter="saveTitle"
              @keydown.esc="cancelEdit"
              @blur="saveTitle"
              ref="titleInput"
            />
          </div>
          <div v-else class="session-title" @dblclick="startEdit(session)">
            {{ session.title }}
          </div>
          <div class="session-meta">
            <span class="message-count">{{ session.messages.length }}件</span>
            <span class="last-updated">{{ formatDate(session.updatedAt) }}</span>
          </div>
        </div>
        <div class="session-actions">
          <BaseButton
            :quaternary="true"
            size="small"
            @click.stop="deleteSessionConfirm(session.id)"
            title="削除"
          >
            ×
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { BaseInput, BaseButton } from '@/components/ui'
import dayjs from 'dayjs'

// ストア
const chatStore = useChatStore()
const { sessions, currentSession } = storeToRefs(chatStore)

// リアクティブな状態
const editingSessionId = ref<string | null>(null)
const editingTitle = ref('')
const titleInput = ref<InstanceType<typeof BaseInput> | null>(null)

// 現在のセッションかどうかの判定
const isCurrentSession = (sessionId: string) => {
  return currentSession.value?.id === sessionId
}

// セッションの選択
const selectSession = async (sessionId: string) => {
  if (isCurrentSession(sessionId)) return

  try {
    // 現在のセッションを保存
    if (currentSession.value) {
      await chatStore.saveCurrentSession()
    }

    // 新しいセッションを読み込み
    await chatStore.loadSession(sessionId)
  } catch (error) {
    console.error('セッションの切り替えに失敗しました:', error)
    // TODO: エラーメッセージの表示
  }
}

// タイトル編集の開始
const startEdit = async (session: any) => {
  if (!session.isEditable) return

  editingSessionId.value = session.id
  editingTitle.value = session.title

  await nextTick()
  titleInput.value?.focus?.()
}

// タイトルの保存
const saveTitle = async () => {
  if (!editingSessionId.value || !editingTitle.value.trim()) {
    cancelEdit()
    return
  }

  try {
    chatStore.updateSessionTitle(editingSessionId.value, editingTitle.value.trim())
    await chatStore.saveCurrentSession()
    editingSessionId.value = null
    editingTitle.value = ''
  } catch (error) {
    console.error('タイトルの保存に失敗しました:', error)
    // TODO: エラーメッセージの表示
  }
}

// タイトル編集のキャンセル
const cancelEdit = () => {
  editingSessionId.value = null
  editingTitle.value = ''
}

// セッション削除の確認
const deleteSessionConfirm = async (sessionId: string) => {
  if (confirm('このチャットを削除しますか？')) {
    try {
      await chatStore.deleteSession(sessionId)
    } catch (error) {
      console.error('セッションの削除に失敗しました:', error)
      // TODO: エラーメッセージの表示
    }
  }
}

// 日時のフォーマット
const formatDate = (date: Date) => {
  return dayjs(date).format('MM/DD HH:mm')
}
</script>

<style scoped>
.session-list {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-2);
}

.session-items {
  padding: 8px 0;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.session-item:hover {
  background-color: var(--color-background-hover);
}

.session-item.active {
  background-color: var(--color-background-hover);
  border-left-color: var(--color-primary);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
}

.session-title-edit {
  margin-bottom: 4px;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-2);
}

.session-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-actions .n-button {
  width: 24px;
  height: 24px;
  color: var(--color-text-2);
}

.session-actions .n-button:hover {
  color: var(--color-error);
}
</style>
