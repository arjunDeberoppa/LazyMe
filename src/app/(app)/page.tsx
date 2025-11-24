'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import TodoDetail from '@/components/TodoDetail'
import CreateTodo from '@/components/CreateTodo'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedTodoId = searchParams?.get('todo') || null

  const handleUpdate = () => {
    router.push('/', { scroll: false })
  }

  return (
    <>
      {selectedTodoId ? (
        <TodoDetail todoId={selectedTodoId} onUpdate={handleUpdate} />
      ) : (
        <div className="p-8">
          <div className="mb-6">
            <CreateTodo onTodoCreated={handleUpdate} />
          </div>
          <Dashboard />
        </div>
      )}
    </>
  )
}
