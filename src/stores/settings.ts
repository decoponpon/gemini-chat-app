import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { AppSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  // デフォルト設定値
  const defaultSettings: AppSettings = {
    temperature: 0.6,
    maxOutputTokens: 2000,
    topP: 0.8,
    topK: 40,
  }

  // リアクティブな設定値
  const settings = ref<AppSettings>({ ...defaultSettings })

  // localStorage からの設定読み込み
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('gemini-chat-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // 設定値の妥当性チェック
        if (isValidSettings(parsed)) {
          settings.value = { ...defaultSettings, ...parsed }
        }
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error)
      // エラーの場合はデフォルト値を使用
      settings.value = { ...defaultSettings }
    }
  }

  // localStorage への設定保存
  const saveSettings = () => {
    try {
      localStorage.setItem('gemini-chat-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('設定の保存に失敗しました:', error)
      throw new Error('設定の保存に失敗しました')
    }
  }

  // 設定値の妥当性チェック
  const isValidSettings = (obj: any): obj is AppSettings => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.temperature === 'number' &&
      obj.temperature >= 0 &&
      obj.temperature <= 2 &&
      typeof obj.maxOutputTokens === 'number' &&
      obj.maxOutputTokens > 0 &&
      obj.maxOutputTokens <= 8192 &&
      typeof obj.topP === 'number' &&
      obj.topP >= 0 &&
      obj.topP <= 1 &&
      typeof obj.topK === 'number' &&
      obj.topK >= 1 &&
      obj.topK <= 100
    )
  }

  // 個別設定値の更新
  const updateTemperature = (value: number) => {
    if (value >= 0 && value <= 2) {
      settings.value.temperature = value
    }
  }

  const updateMaxOutputTokens = (value: number) => {
    if (value > 0 && value <= 8192) {
      settings.value.maxOutputTokens = value
    }
  }

  const updateTopP = (value: number) => {
    if (value >= 0 && value <= 1) {
      settings.value.topP = value
    }
  }

  const updateTopK = (value: number) => {
    if (value >= 1 && value <= 100) {
      settings.value.topK = value
    }
  }

  // 設定をデフォルト値にリセット
  const resetSettings = () => {
    settings.value = { ...defaultSettings }
  }

  return {
    settings,
    loadSettings,
    saveSettings,
    updateTemperature,
    updateMaxOutputTokens,
    updateTopP,
    updateTopK,
    resetSettings,
  }
})
