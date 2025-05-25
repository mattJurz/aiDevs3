import express from 'express'

import { OpenAIService } from './OpenApiService'
import dotenv from 'dotenv'
import AssignmentService from './work/AssignementService'

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

app.get('/api/chat', async (__, res) => {
    try {
        const assignment = await AssignmentService.getAssignment()
        const systemAnswers = AssignmentService.calculateAnswers(assignment)
        const dataWithTestFormPrompt =
            AssignmentService.dataWithTestFormPrompt(systemAnswers)
        console.log(systemAnswers)
        const testsFormPrompt = AssignmentService.buildPrompt(
            dataWithTestFormPrompt
        )

        const opeApiResponse = await openAIService.getAnswer(testsFormPrompt)
        const parsedResponse = AssignmentService.parseOpenAiResponse(
            opeApiResponse,
            dataWithTestFormPrompt
        )

        const formatedData = AssignmentService.formatTestData(
            parsedResponse,
            systemAnswers
        )

        const aiDevsCheck = await AssignmentService.sendAnswerToApi(
            formatedData
        )
        console.log(formatedData)

        res.json({
            role: 'assistant',
            content: aiDevsCheck,
        })
    } catch (error) {
        console.error('Error:', JSON.stringify(error, null, 2))
        res.status(500).json({
            error: 'An error occurred while processing your request',
        })
    }
})
