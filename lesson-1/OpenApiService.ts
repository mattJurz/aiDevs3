import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

export class OpenAIService {
    private openai: OpenAI

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }

    async getAnswer(question: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: question }],
            model: 'gpt-3.5-turbo',
        })
        return completion.choices[0].message.content || ''
    }
}
