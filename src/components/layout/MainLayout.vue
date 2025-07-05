<template>
  <div class="main-layout">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-left">
        <BaseButton :quaternary="true" @click="toggleSidebar" class="sidebar-toggle">
          <template #icon>
            <MenuIcon />
          </template>
        </BaseButton>
        <h1 class="app-title">Gemini Chat</h1>
      </div>
      <div class="header-right">
        <BaseButton :quaternary="true" @click="toggleSettingsPanel" class="settings-toggle">
          <template #icon>
            <SettingsIcon />
          </template>
        </BaseButton>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="main-content">
      <!-- 左サイドバー（セッション一覧） -->
      <aside class="sidebar" :class="{ 'sidebar-collapsed': !showSidebar }">
        <div class="sidebar-header">
          <BaseButton
            type="primary"
            :block="true"
            @click="createNewSession"
            :loading="isCreatingSession"
          >
            新しいチャット
          </BaseButton>
        </div>
        <div class="sidebar-content">
          <SessionList />
        </div>
      </aside>

      <!-- チャット画面 -->
      <section class="chat-area">
        <div class="chat-container">
          <ChatArea />
        </div>
      </section>

      <!-- 右サイドバー（設定パネル） -->
      <aside class="settings-panel" :class="{ 'settings-panel-collapsed': !showSettingsPanel }">
        <div class="settings-header">
          <h3>設定</h3>
        </div>
        <div class="settings-content">
          <SettingsPanel />
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { BaseButton } from '@/components/ui'
import SessionList from '@/components/chat/SessionList.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'

// ストア
const chatStore = useChatStore()
const { sessions } = storeToRefs(chatStore)

// リアクティブな状態
const showSidebar = ref(true)
const showSettingsPanel = ref(false)
const isCreatingSession = ref(false)

// サイドバーの表示切り替え
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 設定パネルの表示切り替え
const toggleSettingsPanel = () => {
  showSettingsPanel.value = !showSettingsPanel.value
}

// 新しいセッションの作成
const createNewSession = async () => {
  try {
    isCreatingSession.value = true
    await chatStore.createNewSession()
  } catch (error) {
    console.error('新しいセッションの作成に失敗しました:', error)
    // TODO: エラーメッセージの表示
  } finally {
    isCreatingSession.value = false
  }
}

// コンポーネントマウント時の処理
onMounted(async () => {
  try {
    await chatStore.loadSessions()
  } catch (error) {
    console.error('セッション一覧の読み込みに失敗しました:', error)
    // TODO: エラーメッセージの表示
  }
})
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-background);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.sidebar-toggle,
.settings-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background-color: var(--color-background-mute);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.sidebar-collapsed {
  margin-left: -280px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.settings-panel {
  width: 320px;
  background-color: var(--color-background-mute);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease;
}

.settings-panel-collapsed {
  margin-right: -320px;
}

.settings-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.settings-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-heading);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 61px;
    height: calc(100vh - 61px);
    z-index: 20;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-collapsed {
    margin-left: -280px;
  }

  .settings-panel {
    position: fixed;
    right: 0;
    top: 61px;
    height: calc(100vh - 61px);
    z-index: 20;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .settings-panel-collapsed {
    margin-right: -320px;
  }

  .chat-area {
    width: 100%;
  }
}
</style>
