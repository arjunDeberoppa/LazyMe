'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isMagicLink, setIsMagicLink] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const getEmailFromUsername = async (username: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      if (error || !data) return null

      // Get the email from auth.users using the profile id
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(data.id)
      if (authError || !authData) return null

      // For client-side, we need a different approach
      // We'll use a function that checks if username exists and returns the user
      // Actually, we can't directly query auth.users from client
      // So we'll need to create a server action or API route
      // For now, let's use a workaround: try to sign in with username@temp.com and handle it server-side
      // Better approach: create an API route to get email from username
      return null
    } catch (error) {
      return null
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!username.trim() || !email.trim() || !password.trim()) {
      setMessage('Please fill in all fields')
      setLoading(false)
      return
    }

    // Validate username format
    const usernameRegex = /^[A-Za-z0-9_]{3,30}$/
    if (!usernameRegex.test(username)) {
      setMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores')
      setLoading(false)
      return
    }

    try {
      // Sign up with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile with username and email
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            username: username.toLowerCase(),
            display_name: username,
            email: email, // Store email for username lookup
          })

        if (profileError) {
          // If profile creation fails, we might need to handle it
          console.error('Profile creation error:', profileError)
          // Still proceed as the user is created
        }

        setMessage('Account created! Please check your email to verify your account.')
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let loginEmail = email

      // Check if input is a username (contains no @) or email
      if (!email.includes('@')) {
        // It's a username, get the email from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email.toLowerCase())
          .single()

        if (profileError || !profileData || !profileData.email) {
          throw new Error('Username not found')
        }

        loginEmail = profileData.email
      }

      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email: loginEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the login link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
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

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setIsSignup(false)
              setMessage('')
              setEmail('')
              setUsername('')
              setPassword('')
            }}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 font-medium transition-colors ${
              !isSignup
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={!isSignup ? { backgroundColor: '#9a86ff' } : { backgroundColor: '#242424' }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignup(true)
              setMessage('')
              setEmail('')
              setUsername('')
              setPassword('')
            }}
            className={`flex-1 cu rounded-md px-4 py-2 font-medium transition-colors ${
              isSignup
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            style={isSignup ? { backgroundColor: '#9a86ff' } : { backgroundColor: '#242424' }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md px-4 py-2 text-white"
                style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
                placeholder="username"
                pattern="[A-Za-z0-9_]{3,30}"
                title="3-30 characters, letters, numbers, and underscores only"
              />
              <p className="mt-1 text-xs text-gray-500">
                3-30 characters, letters, numbers, and underscores only
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {isSignup ? 'Email' : 'Email or Username'}
            </label>
            <input
              id="email"
              type={isSignup ? 'email' : 'text'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md px-4 py-2 text-white"
              style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
              placeholder={isSignup ? 'you@example.com' : 'email@example.com or username'}
            />
          </div>

          {(!isMagicLink || isSignup) && (
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
                minLength={isSignup ? 6 : undefined}
              />
              {isSignup && (
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md px-4 py-2 font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#9a86ff' }}
          >
            {loading
              ? 'Loading...'
              : isSignup
              ? 'Sign Up'
              : isMagicLink
              ? 'Send Magic Link'
              : 'Sign In'}
          </button>

          {!isSignup && (
            <button
              type="button"
              onClick={() => setIsMagicLink(!isMagicLink)}
              className="w-full text-sm text-gray-400 hover:text-gray-300"
            >
              {isMagicLink ? 'Use password instead' : 'Use magic link instead'}
            </button>
          )}
        </form>

        {message && (
          <p className={`mt-4 text-sm ${message.toLowerCase().includes('error') || message.toLowerCase().includes('not found') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
