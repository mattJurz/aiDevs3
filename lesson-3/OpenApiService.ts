import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export class OpenAIService {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }

    async getAnswer(
        prompt: string,
        model: string = 'gpt-4.1-mini'
    ): Promise<string> {
        try {
            const messages: ChatCompletionMessageParam[] = [
                { role: 'user', content: prompt },
            ]

            const completion = await this.openai.chat.completions.create({
                model,
                messages,
            })

            return completion.choices[0]?.message?.content || ''
        } catch (error) {
            console.error('Error getting answer from OpenAI:', error)
            throw error
        }
    }
}
