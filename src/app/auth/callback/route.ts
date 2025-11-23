import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Get username from user metadata (stored during signup)
      const username = data.user.user_metadata?.username || null
      const displayName = data.user.user_metadata?.display_name || username || data.user.email?.split('@')[0] || null

      // Create or update profile with username and email after verification
      // Check if profile already exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Only create if it doesn't exist to avoid conflicts
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username,
            display_name: displayName,
            email: data.user.email,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Try to update if insert fails (might already exist)
          await supabase
            .from('profiles')
            .update({
              username: username,
              display_name: displayName,
              email: data.user.email,
            })
            .eq('id', data.user.id)
        }
      } else {
        // Update existing profile with latest metadata
        await supabase
          .from('profiles')
          .update({
            username: username || existingProfile.username,
            display_name: displayName || existingProfile.display_name,
            email: data.user.email || existingProfile.email,
          })
          .eq('id', data.user.id)
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

