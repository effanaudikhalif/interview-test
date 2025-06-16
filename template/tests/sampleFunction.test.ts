// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, it, expect } from 'vitest'
import processEntries from '../src/lib/sampleFunction.js'
import type { VoiceEntry } from '../src/lib/types'

const baseEntry: VoiceEntry = {
  id: '',
  user_id: '',
  audio_url: null,
  transcript_raw: '',
  transcript_user: '',
  language_detected: '',
  language_rendered: '',
  tags_model: [],
  tags_user: [],
  category: null,
  created_at: '',
  updated_at: '',
  emotion_score_score: null,
  embedding: null,
}

describe('processEntries', () => {
  it('handles empty input', () => {
    const result = processEntries([])
    expect(result.summary).toBe('No entries provided.')
    expect(result.tagFrequencies).toEqual({})
  })

  it('aggregates tags from all entries', () => {
    const entries = [
      { ...baseEntry, tags_user: ['a', 'b'] },
      { ...baseEntry, tags_model: ['b', 'c'] },
      { ...baseEntry, tags_user: ['a'] },
    ]

    const result = processEntries(entries)
    expect(result.tagFrequencies).toEqual({ a: 2, b: 2, c: 1 })
    expect(result.summary).toContain('Processed 3 entries')
    expect(result.summary).toContain('unique tags. Top tag: a (2)')
  })
}) 