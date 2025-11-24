'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: () => void
}

export default function CategoryModal({ isOpen, onClose, onCategoryCreated }: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        name: categoryName.trim(),
      })

      if (error) throw error

      toast.success('Category created successfully!')
      setCategoryName('')
      onCategoryCreated()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: '#2b2b2b' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Category</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
              placeholder="Enter category name"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md px-4 py-2 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9a86ff' }}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md px-4 py-2 font-medium text-gray-300"
              style={{ backgroundColor: '#242424' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

