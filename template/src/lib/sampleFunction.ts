import { VoiceEntry, ProcessedResult } from './types'

/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic.
 */
export function processEntries(entries: VoiceEntry[]): ProcessedResult {
  const tagFrequencies: Record<string, number> = {}
  for (const entry of entries) {
    for (const tag of [...entry.tags_user, ...entry.tags_model]) {
      if (!tag) continue
      tagFrequencies[tag] = (tagFrequencies[tag] ?? 0) + 1
    }
  }
  let topTag = ''
  let topCount = 0
  for (const [tag, count] of Object.entries(tagFrequencies)) {
    if (count > topCount) {
      topTag = tag
      topCount = count
    }
  }

  const unique = Object.keys(tagFrequencies).length
  const summary =
    entries.length === 0
      ? 'No entries provided.'
      : `Processed ${entries.length} entries with ${unique} unique tags. Top tag: ${topTag} (${topCount}).`

  return { summary, tagFrequencies }
}


export default processEntries 