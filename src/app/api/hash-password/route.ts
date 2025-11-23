import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Force Node.js runtime (bcryptjs requires Node.js, not Edge)
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string' },
        { status: 400 }
      )
    }

    // Hash the password with bcrypt (10 rounds is a good default)
    const saltRounds = 10
    const hashedPassword = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          reject(err)
        } else if (hash && typeof hash === 'string') {
          resolve(hash)
        } else {
          reject(new Error('Hash generation returned invalid result'))
        }
      })
    })

    return NextResponse.json({ password_hash: hashedPassword }, { status: 200 })
  } catch (error: any) {
    console.error('Error hashing password:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to hash password' },
      { status: 500 }
    )
  }
}

