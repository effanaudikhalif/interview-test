// template/src/lib/formatTasks.ts

import { VoiceEntry } from './types'
import { extractTask } from './taskExtractor'
import { parseDueDate } from './parseDueDate'
import { categorize }   from './categorize'

/**
 * NewTask
 * -------
 * Shape of the object you’ll insert into your Supabase `tasks` table,
 * now simplified to drop any entry_id linkage.
 */
export interface NewTask {
  task_text: string
  due_date?: string       // ISO timestamp, if parsed
  status:    'pending' | 'done'
  category:  string
}

/**
 * formatTasks
 * -----------
 * Pure function: for each journal entry, it:
 * 1) extracts the action phrase (or falls back to full text),
 * 2) parses a due date if hinted (or undefined),
 * 3) classifies the task,
 * 4) builds a NewTask object.
 */
export async function formatTasks(entries: VoiceEntry[]): Promise<NewTask[]> {
  const tasks: NewTask[] = []

  for (const e of entries) {
    // 1) Extract just the task phrase
    const task_text = await extractTask(e.transcript_user || e.transcript_raw)
    if (!task_text) continue

    // 2) Parse any due‑date hint
    //    (note: extractTask no longer returns raw_due, so we pass undefined;
    //     you can modify extractTask to return raw_due if you like)
    const due_date = await parseDueDate(undefined)

    // 3) Categorize via GPT or fallback
    const category = await categorize(task_text)

    // 4) Assemble the NewTask record
    tasks.push({
      task_text,
      due_date,
      status: 'pending',
      category,
    })
  }

  return tasks
}
