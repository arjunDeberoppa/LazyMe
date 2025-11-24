'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import CategoryTodos from '@/components/CategoryTodos'
import TodoDetail from '@/components/TodoDetail'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = params.categoryId as string
  const selectedTodoId = searchParams?.get('todo') || null

  const handleUpdate = () => {
    router.push(`/category/${categoryId}`, { scroll: false })
  }

  const handleTodoSelect = (todoId: string) => {
    router.push(`/category/${categoryId}?todo=${todoId}`, { scroll: false })
  }

  return (
    <>
      {selectedTodoId ? (
        <TodoDetail todoId={selectedTodoId} onUpdate={handleUpdate} />
      ) : (
        <CategoryTodos
          categoryId={categoryId}
          onTodoSelect={handleTodoSelect}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}

