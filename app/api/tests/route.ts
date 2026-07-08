import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topicId = searchParams.get('topic_id')
  if (!topicId) return NextResponse.json({ error: 'topic_id kerak' }, { status: 400 })
  return NextResponse.json({ tests: await db.getTestsByTopic(Number(topicId)) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  const { topic_id, question, options, correct_index } = await req.json()
  if (!topic_id || !question || !options || correct_index === undefined) return NextResponse.json({ error: 'Barcha maydonlar kerak' }, { status: 400 })
  const test = await db.createTest({ topic_id: Number(topic_id), question, options: JSON.stringify(options), correct_index, created_by: session.id })
  return NextResponse.json({ success: true, id: test.id })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await db.deleteTest(Number(id))
  return NextResponse.json({ success: true })
}
