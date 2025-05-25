export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export function generatePrompt(question: string, memory: string): string {
    return `Twoim zadaniem jest odpowiedzenie na pytanie <question>. Odpowiedź zgodnie z kontekstem zawartym w <memory>
  <question>${question}</question>
  <memory>${memory}</memory>
  Odpowiedz jednym słowem w języku angielskim.`
}
