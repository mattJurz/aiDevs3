interface TestData {
    question: string
    answer: number
    test?: {
        q: string
        a: string
    }
}

interface TextResponse {
    apikey: string
    description: string
    copyright: string
    'test-data': TestData[]
}

type PromptQuestionsFormat = { data: TestData; index: number }

class AssignmentService {
    static centralaApiKey = process.env.CENTRALA_API_KEY

    static async getAssignment() {
        const response = await fetch(
            `https://c3ntrala.ag3nts.org/data/${this.centralaApiKey}/json.txt`,
            { method: 'GET' }
        ).then((res) => res.text())

        return JSON.parse(response) as TextResponse
    }

    static calculateAnswers(textResponse: TextResponse): TestData[] {
        const answers = textResponse['test-data'].map((test) => {
            const [num1, , num2] = test.question.split(' ')
            const firstNumber = parseInt(num1)
            const secondNumber = parseInt(num2)
            return {
                question: test.question,
                answer: firstNumber + secondNumber,
                test: test.test,
            }
        })

        return answers
    }

    static dataWithTestFormPrompt(
        textResponse: TestData[]
    ): { data: TestData; index: number }[] {
        return textResponse.reduce((acc, test, index) => {
            if (test.test) {
                acc.push({ data: test, index })
            }
            return acc
        }, [] as { data: TestData; index: number }[])
    }

    // static  buildPrompt = (questions: { question: string, questionId: number }[]) => {
    static buildPrompt(questions: PromptQuestionsFormat[]) {
        return `Answer the following questions with short, direct answers. Respond with only the answer, no extra explanation or context:\n${AssignmentService.buildQuestionsForPrompt(
            questions
        )}`
    }
    static buildQuestionsForPrompt = (questions: PromptQuestionsFormat[]) => {
        return questions
            .map((q, idx) => `${idx + 1}. ${q.data.test?.q}`)
            .join('\n')
    }

    static parseOpenAiResponse(
        response: string,
        questions: PromptQuestionsFormat[]
    ): PromptQuestionsFormat[] {
        // Split response into lines and filter out empty lines
        const lines = response.split('\n').filter((line) => line.trim())

        // Parse each line into question/answer pairs
        const answersWithIndex = lines.map((line, index) => {
            // Remove the numbering and trim whitespace
            const cleanAnswer = line.replace(/^\d+\.\s*/, '').trim()

            return {
                index: index,
                answer: cleanAnswer.replace('.', '').trim(),
            }
        })

        return answersWithIndex.map((answer, index) => {
            console.log(answer)
            const question = questions[index]
            question.data.test!.a = answer.answer
            return question
        })
    }

    static formatTestData(
        parsedResponse: PromptQuestionsFormat[],
        initialFormat: TestData[]
    ): TestData[] {
        parsedResponse.forEach((question) => {
            initialFormat[question.index] = question.data
        })

        return initialFormat
    }

    static async sendAnswerToApi(testData: TestData[]) {
        const answearData = {
            task: 'JSON',
            apikey: this.centralaApiKey,
            answer: {
                apikey: this.centralaApiKey,
                description:
                    'This is simple calibration data used for testing purposes. Do not use it in production environment!',
                copyright: 'Copyright (C) 2238 by BanAN Technologies Inc.',
                'test-data': testData,
            },
        }
        const response = await fetch(`https://c3ntrala.ag3nts.org/report`, {
            method: 'POST',
            body: JSON.stringify(answearData),
        })

        return response.json()
    }
}

export default AssignmentService
