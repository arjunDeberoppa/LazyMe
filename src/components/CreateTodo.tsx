'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/database'

interface CreateTodoProps {
  onTodoCreated: () => void
  defaultCategoryId?: string | null
}

export default function CreateTodo({ onTodoCreated, defaultCategoryId }: CreateTodoProps) {
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: defaultCategoryId || '',
    due_time: '',
    scheduled_date: '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    timer_preset_minutes: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadCategories()
    if (defaultCategoryId) {
      setFormData((prev) => ({ ...prev, category_id: defaultCategoryId }))
    }
  }, [defaultCategoryId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const insertData: any = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category_id || null,
        due_time: formData.due_time ? new Date(formData.due_time).toISOString() : null,
        scheduled_date: formData.scheduled_date || null,
        priority: formData.priority || null,
        timer_preset_minutes: formData.timer_preset_minutes
          ? parseInt(formData.timer_preset_minutes)
          : null,
        status: 'pending',
      }

      const { error } = await supabase.from('todos').insert(insertData)

      if (error) throw error

      // Reset form
      setFormData({
        title: '',
        description: '',
        category_id: defaultCategoryId || '',
        due_time: '',
        scheduled_date: '',
        priority: '',
        timer_preset_minutes: '',
      })
      setShowForm(false)
      onTodoCreated()
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="rounded-md px-4 py-2 font-medium text-white"
        style={{ backgroundColor: '#01aaff' }}
      >
        + New Todo
      </button>
    )
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: '#2b2b2b' }}
    >
      <h3 className="mb-4 text-lg font-semibold text-white">Create New Todo</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-md px-4 py-2 text-white"
            style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            placeholder="Todo title"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-md px-4 py-2 text-white"
            style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            >
              <option value="">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Due Time</label>
            <input
              type="datetime-local"
              value={formData.due_time}
              onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timer Preset (minutes)</label>
          <input
            type="number"
            value={formData.timer_preset_minutes}
            onChange={(e) => setFormData({ ...formData, timer_preset_minutes: e.target.value })}
            className="w-full rounded-md px-4 py-2 text-white"
            style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            placeholder="e.g. 25"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md px-4 py-2 font-medium text-white"
            style={{ backgroundColor: '#01eab9' }}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setFormData({
                title: '',
                description: '',
                category_id: defaultCategoryId || '',
                due_time: '',
                scheduled_date: '',
                priority: '',
                timer_preset_minutes: '',
              })
            }}
            className="rounded-md px-4 py-2 font-medium text-gray-300"
            style={{ backgroundColor: '#242424' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

