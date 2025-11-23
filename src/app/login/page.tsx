'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isMagicLink, setIsMagicLink] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the login link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#242424' }}>
      <div className="w-full max-w-md rounded-lg p-8" style={{ backgroundColor: '#2b2b2b' }}>
        <h1 className="mb-6 text-3xl font-bold text-white">LazyMe</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
              placeholder="you@example.com"
            />
          </div>
          {!isMagicLink && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
                placeholder="••••••••"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#9a86ff' }}
          >
            {loading ? 'Loading...' : isMagicLink ? 'Send Magic Link' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="w-full text-sm text-gray-400 hover:text-gray-300"
          >
            {isMagicLink ? 'Use password instead' : 'Use magic link instead'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

