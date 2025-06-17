import 'dotenv/config'
import { mockVoiceEntries } from '../src/lib/mockData'
import { formatTasks, NewTask } from '../src/lib/formatTasks'

async function demo() {
  const sample = mockVoiceEntries.slice(0, 20)
  const tasks: NewTask[] = await formatTasks(sample)
  // Print as JSON in your terminal:
  console.log(JSON.stringify(tasks, null, 2))
}

demo().catch(console.error)
