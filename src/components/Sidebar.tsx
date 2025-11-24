'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type { Category, Todo } from '@/types/database'
import CategoryModal from './CategoryModal'

interface SidebarProps {
  selectedCategoryId: string | null
  onCategorySelect: (categoryId: string | null) => void
  selectedTodoId: string | null
  onTodoSelect: (todoId: string | null) => void
}

export default function Sidebar({
  selectedCategoryId,
  onCategorySelect,
  selectedTodoId,
  onTodoSelect,
}: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const handleCategoryCreated = () => {
    loadData()
    router.refresh()
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This will also remove all todos in this category.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast.success('Category deleted successfully')
      loadData()
      router.refresh()
      
      // Clear selection if deleted category was selected
      if (selectedCategoryId === categoryId) {
        onCategorySelect(null)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category')
    }
  }

  const handleDeleteTodo = async (todoId: string, todoTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${todoTitle}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)

      if (error) throw error

      toast.success('Todo deleted successfully')
      loadData()
      router.refresh()
      
      // Clear selection if deleted todo was selected
      if (selectedTodoId === todoId) {
        onTodoSelect(null)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete todo')
    }
  }

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (categoriesData) setCategories(categoriesData)

      // Load todos
      const { data: todosData } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('due_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (todosData) setTodos(todosData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const filteredTodos = selectedCategoryId
    ? todos.filter((todo) => todo.category_id === selectedCategoryId)
    : todos

  const getAccentColor = (index: number) => {
    const colors = ['#ff68a6', '#ff7800', '#9a86ff', '#01eab9', '#01aaff']
    return colors[index % colors.length]
  }

  return (
    <div
      className="flex h-screen w-64 flex-col border-r"
      style={{ backgroundColor: '#2b2b2b', borderColor: '#3a3a3a' }}
    >
      <div className="flex items-center justify-between border-b p-4" style={{ borderColor: '#3a3a3a' }}>
        <h1 className="text-xl font-bold text-white">LazyMe</h1>
        <button
          onClick={handleLogout}
          className="cursor-pointer rounded px-2 py-1 text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>
      </div>

      <div className="border-b p-2 space-y-1" style={{ borderColor: '#3a3a3a' }}>
        <a
          href="/"
          className="block rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        >
          🏠 Dashboard
        </a>
        <a
          href="/calendar"
          className="block rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        >
          📅 Calendar
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <button
            onClick={() => {
              onCategorySelect(null)
              onTodoSelect(null)
            }}
            className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
              selectedCategoryId === null
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={
              selectedCategoryId === null
                ? { backgroundColor: '#242424' }
                : {}
            }
          >
            All Tasks
          </button>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Categories</h2>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="cursor-pointer text-lg font-bold text-gray-400 hover:text-white transition-colors"
              style={{ fontSize: '20px', lineHeight: '1' }}
            >
              +
            </button>
          </div>
          {categories.map((category, index) => (
            <div key={category.id} className="mb-1 flex items-center gap-1 group">
              <button
                onClick={() => {
                  onCategorySelect(category.id)
                  onTodoSelect(null)
                }}
                className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategoryId === category.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={
                  selectedCategoryId === category.id
                    ? {
                        backgroundColor: category.color || getAccentColor(index),
                        color: '#ffffff',
                      }
                    : {}
                }
              >
                {category.name}
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id, category.name)}
                className="cursor-pointer opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-2 transition-opacity"
                title="Delete category"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Todos</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-sm text-gray-500">No todos</div>
          ) : (
            <div className="space-y-1">
              {filteredTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-1 group">
                  <button
                    onClick={() => onTodoSelect(todo.id)}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedTodoId === todo.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={
                      selectedTodoId === todo.id
                        ? { backgroundColor: '#242424' }
                        : {}
                    }
                  >
                    <div className="truncate">{todo.title}</div>
                    {todo.due_time && (
                      <div className="text-xs text-gray-500">
                        {new Date(todo.due_time).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteTodo(todo.id, todo.title, e)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-2 transition-opacity"
                    title="Delete todo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  )
}

