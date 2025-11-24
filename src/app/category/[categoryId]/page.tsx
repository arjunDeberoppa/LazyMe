'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CategoryTodos from '@/components/CategoryTodos'
import TodoDetail from '@/components/TodoDetail'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Handle URL query params for todo selection
    const urlParams = new URLSearchParams(window.location.search)
    const todoId = urlParams.get('todo')
    if (todoId) {
      setSelectedTodoId(todoId)
    }
  }, [])

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1)
    setSelectedTodoId(null)
    // Clear todo from URL
    router.push(`/category/${categoryId}`, { scroll: false })
  }

  const handleTodoSelect = (todoId: string) => {
    setSelectedTodoId(todoId)
    router.push(`/category/${categoryId}?todo=${todoId}`, { scroll: false })
  }

  const handleCategoryDeleted = () => {
    router.push('/')
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <Sidebar
        key={refreshKey}
        selectedCategoryId={categoryId}
        onCategorySelect={(id) => {
          if (id) {
            router.push(`/category/${id}`)
          } else {
            router.push('/')
          }
        }}
        selectedTodoId={selectedTodoId}
        onTodoSelect={setSelectedTodoId}
        onCategoryDeleted={handleCategoryDeleted}
      />
      <div className="flex-1 overflow-y-auto">
        {selectedTodoId ? (
          <TodoDetail todoId={selectedTodoId} onUpdate={handleUpdate} />
        ) : (
          <CategoryTodos
            key={refreshKey}
            categoryId={categoryId}
            onTodoSelect={handleTodoSelect}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  )
}

