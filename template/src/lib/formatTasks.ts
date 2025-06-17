// template/src/lib/formatTasks.ts

import { VoiceEntry } from './types'
import { extractTask, ExtractedTask } from './taskExtractor'
import { parseDueDate }                from './parseDueDate'
import { categorize }                  from './categorize'

/**
 * NewTask
 * -------
 * The final shape for each extracted to‑do:
 */
export interface NewTask {
  task_text: string
  due_date?: string
  status:    'pending' | 'done'
  category:  string
}

/**
 * formatTasks
 * -----------
 * For each VoiceEntry, uses GPT helpers to:
 *  1) extract { task_text, raw_due } (or skip if null),
 *  2) parse raw_due relative to that entry’s created_at,
 *  3) categorize the task_text,
 *  4) return an array of NewTask objects.
 */
export async function formatTasks(entries: VoiceEntry[]): Promise<NewTask[]> {
  const tasks: NewTask[] = []

  for (const e of entries) {
    // 1) Extract task + raw due hint via GPT
    const hit: ExtractedTask | null = await extractTask(
      e.transcript_user || e.transcript_raw
    )
    if (!hit) continue

    const { task_text, raw_due } = hit

    // 2) Parse due_date relative to entry.created_at
    const due_date = await parseDueDate(raw_due, e.created_at)

    // 3) Classify via GPT or fallback
    const category = await categorize(task_text)

    // 4) Assemble the record
    tasks.push({
      task_text,
      due_date,
      status:   'pending',
      category,
    })
  }

  return tasks
}
