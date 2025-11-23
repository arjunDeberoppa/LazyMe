'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(true)
  const [loading, setLoading] = useState(false)
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

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error('Please fill in all fields')
      setLoading(false)
      return
    }

    // Validate username format
    const usernameRegex = /^[A-Za-z0-9_]{3,30}$/
    if (!usernameRegex.test(username)) {
      toast.error('Username must be 3-30 characters and contain only letters, numbers, and underscores')
      setLoading(false)
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Sign up with email and password
      // Store username in user metadata so we can create profile after verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username.toLowerCase(),
            display_name: username,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Profile will be created after email verification in the callback
        toast.success('Verify your email! An email has been sent to you to verify your account.')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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
        toast.success('Check your email! A login link has been sent to you.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        })
        if (signInError) throw signInError

        // Ensure profile exists (fallback in case it wasn't created during verification)
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existingProfile) {
            // Create profile if it doesn't exist
            const username = user.user_metadata?.username || null
            const displayName = user.user_metadata?.display_name || username || user.email?.split('@')[0] || null

            const insertData: any = {
              id: user.id,
              display_name: displayName,
            }
            
            // Only add username if it's valid and matches the constraint
            if (username && /^[A-Za-z0-9_]{3,30}$/.test(username)) {
              insertData.username = username
            }

            await supabase.from('profiles').insert(insertData)
          }
        }

        toast.success('Login successful!')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
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
              setEmail('')
              setUsername('')
              setPassword('')
              setConfirmPassword('')
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
              setEmail('')
              setUsername('')
              setPassword('')
              setConfirmPassword('')
            }}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 font-medium transition-colors ${
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
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-md px-4 py-2 pr-10 text-white"
                    style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
                    placeholder="••••••••"
                    minLength={isSignup ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {isSignup && (
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                )}
              </div>

              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-md px-4 py-2 pr-10 text-white"
                      style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="mt-1 text-xs text-green-400">Passwords match</p>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-md px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full cursor-pointer text-sm text-gray-400 hover:text-gray-300"
            >
              {isMagicLink ? 'Use password instead' : 'Use magic link instead'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
