'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-toastify'
import type { Todo, Category } from '@/types/database'
import DeleteConfirmModal from './DeleteConfirmModal'
import CreateTodo from './CreateTodo'

interface CategoryTodosProps {
  categoryId: string | null
  onTodoSelect: (todoId: string) => void
  onUpdate: () => void
}

export default function CategoryTodos({ categoryId, onTodoSelect, onUpdate }: CategoryTodosProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'category' | 'todo' | null
    itemId: string | null
    itemName: string
  }>({
    isOpen: false,
    type: null,
    itemId: null,
    itemName: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (categoryId) {
      loadData()
    } else {
      setTodos([])
      setCategory(null)
      setLoading(false)
    }
  }, [categoryId])

  const loadData = async () => {
    if (!categoryId) return
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single()

      if (categoryData) setCategory(categoryData)

      // Load todos for this category
      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .order('due_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (todosData) setTodos(todosData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryId || !category) return

    try {
      // First delete all todos in this category
      const { error: todosError } = await supabase
        .from('todos')
        .delete()
        .eq('category_id', categoryId)

      if (todosError) throw todosError

      // Then delete the category
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (categoryError) throw categoryError

      toast.success('Category deleted successfully')
      onUpdate()
      // Navigate back to dashboard after deletion
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category')
    }
  }

  const handleDeleteTodo = async () => {
    if (!deleteModal.itemId) return

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', deleteModal.itemId)

      if (error) throw error

      toast.success('Todo deleted successfully')
      loadData()
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete todo')
    }
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

  if (!categoryId) {
    return null
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Category not found</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4 justify-between w-full">
          <h1
            className="text-3xl font-bold text-white px-4 py-2 rounded-md"
            style={{ backgroundColor: category.color || '#9a86ff' }}
          >
            {category.name}
          </h1>
          <button
            onClick={() =>
              setDeleteModal({
                isOpen: true,
                type: 'category',
                itemId: categoryId,
                itemName: category.name,
              })
            }
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
            style={{ backgroundColor: '#ff7800' }}
          >
            Delete Category
          </button>
        </div>
      </div>

      <div className="mb-6">
        <CreateTodo onTodoCreated={() => { loadData(); onUpdate(); }} defaultCategoryId={categoryId} />
      </div>

      {todos.length === 0 ? (
        <div className="text-gray-400">No todos in this category</div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#2b2b2b' }}
              onClick={() => onTodoSelect(todo.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(todo.status) }}
                  />
                  <h3 className="text-lg font-medium text-white">{todo.title}</h3>
                </div>
                {todo.description && (
                  <p className="mt-1 text-sm text-gray-400">{todo.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  {todo.due_time && (
                    <span>Due: {new Date(todo.due_time).toLocaleDateString()}</span>
                  )}
                  {todo.estimated_time_minutes && (
                    <span>Est: {todo.estimated_time_minutes} min</span>
                  )}
                  <span className="capitalize">{todo.status}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteModal({
                    isOpen: true,
                    type: 'todo',
                    itemId: todo.id,
                    itemName: todo.title,
                  })
                }}
                className="cursor-pointer rounded-md px-3 py-1 text-sm font-medium text-white hover:opacity-80 transition-opacity ml-4"
                style={{ backgroundColor: '#ff7800' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen && deleteModal.type === 'category'}
        onClose={() =>
          setDeleteModal({ isOpen: false, type: null, itemId: null, itemName: '' })
        }
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will also remove all todos in this category."
        itemName={deleteModal.itemName}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen && deleteModal.type === 'todo'}
        onClose={() =>
          setDeleteModal({ isOpen: false, type: null, itemId: null, itemName: '' })
        }
        onConfirm={handleDeleteTodo}
        title="Delete Todo"
        message="Are you sure you want to delete this todo?"
        itemName={deleteModal.itemName}
      />
    </div>
  )
}

