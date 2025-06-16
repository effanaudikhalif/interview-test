// eslint-disable-next-line import/no-extraneous-dependenciesAdd commentMore actions
import { describe, it, expect } from 'vitest'
import { mockVoiceEntries } from '../src/lib/mockData.js'
import processEntries from '../src/lib/sampleFunction.js'

describe('processEntries', () => {
  it('returns empty frequencies and correct summary when no tags are present', () => {
    const result = processEntries(mockVoiceEntries)

    // With every entry having [] for tags_user and tags_model:
    expect(result.tagFrequencies).toEqual({})

    // summary should reflect 0 unique tags
    expect(result.summary).toBe(
      `Processed ${mockVoiceEntries.length} entries with 0 unique tags. Top tag:  (0).`
    )
  })

  it('counts reflection tag correctly when provided', () => {
    // Create a new fixture where every entry has exactly one "reflection" tag
    const withReflection = mockVoiceEntries.map(entry => ({
      ...entry,
      tags_model: ['reflection'],
      tags_user: [],
    }))

    const result = processEntries(withReflection)

    // Every entry contributed one "reflection"
    expect(result.tagFrequencies).toHaveProperty('reflection', withReflection.length)

    // summary should report 1 unique tag and "reflection" as the top tag
    expect(result.summary).toBe(
      `Processed ${withReflection.length} entries with 1 unique tags. Top tag: reflection (${withReflection.length}).`
    )
  })
})