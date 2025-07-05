import Dexie, { Table } from 'dexie'
import type { ChatSession, ChatMessage } from '@/types'

class ChatDatabase extends Dexie {
  sessions!: Table<ChatSession>

  constructor() {
    super('ChatDatabase')
    this.version(1).stores({
      sessions: '++id, title, createdAt, updatedAt, isEditable',
    })
  }
}

class DBService {
  private db: ChatDatabase

  constructor() {
    this.db = new ChatDatabase()
  }

  async getAllSessions(): Promise<ChatSession[]> {
    return await this.db.sessions.orderBy('updatedAt').reverse().toArray()
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    return await this.db.sessions.get(id)
  }

  async saveSession(session: ChatSession): Promise<void> {
    await this.db.sessions.put(session)
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.sessions.delete(id)
  }

  async clearAllSessions(): Promise<void> {
    await this.db.sessions.clear()
  }
}

export const dbService = new DBService()
