import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Hash the password with bcrypt (10 rounds is a good default)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    return NextResponse.json({ password_hash: hashedPassword })
  } catch (error: any) {
    console.error('Error hashing password:', error)
    return NextResponse.json({ error: 'Failed to hash password' }, { status: 500 })
  }
}

