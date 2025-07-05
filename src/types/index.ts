export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  isEditable: boolean
}

export interface AppSettings {
  temperature: number
  maxOutputTokens: number
  topP: number
  topK: number
}

export interface APIRateLimit {
  requestsPerMinute: number
  requestsPerDay: number
  remainingMinute: number
  remainingDay: number
}
