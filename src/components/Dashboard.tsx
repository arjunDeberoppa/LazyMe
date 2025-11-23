'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/types/database'

export default function Dashboard() {
  const [nextTask, setNextTask] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNextTask()
  }, [])

  const loadNextTask = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get the next upcoming todo based on due_time and status
      const { data } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_time', { ascending: true, nullsFirst: false })
        .limit(1)
        .single()

      setNextTask(data || null)
    } catch (error) {
      console.error('Error loading next task:', error)
      setNextTask(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Dashboard</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">Next Task</h2>
        {nextTask ? (
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: '#2b2b2b' }}
          >
            <h3 className="mb-2 text-lg font-semibold text-white">{nextTask.title}</h3>
            {nextTask.description && (
              <p className="mb-4 text-gray-300">{nextTask.description}</p>
            )}
            {nextTask.due_time && (
              <p className="text-sm text-gray-400">
                Due: {new Date(nextTask.due_time).toLocaleString()}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: '#9a86ff' }}
              >
                {nextTask.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-lg p-6 text-center"
            style={{ backgroundColor: '#2b2b2b' }}
          >
            <p className="text-gray-400">No upcoming tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

