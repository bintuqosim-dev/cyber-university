import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const topic = await db.getTopicById(Number(params.id))
  if (!topic) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  return NextResponse.json({ topic })
}
