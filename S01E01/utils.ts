import * as cheerio from 'cheerio'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as url from 'url'

import axios from 'axios'

export async function fetchWebsiteContent() {
    try {
        const response = await axios.get('https://xyz.ag3nts.org/')
        return response.data
    } catch (error) {
        console.error('Error fetching website content:', error)
        throw error
    }
}

export function extractQuestion(html: string): string {
    const $ = cheerio.load(html)
    const questionElement = $('#human-question')
    if (questionElement.length) {
        // Get the text content after "Question:" and trim it
        const questionText = questionElement
            .text()
            .replace('Question:', '')
            .trim()
        return questionText
    }
    return 'Question not found'
}

export async function saveHtmlToFile(
    html: string,
    filename: string = 'response.html'
): Promise<void> {
    try {
        const __filename = url.fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        const outputPath = path.join(__dirname, filename)

        await fs.writeFile(outputPath, html, 'utf-8')
        console.log(`HTML content saved to: ${outputPath}`)
    } catch (error) {
        console.error('Error saving HTML file:', error)
        throw error
    }
}

export async function postAnswerToWebsite(answer: string) {
    const response = await axios.post(
        'https://xyz.ag3nts.org/',
        {
            username: 'tester',
            password: '574e112a',
            answer: answer,
        },
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    )
    return response.data
}
