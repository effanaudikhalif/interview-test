// template/src/lib/parseDueDate.ts

import type OpenAIClient from 'openai'
import { hasRealOpenAIKey } from './openai'

/**
 * parseDueDate
 * ------------
 * Uses OpenAI to convert a natural‑language due‑date hint into an ISO8601 date string,
 * interpreting it relative to the entry’s `created_at` timestamp.
 *
 * @param raw     A free‑form due‑date hint (e.g. "tomorrow", "next Friday at 3pm").
 * @param baseIso The ISO8601 timestamp of the entry’s creation
 *                (e.g. "2025-06-17T12:34:56.000Z").
 * @returns       An ISO8601 date string for the parsed due date, or `undefined`
 *                if no hint was provided or parsing failed.
 */
export async function parseDueDate(
  raw?: string,
  baseIso?: string
): Promise<string | undefined> {
  // If there's no hint or no API key, we can't parse
  if (!raw || !hasRealOpenAIKey()) {
    return undefined
  }

  // Dynamically import the OpenAI SDK
  const { default: OpenAI } = (await import('openai')) as {
    default: typeof OpenAIClient
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  // System prompt: instruct GPT to use the provided reference date
  const system = `
You are a date parsing assistant. You will be given:
  • a "due phrase", e.g. "${raw}"
  • a "reference date" (the entry’s created_at): "${baseIso}"
Interpret the due phrase relative to the reference date and output exactly one ISO8601 date string (e.g. "2025-06-18T15:00:00.000Z"). 
If you cannot parse it, respond with exactly "unknown". Respond with the date only, no extra text.
`.trim()

  // User message includes the phrase to parse
  const user = `Due phrase: "${raw}"`

  // Call the OpenAI chat completion endpoint
  const resp = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: 0.0,
    max_tokens: 20,
    stream:      false,
  })

  // Grab the model's reply
  const reply = resp.choices?.[0]?.message?.content?.trim() ?? 'unknown'
  if (reply.toLowerCase() === 'unknown') {
    return undefined
  }

  // Validate the ISO string
  const ms = Date.parse(reply)
  if (isNaN(ms)) {
    return undefined
  }
  return new Date(ms).toISOString()
}
