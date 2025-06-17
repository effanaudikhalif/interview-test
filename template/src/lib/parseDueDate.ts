// template/src/lib/parseDueDate.ts

import type OpenAIClient from 'openai'
import { hasRealOpenAIKey } from './openai'

/**
 * parseDueDate
 * ------------
 * • If an OpenAI API key is present, sends the raw hint to GPT and
 *   expects back a single ISO8601 date string (or “unknown”).  
 * • If no key—or if the model replies “unknown”—returns undefined.
 */
export async function parseDueDate(raw?: string): Promise<string | undefined> {
  // If there’s no hint or no API key, bail out immediately
  if (!raw || !hasRealOpenAIKey()) {
    return undefined
  }

  // Dynamically import the OpenAI SDK only when we actually need it
  const { default: OpenAI } = (await import('openai')) as { default: typeof OpenAIClient }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  // Instruct GPT to output exactly one ISO8601 date, or the word "unknown"
  const system = `
You are a date parsing assistant. 
Given a user‑provided date hint (e.g. "tomorrow", "next Friday", "on June 20"), 
respond with a single ISO8601 date string (e.g. "2025-06-20T00:00:00.000Z"). 
If you cannot parse it, respond with exactly "unknown".
`.trim()

  const user = `Date hint: "${raw}"`

  const resp = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: 0.0,
    max_tokens:  20,
    stream:      false,
  })

  const reply = resp.choices?.[0]?.message?.content?.trim() ?? 'unknown'
  if (reply === 'unknown') {
    return undefined
  }

  // Validate it’s a real date
  const ms = Date.parse(reply)
  if (isNaN(ms)) {
    return undefined
  }
  return new Date(ms).toISOString()
}
