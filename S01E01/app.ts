import {
    extractQuestion,
    fetchWebsiteContent,
    postAnswerToWebsite,
    saveHtmlToFile,
} from './utils'
import { OpenAIService } from './OpenApiService'

const openaiService = new OpenAIService()

async function main() {
    try {
        const content = await fetchWebsiteContent()
        const question = extractQuestion(content)
        console.log('Extracted question:', question)
        const answer = await openaiService.getAnswer(question)
        console.log('Answer:', answer)
        const response = await postAnswerToWebsite(answer)
        console.log('Response:', response)
        saveHtmlToFile(response, 'website-response.html')
    } catch (error) {
        console.error('Failed to fetch website content')
    }
}

main()
