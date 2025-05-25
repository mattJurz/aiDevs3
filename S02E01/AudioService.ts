import { OpenAIService } from './OpenApiService'

const openAIService = new OpenAIService()

export class AudioService {
    static centralaApiKey = process.env.CENTRALA_API_KEY

    static async storeAllInTextFile(transcripts: string[]) {
        transcripts.forEach((transcript, index) => {
            const fs = require('fs')
            const path = require('path')
            const transcriptsFolder = path.join(__dirname, 'transcripts')

            if (!fs.existsSync(transcriptsFolder)) {
                fs.mkdirSync(transcriptsFolder)
            }

            const filename = path.join(
                transcriptsFolder,
                `transcript_${index}.txt`
            )
            fs.writeFileSync(filename, transcript)
        })
    }
    static async storeInTextFile(
        transcript: string,
        index: number,
        filePrefix = 'transcript'
    ) {
        const fs = require('fs')
        const path = require('path')
        const transcriptsFolder = path.join(__dirname, 'transcripts')

        if (!fs.existsSync(transcriptsFolder)) {
            fs.mkdirSync(transcriptsFolder)
        }

        const filename = path.join(
            transcriptsFolder,
            `${filePrefix}_${index}.txt`
        )
        fs.writeFileSync(filename, transcript)
    }

    static async readTranscriptSummary() {
        const fs = require('fs')
        const path = require('path')
        const transcriptsFolder = path.join(__dirname, 'transcripts')
        const summaryPath = path.join(
            transcriptsFolder,
            'transcripts_summary_0.txt'
        )

        try {
            const summary = fs.readFileSync(summaryPath, 'utf8')
            return summary
        } catch (error) {
            console.error('Error reading transcript summary:', error)
            return ''
        }
    }

    static generatePrompt(transcripts: string) {
        return `
        <context>
Jesteś pomocnym asystentem AI. Odpowiadasz wyłącznie na podstawie poniższej transkrypcji.
</context>
<transcripts>
${transcripts}
</transcripts>
<question>
Jaka jest nazwa ulicy, na której znajduje się instytut uczelni, gdzie wykłada profesor Andrzej Maj?
</question>
<instruction>
Jeśli nie ma jednoznacznej odpowiedzi, zgadnij na podstawie dostępnych informacji najbardziej prawdopodobną nazwę ulicy.
Jeśli jednak naprawdę nic nie wskazuje na konkretną ulicę, odpowiedz: brak.
Odpowiedz jednym słowem – nazwą ulicy, bez „ul.” i bez numeru.
</instruction>`
    }

    static getAudioFiles() {
        const fs = require('fs')
        const path = require('path')
        const audioFolder = path.join(__dirname, 'audio')
        const files = fs.readdirSync(audioFolder)
        return files.map((file) => path.join(audioFolder, file))
    }

    static async transcribeAllFilesFromAudioFolder() {
        const files = this.getAudioFiles()
        const transcripts: string[] = []

        for (const [index, file] of files.entries()) {
            const transcription = await openAIService.transcribeGroq(file)
            await this.storeInTextFile(
                transcription,
                index,
                file.split('/').pop()?.split('.')[0]
            )
            transcripts.push(transcription)
        }

        await this.storeInTextFile(
            transcripts.join('\n\n  '),
            0,
            'transcripts_summary'
        )
        return transcripts
    }

    static async sendAnswerToApi(answer: string) {
        const answerData = {
            task: 'mp3',
            apikey: this.centralaApiKey,
            answer: answer,
        }
        const response = await fetch(`https://centrala.ag3nts.org/report`, {
            method: 'POST',
            body: JSON.stringify(answerData),
        })

        return response.json()
    }
}
