import express from 'express'
// const context = await fetch('https://xyz.ag3nts.org/files/0_13_4b.txt').then(res => res.text());

import { generatePrompt } from './utils'
import { OpenAIService } from './OpenApiService'
import dotenv from 'dotenv'
import type { ChatCompletionMessageParam } from 'ai/prompts'

dotenv.config()

/*
Start Express server
*/
const app = express()
const port = 3000
app.use(express.json())
app.listen(port, () =>
    console.log(
        `Server running at http://localhost:${port}. Listening for POST /api/chat requests`
    )
)

const openAIService = new OpenAIService()

interface VerificationResponse {
    text: string
    msgID: number
}

interface AnswerResponse {
    flag?: string
    error?: string
    question?: string
    conversation_id?: string
}

app.post('/api/chat', async (req, res) => {
    const {
        messages,
        model,
    }: { messages?: ChatCompletionMessageParam[]; model?: string } = req.body

    try {
        // 1. Fetch context
        console.log('Fetching robot memory dump...')
        const context = await fetch(
            'https://xyz.ag3nts.org/files/0_13_4b.txt',
            { method: 'GET' }
        ).then((res) => res.text())

        // 2. Prepare system message with context
        console.log('Starting verification process...')
        const verificationResponse = await fetch(
            'https://xyz.ag3nts.org/verify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    msgID: '0',
                    text: 'READY',
                }),
            }
        )

        const verificationData =
            (await verificationResponse.json()) as VerificationResponse
        console.log('Verification response:', verificationData)

        // 3. Generate answer using LLM with context
        const prompt = generatePrompt(verificationData.text, context)
        const answer = await openAIService.getAnswer(prompt, model)
        console.log('Generated answer:', answer)

        // 4. Send answer
        console.log('Sending answer...')
        const answerResponse = await fetch('https://xyz.ag3nts.org/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                msgID: verificationData.msgID,
                text: answer,
            }),
        })

        const answerData = (await answerResponse.json()) as AnswerResponse
        console.log('Verification result (with a flag or error):', answerData)
        //   const modelContextLength = 128000;
        //   const maxOutputTokens = 50;
        //   const inputTokens = await openAIService.countTokens(messages, model);

        //   if (inputTokens + maxOutputTokens > modelContextLength) {
        //     return res.status(400).json({ error: `No space left for response. Input tokens: ${inputTokens}, Context length: ${modelContextLength}` });
        //   }

        //   console.log(`Input tokens: ${inputTokens}, Max tokens: ${maxOutputTokens}, Model context length: ${modelContextLength}, Tokens left: ${modelContextLength - (inputTokens + maxOutputTokens)}`);

        //   const fullResponse = await openAIService.continuousCompletion({
        //     messages,
        //     model,
        //     maxTokens: maxOutputTokens
        //   });

        res.json({
            role: 'assistant',
            content: answerData,
        })
    } catch (error) {
        console.error('Error:', JSON.stringify(error, null, 2))
        res.status(500).json({
            error: 'An error occurred while processing your request',
        })
    }
})

async function main() {
    try {
        // 1. Fetch context
        console.log('Fetching robot memory dump...')
        const context = await fetch(
            'https://xyz.ag3nts.org/files/0_13_4b.txt',
            { method: 'GET' }
        ).then((res) => res.text())

        // 2. Prepare system message with context
        console.log('Starting verification process...')
        const verificationResponse = await fetch(
            'https://xyz.ag3nts.org/verify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    msgID: '0',
                    text: 'READY',
                }),
            }
        )

        const verificationData =
            (await verificationResponse.json()) as VerificationResponse
        console.log('Verification response:', verificationData)

        // 3. Generate answer using LLM with context
        // const prompt = `Context:${context}.\n\n Question: ${verificationData.text}`
        const prompt = generatePrompt(verificationData.text, context)
        const answer = await openAIService.getAnswer(prompt)
        console.log('Generated answer:', answer)

        // 4. Send answer
        console.log('Sending answer...')
        const answerResponse = await fetch('https://xyz.ag3nts.org/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                msgID: verificationData.msgID,
                text: answer,
            }),
        })

        const result = (await answerResponse.json()) as AnswerResponse
        console.log('Verification result (with a flag or error):', result)
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

// main()
