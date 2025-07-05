import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import type { ChatMessage, ChatSession } from '@/types'
import { dbService } from '@/services/dbService'

export const useChatStore = defineStore('chat', () => {
  // 現在のセッション
  const currentSession = ref<ChatSession | null>(null)
  
  // 全セッション一覧
  const sessions = ref<ChatSession[]>([])
  
  // 現在の入力中メッセージ
  const currentInput = ref('')
  
  // AI応答中フラグ
  const isGenerating = ref(false)
  
  // セッション一覧の読み込み
  const loadSessions = async () => {
    try {
      sessions.value = await dbService.getAllSessions()
    } catch (error) {
      console.error('セッション一覧の読み込みに失敗しました:', error)
      throw new Error('セッション一覧の読み込みに失敗しました')
    }
  }
  
  // 新しいセッションを作成
  const createNewSession = async (): Promise<string> => {
    const newSession: ChatSession = {
      id: nanoid(),
      title: '新しいチャット',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEditable: true,
    }
    
    try {
      await dbService.saveSession(newSession)
      sessions.value.unshift(newSession)
      currentSession.value = newSession
      return newSession.id
    } catch (error) {
      console.error('新しいセッションの作成に失敗しました:', error)
      throw new Error('新しいセッションの作成に失敗しました')
    }
  }
  
  // セッションの読み込み
  const loadSession = async (sessionId: string) => {
    try {
      const session = await dbService.getSession(sessionId)
      if (session) {
        currentSession.value = session
      } else {
        throw new Error('セッションが見つかりません')
      }
    } catch (error) {
      console.error('セッションの読み込みに失敗しました:', error)
      throw new Error('セッションの読み込みに失敗しました')
    }
  }
  
  // セッションの保存
  const saveCurrentSession = async () => {
    if (!currentSession.value) return
    
    try {
      currentSession.value.updatedAt = new Date()
      await dbService.saveSession(currentSession.value)
      
      // セッション一覧も更新
      const index = sessions.value.findIndex(s => s.id === currentSession.value!.id)
      if (index !== -1) {
        sessions.value[index] = { ...currentSession.value }
        // 最新順に並び替え
        sessions.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      }
    } catch (error) {
      console.error('セッションの保存に失敗しました:', error)
      throw new Error('セッションの保存に失敗しました')
    }
  }
  
  // メッセージの追加
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!currentSession.value) return
    
    const newMessage: ChatMessage = {
      id: nanoid(),
      timestamp: new Date(),
      ...message,
    }
    
    currentSession.value.messages.push(newMessage)
    
    // 最初のユーザーメッセージの場合、タイトルを更新
    if (message.type === 'user' && currentSession.value.messages.length === 1) {
      const title = message.content.length > 30 
        ? message.content.substring(0, 30) + '...'
        : message.content
      currentSession.value.title = title
    }
  }
  
  // メッセージの編集
  const editMessage = (messageId: string, newContent: string) => {
    if (!currentSession.value) return
    
    const messageIndex = currentSession.value.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    // メッセージを更新
    currentSession.value.messages[messageIndex].content = newContent
    
    // 編集したメッセージ以降のメッセージを削除
    currentSession.value.messages = currentSession.value.messages.slice(0, messageIndex + 1)
  }
  
  // セッションタイトルの更新
  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    if (currentSession.value && currentSession.value.id === sessionId) {
      currentSession.value.title = newTitle
    }
    
    const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex].title = newTitle
    }
  }
  
  // セッションの削除
  const deleteSession = async (sessionId: string) => {
    try {
      await dbService.deleteSession(sessionId)
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      
      // 現在のセッションが削除された場合
      if (currentSession.value && currentSession.value.id === sessionId) {
        currentSession.value = null
      }
    } catch (error) {
      console.error('セッションの削除に失敗しました:', error)
      throw new Error('セッションの削除に失敗しました')
    }
  }
  
  // 全セッションの削除
  const clearAllSessions = async () => {
    try {
      await dbService.clearAllSessions()
      sessions.value = []
      currentSession.value = null
    } catch (error) {
      console.error('全セッションの削除に失敗しました:', error)
      throw new Error('全セッションの削除に失敗しました')
    }
  }
  
  // 現在のセッションのメッセージクリア
  const clearCurrentSessionMessages = () => {
    if (!currentSession.value) return
    currentSession.value.messages = []
  }
  
  // 計算プロパティ
  const hasCurrentSession = computed(() => currentSession.value !== null)
  const currentMessages = computed(() => currentSession.value?.messages || [])
  const sessionCount = computed(() => sessions.value.length)
  
  return {
    // 状態
    currentSession,
    sessions,
    currentInput,
    isGenerating,
    
    // 計算プロパティ
    hasCurrentSession,
    currentMessages,
    sessionCount,
    
    // アクション
    loadSessions,
    createNewSession,
    loadSession,
    saveCurrentSession,
    addMessage,
    editMessage,
    updateSessionTitle,
    deleteSession,
    clearAllSessions,
    clearCurrentSessionMessages,
  }
})