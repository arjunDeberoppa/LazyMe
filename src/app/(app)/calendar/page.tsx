'use client'

import CalendarView from '@/components/CalendarView'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const router = useRouter()

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
    <CalendarView 
      onTodoSelect={handleTodoSelect} 
      onCreateTodo={handleCreateTodo}
      onBackToDashboard={handleBackToDashboard}
    />
  )
}

