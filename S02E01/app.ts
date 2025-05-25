import express from 'express'

import { OpenAIService } from './OpenApiService'
import dotenv from 'dotenv'
import { AudioService } from './AudioService'

dotenv.config()

const app = express()
const port = 3000
app.use(express.json())
app.listen(port, () =>
    console.log(
        `Server running at http://localhost:${port}. Listening for POST /api/chat requests`
    )
)

const openAIService = new OpenAIService()
const audioService = new AudioService()

app.get('/api/chat', async (__, res) => {
    try {
        // 1. Audio Processing:
        // Process each .m4a file
        // Use Whisper or similar model to transcribe audio to text
        // Store all transcriptions
        //2. Combine all transcriptions into a single context
        // const transcriptions = await AudioService.readTranscriptSummary()
        // console.log(transcriptions)
        //3. Format the text appropriately for LLM processing with context and question
        // const prompt = AudioService.generatePrompt(transcriptions)
        // console.log(prompt)
        // 4  Send prompt to LLM
        // const answer = await openAIService.completion({ prompt })
        // Stefana Batorego
        // Batorego
        // 'ul.Gołębia
        // console.log(answer)
        // 5. Submit the answer to the CentralaAPI
        const centralaanswear = await AudioService.sendAnswerToApi(
            'ul. Stefana Batorego 68D'
        )
        // console.log(centralaanswear)
        res.json({
            role: 'assistant',
            content: centralaanswear,
        })
    } catch (error) {
        console.error('Error:', JSON.stringify(error, null, 2))
        res.status(500).json({
            error: 'An error occurred while processing your request',
        })
    }
})
