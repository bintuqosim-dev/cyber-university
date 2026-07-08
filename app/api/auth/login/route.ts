import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email va parolni kiriting' }, { status: 400 })
    const user = await db.getUserByEmail(email)
    if (!user) return NextResponse.json({ error: 'Email yoki parol noto\'g\'ri' }, { status: 401 })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Email yoki parol noto\'g\'ri' }, { status: 401 })
    const token = await signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
    return response
  } catch {
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
