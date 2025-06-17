// template/src/lib/taskExtractor.ts

import type OpenAIClient from 'openai'
import { hasRealOpenAIKey } from './openai'

/**
 * ExtractedTask
 * -------------
 * The shape returned by GPT:  
 *  • task_text: the actionable phrase  
 *  • raw_due?:  any trailing date hint (e.g. “tomorrow”, “Friday at 3pm”)
 */
export interface ExtractedTask {
  task_text: string
  raw_due?:  string
}

/**
 * extractTask
 * -----------
 * Always uses OpenAI to extract a single actionable task and any date hint.
 * Returns null if GPT indicates “no task” by giving an empty task_text.
 */
export async function extractTask(text: string): Promise<ExtractedTask | null> {
  if (!hasRealOpenAIKey()) {
    throw new Error('OPENAI_API_KEY missing—extractTask requires a key.')
  }

  const { default: OpenAI } = (await import('openai')) as { default: typeof OpenAIClient }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const system = `
  You are a strict task extractor. From a journal entry, you should extract ONLY a clear, future-looking
  action or commitment that the user intends to perform (e.g. commands, to-dos, reminders).
  Ignore any passive reflections, regrets, or past tense descriptions.
  If the entry does not contain such an action, respond with an empty JSON object: {}.

  When there is a task, respond with valid JSON ONLY in this format:
  {
    "task_text": string,   // the action (e.g. "call my doctor")
    "raw_due":   string|null // any date hint, or null if none
  }

  Examples:
  Input: "I need to call my doctor tomorrow about my prescription."
  Output: {"task_text":"call my doctor","raw_due":"tomorrow"}

  Input: "I planned to work out today, but I was exhausted from work."
  Output: {}

  Input: "Remind me to submit my report by Friday."
  Output: {"task_text":"submit my report","raw_due":"by Friday"}
`.trim()

  const user = `Transcript: ${JSON.stringify(text)}`

  const resp = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: 0.0,
    max_tokens: 100,
    stream:      false,
  })

  const raw = resp.choices?.[0]?.message?.content?.trim() ?? ''
  try {
    const obj = JSON.parse(raw)
    const task_text = String(obj.task_text || '').trim()
    if (!task_text) return null
    const raw_due = obj.raw_due ? String(obj.raw_due).trim() : undefined
    return { task_text, raw_due }
  } catch {
    return null
  }
}
