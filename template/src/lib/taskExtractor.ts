// template/src/lib/taskExtractor.ts

import type OpenAIClient from 'openai'
import { hasRealOpenAIKey } from './openai'

/**
 * extractTask
 * -----------
 * If an OpenAI key is present, ask GPT to extract the single actionable task
 * phrase (e.g. from “I need to call my doctor tomorrow” → “call my doctor”).
 * Otherwise, return the entire input text as the “task.”
 */
export async function extractTask(text: string): Promise<string> {
  // Offline fallback: nothing to extract, so use the entire text
  if (!hasRealOpenAIKey()) {
    return text
  }

  // Dynamically import the OpenAI SDK
  const { default: OpenAI } = (await import('openai')) as { default: typeof OpenAIClient }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  // System prompt constrains GPT to output only the task phrase
  const system = `
You are a task extractor. Given a user journal entry, output exactly the
single actionable task phrase only, with no extra words or punctuation.
Example:
  Input: "I need to call my doctor tomorrow"
  Output: "call my doctor"
Respond with the phrase only.
`.trim()

  const user = `Transcript: "${text}"`

  const resp = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: 0.0,
    max_tokens: 50,
    stream: false,
  })

  // Grab and clean up GPT’s reply
  const extracted = resp.choices?.[0]?.message?.content?.trim() ?? ''
  return extracted || text   // if GPT returns empty, fall back to full text
}
