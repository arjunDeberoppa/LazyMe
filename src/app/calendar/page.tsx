'use client'

import { useState } from 'react'
import CalendarView from '@/components/CalendarView'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CalendarPage() {
  const router = useRouter()
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)

  const handleTodoSelect = (todoId: string) => {
    router.push(`/?todo=${todoId}`)
  }

  const handleCreateTodo = (date: Date) => {
    // Navigate to home with date pre-filled
    router.push(`/?create=true&date=${date.toISOString()}`)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <div className="flex-1">
        <div className="border-b p-4" style={{ borderColor: '#3a3a3a', backgroundColor: '#2b2b2b' }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
            style={{ backgroundColor: '#9a86ff' }}
          >
            ← Back to Dashboard
          </Link>
        </div>
        <CalendarView onTodoSelect={handleTodoSelect} onCreateTodo={handleCreateTodo} />
      </div>
    </div>
  )
}

