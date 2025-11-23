export type Category = {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export type Todo = {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  created_at: string
  start_time: string | null
  due_time: string | null
  scheduled_date: string | null
  completed_at: string | null
  status: 'pending' | 'in_progress' | 'completed'
  timing_result: 'early' | 'on_time' | 'late' | 'not_completed'
  timer_preset_minutes: number | null
  timer_custom_seconds: number | null
  timer_sound: string
  priority: 'low' | 'medium' | 'high' | null
  notes_canvas?: any // JSON data for notes canvas
}

export type TodoLink = {
  id: string
  user_id: string
  todo_id: string
  label: string
  url: string
  type: 'website' | 'youtube' | 'other'
  created_at: string
}

