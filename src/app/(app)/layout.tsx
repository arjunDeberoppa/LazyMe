import { Suspense } from 'react'
import AppLayout from '@/components/AppLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppLayout>{children}</AppLayout>
    </Suspense>
  )
}

