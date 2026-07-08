import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('course_id')
  const topics = courseId ? await db.getTopicsByCourse(courseId) : (await db.getTopics()).sort((a, b) => a.order_num - b.order_num)
  return NextResponse.json({ topics })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  try {
    const { course_id, title, content, cpp_example, python_example, kotlin_example } = await req.json()
    if (!course_id || !title || !content) return NextResponse.json({ error: 'Majburiy maydonlar to\'ldirilmagan' }, { status: 400 })
    const existing = await db.getTopicsByCourse(course_id)
    const order_num = existing.length > 0 ? Math.max(...existing.map(t => t.order_num)) + 1 : 1
    const topic = await db.createTopic({ course_id, title, content, cpp_example: cpp_example || '', python_example: python_example || '', kotlin_example: kotlin_example || '', order_num, created_by: session.id })
    return NextResponse.json({ success: true, id: topic.id })
  } catch {
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
  await db.deleteTopic(Number(id))
  return NextResponse.json({ success: true })
}
