'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Category, Todo } from '@/types/database'

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
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

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

  useEffect(() => {
    // Reload when refresh happens (listen to storage events or use a different mechanism)
    const interval = setInterval(() => {
      loadData()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategoryName.trim(),
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setCategories([...categories, data])
        setNewCategoryName('')
        setShowNewCategory(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
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

      <div className="border-b p-2" style={{ borderColor: '#3a3a3a' }}>
        <a
          href="/calendar"
          className="block rounded-md px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
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
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="cursor-pointer text-xs text-gray-400 hover:text-white"
            >
              {showNewCategory ? 'Cancel' : '+'}
            </button>
          </div>
          {showNewCategory && (
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                placeholder="Category name"
                className="flex-1 rounded-md px-2 py-1 text-sm text-white"
                style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
                autoFocus
              />
              <button
                onClick={handleCreateCategory}
                className="cursor-pointer rounded-md px-2 py-1 text-sm text-white"
                style={{ backgroundColor: '#9a86ff' }}
              >
                Add
              </button>
            </div>
          )}
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => {
                onCategorySelect(category.id)
                onTodoSelect(null)
              }}
              className={`mb-1 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
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
                <button
                  key={todo.id}
                  onClick={() => onTodoSelect(todo.id)}
                  className={`w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

