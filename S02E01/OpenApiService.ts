import { createByModelName } from '@microsoft/tiktokenizer'
import { ElevenLabsClient } from 'elevenlabs'
import Groq, { toFile } from 'groq-sdk'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources.mjs'
import fs from 'fs'
export class OpenAIService {
    private openai: OpenAI
    private tokenizers: Map<
        string,
        Awaited<ReturnType<typeof createByModelName>>
    > = new Map()
    private readonly IM_START = '<|im_start|>'
    private readonly IM_END = '<|im_end|>'
    private readonly IM_SEP = '<|im_sep|>'
    private elevenlabs: ElevenLabsClient
    private groq: Groq

    constructor() {
        this.openai = new OpenAI()
        this.elevenlabs = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_API_KEY,
        })
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        })
    }

    async completion(config: {
        prompt: string
        model?: string
        stream?: boolean
        temperature?: number
        jsonMode?: boolean
        maxTokens?: number
    }): Promise<string> {
        const {
            prompt,
            model = 'gpt-4o',
            stream = false,
            jsonMode = false,
            maxTokens = 4096,
            temperature = 0,
        } = config
        const messages: ChatCompletionMessageParam[] = [
            { role: 'user', content: prompt },
        ]
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages,
                model,
            })

            return chatCompletion.choices[0]?.message?.content || ''
        } catch (error) {
            console.error('Error in OpenAI completion:', error)
            throw error
        }
    }

    async transcribeGroq(path: fs.PathLike, language = 'pl'): Promise<string> {
        const transcription = await this.groq.audio.transcriptions.create({
            file: fs.createReadStream(path),
            language,
            model: 'whisper-large-v3',
        })
        return transcription.text
    }
}
