'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import TodoDetail from '@/components/TodoDetail'
import CreateTodo from '@/components/CreateTodo'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedTodoId(null)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <Sidebar
        key={refreshKey}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
        selectedTodoId={selectedTodoId}
        onTodoSelect={setSelectedTodoId}
      />
      <div className="flex-1 overflow-y-auto">
        {selectedTodoId ? (
          <TodoDetail todoId={selectedTodoId} onUpdate={handleUpdate} />
        ) : (
          <div className="p-8">
            <div className="mb-6">
              <CreateTodo onTodoCreated={handleUpdate} defaultCategoryId={selectedCategoryId} />
            </div>
            <Dashboard />
          </div>
        )}
      </div>
    </div>
  )
}
