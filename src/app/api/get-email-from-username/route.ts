import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get profile by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 })
    }

    // Get the user's email from auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // We can't directly query other users' emails from client
    // Instead, we'll use a database function or store email in profiles
    // For now, let's use a workaround: try to sign in and get email from session
    
    // Actually, the best approach is to add email to profiles table
    // But for now, we can use a database function
    
    return NextResponse.json({ 
      error: 'Email lookup requires email column in profiles table' 
    }, { status: 501 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

