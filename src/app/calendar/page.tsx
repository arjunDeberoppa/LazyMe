'use client'

import { useState } from 'react'
import CalendarView from '@/components/CalendarView'
import { useRouter } from 'next/navigation'

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

  const handleBackToDashboard = () => {
    router.push('/')
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <div className="flex-1">
        <CalendarView 
          onTodoSelect={handleTodoSelect} 
          onCreateTodo={handleCreateTodo}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    </div>
  )
}

