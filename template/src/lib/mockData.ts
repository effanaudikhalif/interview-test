import fs from 'fs'
import path from 'path'
import { VoiceEntry } from './types'

function parseCSV(csv: string): VoiceEntry[] {
  const lines = csv.trim().split(/\r?\n/)
  const headers = lines.shift()!.split(',')

  return lines.map((line) => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)

    const obj: Record<string, unknown> = {}
    headers.forEach((header, idx) => {
      const raw = values[idx] ?? ''
      switch (header) {
        case 'tags_model':
        case 'tags_user':
          obj[header] = raw ? raw.split('|').map((s) => s.trim()).filter(Boolean) : []
          break
        case 'emotion_score_score':
          obj[header] = raw ? Number(raw) : null
          break
        case 'embedding':
          obj[header] = raw ? raw.split(' ').map(Number) : null
          break
        default:
          obj[header] = raw
      }
    })

    return {
      id: '',
      user_id: '',
      audio_url: null,
      language_detected: '',
      language_rendered: '',
      category: null,
      ...obj,
    } as VoiceEntry
  })
}

function loadCSV(): string {
  const possible = [
    path.resolve(process.cwd(), 'Expanded_Diary_Entries.csv'),
    path.resolve(process.cwd(), 'src', 'lib', 'Expanded_Diary_Entries.csv'),
  ]

  for (const p of possible) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8')
    }
  }
  throw new Error('Expanded_Diary_Entries.csv not found')
}

export const mockVoiceEntries = parseCSV(loadCSV())
export default mockVoiceEntries