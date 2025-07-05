import { GoogleGenerativeAI } from '@google/genai'
import type { AppSettings } from '@/types'

class GeminiService {
  private genAI: GoogleGenerativeAI
  private apiKey = 'YOUR_API_KEY_HERE' // TODO: 実際のAPIキーに置き換える

  constructor() {
    this.genAI = new GoogleGenerativeAI(this.apiKey)
  }

  async generateResponse(message: string, settings: AppSettings): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxOutputTokens,
          topP: settings.topP,
          topK: settings.topK,
        },
      })

      const result = await model.generateContent(message)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
