'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract category ID from pathname
  const categoryIdMatch = pathname?.match(/^\/category\/([^/]+)/)
  const selectedCategoryId = categoryIdMatch ? categoryIdMatch[1] : null

  // Extract todo ID from query params
  const selectedTodoId = searchParams?.get('todo') || null

  const handleCategorySelect = (id: string | null) => {
    if (id) {
      router.push(`/category/${id}`)
    } else {
      router.push('/')
    }
  }

  const handleTodoSelect = (id: string | null) => {
    if (id && selectedCategoryId) {
      router.push(`/category/${selectedCategoryId}?todo=${id}`)
    } else if (id) {
      router.push(`/?todo=${id}`)
    } else {
      // Clear todo selection
      if (selectedCategoryId) {
        router.push(`/category/${selectedCategoryId}`)
      } else {
        router.push('/')
      }
    }
  }

  const handleCategoryDeleted = () => {
    router.push('/')
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#242424' }}>
      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
        selectedTodoId={selectedTodoId}
        onTodoSelect={handleTodoSelect}
        onCategoryDeleted={handleCategoryDeleted}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

