'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { Todo } from '@/types/database'

interface CalendarViewProps {
  onTodoSelect: (todoId: string) => void
  onCreateTodo: (date: Date) => void
}

export default function CalendarView({ onTodoSelect, onCreateTodo }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [todos, setTodos] = useState<Todo[]>([])
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const supabase = createClient()

  useEffect(() => {
    loadTodos()
  }, [currentDate])

  const loadTodos = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      const { data } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(monthEnd, 'yyyy-MM-dd'))

      if (data) setTodos(data)
    } catch (error) {
      console.error('Error loading todos:', error)
    }
  }

  const getTodosForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return todos.filter((todo) => todo.scheduled_date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#01eab9'
      case 'in_progress':
        return '#01aaff'
      case 'pending':
        return '#ff7800'
      default:
        return '#9a86ff'
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                viewMode === 'month' ? 'text-white' : 'text-gray-400'
              }`}
              style={viewMode === 'month' ? { backgroundColor: '#9a86ff' } : { backgroundColor: '#2b2b2b' }}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                viewMode === 'week' ? 'text-white' : 'text-gray-400'
              }`}
              style={viewMode === 'week' ? { backgroundColor: '#9a86ff' } : { backgroundColor: '#2b2b2b' }}
            >
              Week
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="rounded-md px-3 py-2 text-white"
              style={{ backgroundColor: '#242424' }}
            >
              ←
            </button>
            <button
              onClick={handleToday}
              className="rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: '#01aaff' }}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-md px-3 py-2 text-white"
              style={{ backgroundColor: '#242424' }}
            >
              →
            </button>
          </div>
          <h2 className="text-xl font-semibold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg" style={{ backgroundColor: '#2b2b2b' }}>
        <div className="grid grid-cols-7 gap-px border-b" style={{ borderColor: '#3a3a3a' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-gray-400"
              style={{ backgroundColor: '#242424' }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {days.map((day, idx) => {
            const dayTodos = getTodosForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={idx}
                className="min-h-24 p-2"
                style={{
                  backgroundColor: isCurrentMonth ? '#2b2b2b' : '#1a1a1a',
                  borderRight: idx % 7 !== 6 ? '1px solid #3a3a3a' : 'none',
                  borderBottom: idx < days.length - 7 ? '1px solid #3a3a3a' : 'none',
                }}
              >
                <div
                  className={`mb-1 text-sm font-medium ${
                    isCurrentMonth ? 'text-white' : 'text-gray-600'
                  } ${isToday ? 'rounded-full bg-blue-500 px-2 py-1 text-white' : ''}`}
                  style={isToday ? {} : {}}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTodos.slice(0, 3).map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => onTodoSelect(todo.id)}
                      className="block w-full truncate rounded px-2 py-1 text-left text-xs text-white transition-colors hover:opacity-80"
                      style={{ backgroundColor: getStatusColor(todo.status) }}
                      title={todo.title}
                    >
                      {todo.title}
                    </button>
                  ))}
                  {dayTodos.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{dayTodos.length - 3} more
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onCreateTodo(day)}
                  className="mt-1 text-xs text-gray-500 hover:text-white"
                >
                  + Add
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#01eab9' }} />
          <span className="text-sm text-gray-300">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#01aaff' }} />
          <span className="text-sm text-gray-300">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: '#ff7800' }} />
          <span className="text-sm text-gray-300">Pending</span>
        </div>
      </div>
    </div>
  )
}

