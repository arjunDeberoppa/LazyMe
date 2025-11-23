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
        // Only insert username if it's valid (not null and matches format)
        const insertData: any = {
          id: data.user.id,
          display_name: displayName,
        }
        
        // Only add username if it's valid and matches the constraint
        if (username && /^[A-Za-z0-9_]{3,30}$/.test(username)) {
          insertData.username = username
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(insertData)

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Try to update if insert fails (might already exist)
          const updateData: any = {
            display_name: displayName,
          }
          if (username && /^[A-Za-z0-9_]{3,30}$/.test(username)) {
            updateData.username = username
          }
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id)
        }
      } else {
        // Update existing profile with latest metadata
        const updateData: any = {
          display_name: displayName || existingProfile.display_name,
        }
        // Only update username if it's valid
        if (username && /^[A-Za-z0-9_]{3,30}$/.test(username)) {
          updateData.username = username
        }
        await supabase
          .from('profiles')
          .update(updateData)
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

