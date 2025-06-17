// template/src/lib/categorize.ts

import type OpenAIClient from 'openai'
import { hasRealOpenAIKey } from './openai'

// Define your allowed categories
const CATEGORIES = ['health', 'work', 'shopping', 'finance', 'other'] as const
export type Category = typeof CATEGORIES[number]

/**
 * categorize
 * ----------
 * If an OpenAI API key is available, ask GPT to pick exactly one
 * category from the CATEGORIES list. Otherwise, fall back to "other".
 */
export async function categorize(text: string): Promise<Category> {
  // Offline fallback
  if (!hasRealOpenAIKey()) {
    return 'other'
  }

  // Dynamically import the OpenAI SDK
  const { default: OpenAI } = (await import('openai')) as { default: typeof OpenAIClient }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  // Build prompts
  const system = `
You are a task categorizer. Choose exactly one category from: ${CATEGORIES.join(
    ', '
  )}. Respond with that category only.
  `.trim()
  const user = `Task: "${text}"\nCategory:`

  // Call the API
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: 0.0,
    max_tokens: 10,
    stream: false,
  })

  // Extract and normalize the reply
  const raw = response.choices?.[0]?.message?.content?.trim().toLowerCase() ?? ''
  const match = CATEGORIES.find((c) => raw.includes(c))
  return match ?? 'other'
}
