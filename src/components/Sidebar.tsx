'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import type { Category } from '@/types/database'
import CategoryModal from './CategoryModal'

interface SidebarProps {
  selectedCategoryId: string | null
  onCategorySelect: (categoryId: string | null) => void
  selectedTodoId: string | null
  onTodoSelect: (todoId: string | null) => void
  onCategoryDeleted?: () => void
}

export default function Sidebar({
  selectedCategoryId,
  onCategorySelect,
  selectedTodoId,
  onTodoSelect,
  onCategoryDeleted,
}: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadData()
  }, [])

  const handleCategoryCreated = () => {
    loadData()
    router.refresh()
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
          {categories.map((category, index) => {
            const isSelected = selectedCategoryId === category.id || pathname === `/category/${category.id}`
            return (
              <button
                key={category.id}
                onClick={() => {
                  router.push(`/category/${category.id}`)
                  onCategorySelect(category.id)
                  onTodoSelect(null)
                }}
                className={`mb-1 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: category.color || getAccentColor(index),
                        color: '#ffffff',
                      }
                    : {}
                }
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t p-4" style={{ borderColor: '#3a3a3a' }}>
        <button
          onClick={handleLogout}
          className="w-full cursor-pointer rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  )
}

