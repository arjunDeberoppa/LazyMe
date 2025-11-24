'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo, Category, TodoLink } from '@/types/database'
import TodoLinks from './TodoLinks'
import Timer from './Timer'
import NotesCanvas from './NotesCanvas'

interface TodoDetailProps {
  todoId: string | null
  onUpdate: () => void
}

export default function TodoDetail({ todoId, onUpdate }: TodoDetailProps) {
  const [todo, setTodo] = useState<Todo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [links, setLinks] = useState<TodoLink[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    due_time: '',
    start_time: '',
    scheduled_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    priority: '' as 'low' | 'medium' | 'high' | '',
    timer_preset_minutes: '',
    estimated_time_minutes: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (todoId) {
      loadTodo()
      loadCategories()
      loadLinks()
    } else {
      setTodo(null)
      setLinks([])
    }
  }, [todoId])

  const loadTodo = async () => {
    if (!todoId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', todoId)
        .single()

      if (error) throw error
      if (data) {
        setTodo(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category_id: data.category_id || '',
          due_time: data.due_time ? new Date(data.due_time).toISOString().slice(0, 16) : '',
          start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
          scheduled_date: data.scheduled_date || '',
          status: data.status,
          priority: data.priority || '',
          timer_preset_minutes: data.timer_preset_minutes?.toString() || '',
          estimated_time_minutes: data.estimated_time_minutes?.toString() || '',
        })
      }
    } catch (error) {
      console.error('Error loading todo:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadLinks = async () => {
    if (!todoId) return
    try {
      const { data } = await supabase
        .from('todo_links')
        .select('*')
        .eq('todo_id', todoId)
        .order('created_at')

      if (data) setLinks(data)
    } catch (error) {
      console.error('Error loading links:', error)
    }
  }

  const handleSave = async () => {
    if (!todoId) return
    setLoading(true)
    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category_id || null,
        due_time: formData.due_time ? new Date(formData.due_time).toISOString() : null,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        scheduled_date: formData.scheduled_date || null,
        status: formData.status,
        priority: formData.priority || null,
        timer_preset_minutes: formData.timer_preset_minutes ? parseInt(formData.timer_preset_minutes) : null,
        estimated_time_minutes: formData.estimated_time_minutes ? parseInt(formData.estimated_time_minutes) : null,
      }

      if (formData.status === 'completed' && !todo?.completed_at) {
        updateData.completed_at = new Date().toISOString()
      } else if (formData.status !== 'completed') {
        updateData.completed_at = null
      }

      const { error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todoId)

      if (error) throw error
      setEditing(false)
      loadTodo()
      onUpdate()
    } catch (error) {
      console.error('Error saving todo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!todoId || !confirm('Are you sure you want to delete this todo?')) return
    try {
      const { error } = await supabase.from('todos').delete().eq('id', todoId)
      if (error) throw error
      onUpdate()
      setTodo(null)
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  if (!todoId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Select a todo to view details</p>
      </div>
    )
  }

  if (loading && !todo) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!todo) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Todo not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Todo Details</h2>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#01eab9' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  loadTodo()
                }}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-gray-300"
                style={{ backgroundColor: '#2b2b2b' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: '#9a86ff' }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: '#ff7800' }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
            />
          ) : (
            <p className="text-white">{todo.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          {editing ? (
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
            />
          ) : (
            <p className="text-gray-300">{todo.description || 'No description'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          {editing ? (
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-300">
              {categories.find((c) => c.id === todo.category_id)?.name || 'No category'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            {editing ? (
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <p className="text-gray-300 capitalize">{todo.status.replace('_', ' ')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            {editing ? (
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
              >
                <option value="">No priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <p className="text-gray-300 capitalize">{todo.priority || 'No priority'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            {editing ? (
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
              />
            ) : (
              <p className="text-gray-300">
                {todo.start_time ? new Date(todo.start_time).toLocaleString() : 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Time</label>
            {editing ? (
              <input
                type="datetime-local"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
              />
            ) : (
              <p className="text-gray-300">
                {todo.due_time ? new Date(todo.due_time).toLocaleString() : 'Not set'}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date</label>
          {editing ? (
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
            />
          ) : (
            <p className="text-gray-300">
              {todo.scheduled_date ? new Date(todo.scheduled_date).toLocaleDateString() : 'Not set'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timer Preset (minutes)</label>
            {editing ? (
              <input
                type="number"
                value={formData.timer_preset_minutes}
                onChange={(e) => setFormData({ ...formData, timer_preset_minutes: e.target.value })}
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
                placeholder="e.g. 25"
              />
            ) : (
              <p className="text-gray-300">
                {todo.timer_preset_minutes ? `${todo.timer_preset_minutes} minutes` : 'Not set'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Time (minutes)</label>
            {editing ? (
              <input
                type="number"
                value={formData.estimated_time_minutes}
                onChange={(e) => setFormData({ ...formData, estimated_time_minutes: e.target.value })}
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#2b2b2b', border: '1px solid #3a3a3a' }}
                placeholder="e.g. 30"
                min="0"
              />
            ) : (
              <p className="text-gray-300">
                {todo.estimated_time_minutes ? `${todo.estimated_time_minutes} minutes` : 'Not set'}
              </p>
            )}
          </div>
        </div>

        <TodoLinks todoId={todoId} onUpdate={loadLinks} />
      </div>

      <div className="mt-8">
        <NotesCanvas todoId={todoId} onUpdate={loadTodo} />
      </div>

      <div className="mt-8">
        <Timer
          presetMinutes={todo.timer_preset_minutes}
          onComplete={() => {
            // Optional: suggest marking as completed
            if (confirm('Timer finished! Mark this todo as completed?')) {
              setFormData({ ...formData, status: 'completed' })
              handleSave()
            }
          }}
        />
      </div>
    </div>
  )
}

