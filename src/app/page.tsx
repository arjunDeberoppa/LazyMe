'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import TodoDetail from '@/components/TodoDetail'
import CreateTodo from '@/components/CreateTodo'
import CategoryTodos from '@/components/CategoryTodos'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedTodoId(null)
    if (selectedCategoryId) {
      setSelectedCategoryId(null)
    }
  }

  const handleCategoryDeleted = () => {
    setSelectedCategoryId(null)
    setSelectedTodoId(null)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <Sidebar
        key={refreshKey}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
        selectedTodoId={selectedTodoId}
        onTodoSelect={setSelectedTodoId}
        onCategoryDeleted={handleCategoryDeleted}
      />
      <div className="flex-1 overflow-y-auto">
        {selectedTodoId ? (
          <TodoDetail todoId={selectedTodoId} onUpdate={handleUpdate} />
        ) : selectedCategoryId ? (
          <CategoryTodos
            categoryId={selectedCategoryId}
            onTodoSelect={setSelectedTodoId}
            onUpdate={handleUpdate}
          />
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
