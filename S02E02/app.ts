import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import type {
    ChatCompletion,
    ChatCompletionContentPartImage,
    ChatCompletionContentPartText,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions'
import { OpenAIService } from './OpenAIService'

const openAIService = new OpenAIService()

async function processMap(
    file: string
): Promise<{ file: string; response: string; confidence?: number }> {
    try {
        const mapsFolder = join(__dirname, 'maps')
        const filePath = join(mapsFolder, file)
        const fileData = await readFile(filePath)
        const base64Image = fileData.toString('base64')

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `esteś ekspertem od analizy map i specjalistą w rozpoznawaniu miast na podstawie fragmentów map. Twoje zadanie to bardzo dokładnie przeanalizować cztery dostarczone obrazy (fragmenty mapy) i określić, z jakiego miasta pochodzą.

⚠️ WAŻNE:
- Uważaj, bo jeden z fragmentów może być błędny — pochodzić z zupełnie innego miasta.
- Nie zakładaj, że wszystkie fragmenty są z tego samego miejsca, dopóki to nie zostanie zweryfikowane.

---

### 🔍 **Co dokładnie masz zrobić?**
1. **Analiza każdego obrazu osobno**:
   - Zidentyfikuj nazwy ulic, placów, skwerów.
   - Wypisz charakterystyczne obiekty (np. cmentarze, kościoły, szkoły, sklepy, urzędy, parki).
   - Opisz układ urbanistyczny: czy to ścisłe centrum, przedmieścia, siatka ulic, nieregularny układ itp.
   - Zanotuj wszelkie elementy geograficzne: rzeki, jeziora, wzgórza.

2. **Proces weryfikacji**:
   - Zweryfikuj, czy te nazwy ulic i obiekty naprawdę istnieją w sugerowanym mieście.
   - Sprawdź, czy układ urbanistyczny pasuje do tego miasta.
   - Jeśli któryś fragment wydaje się nie pasować (np. jest z innego regionu Polski, ma inne wzorce nazewnicze), zaznacz go jako potencjalnie błędny.

---

### 📦 **Format odpowiedzi**
Proszę podać wynik w takim formacie:`,
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/png;base64,${base64Image}`,
                            detail: 'high',
                        },
                    } as ChatCompletionContentPartImage,
                    {
                        type: 'text',
                        text: 'Przeanalizuj dokładnie ten fragment mapy. Skup się na zidentyfikowaniu miasta, analizując nazwy ulic, charakterystyczne obiekty oraz układ urbanistyczny. Zwróć szczególną uwagę na wszelkie niespójności, które mogą wskazywać, że jest to nieprawidłowy fragment.',
                    } as ChatCompletionContentPartText,
                ],
            },
        ]

        const chatCompletion = await openAIService.completion(
            messages,
            'gpt-4.1',
            false,
            false,
            1024
        )

        if ('choices' in chatCompletion) {
            const response = chatCompletion.choices[0].message.content || ''

            // Extract confidence from response if available
            const confidenceMatch = response.match(/Confidence:\s*(\d+)%/)
            const confidence = confidenceMatch
                ? parseInt(confidenceMatch[1])
                : undefined

            return {
                file,
                response,
                confidence,
            }
        } else {
            throw new Error('Unexpected response format from OpenAI')
        }
    } catch (error) {
        console.error(`Error processing file ${file}:`, error)
        return {
            file,
            response: `Error: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
        }
    }
}

async function processMaps(): Promise<void> {
    const mapsFolder = join(__dirname, 'maps')
    const files = await readdir(mapsFolder)
    const jpgFiles = files.filter((file) => file.endsWith('.jpg'))

    const results = await Promise.all(jpgFiles.map((file) => processMap(file)))

    console.table(results)
}

await processMaps()
