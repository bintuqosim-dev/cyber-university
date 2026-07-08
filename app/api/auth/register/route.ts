import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password || !role) return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 })
    if (!['student', 'teacher'].includes(role)) return NextResponse.json({ error: 'Noto\'g\'ri rol' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Parol kamida 6 ta belgi bo\'lishi kerak' }, { status: 400 })
    if (await db.getUserByEmail(email)) return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.createUser({ name, email, password: hashed, role })
    const token = await signToken({ id: user.id, email, role, name })
    const response = NextResponse.json({ success: true, user: { id: user.id, name, email, role } })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
    return response
  } catch (err) {
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
