import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const problem = await db.getProblemById(Number(params.id))
  if (!problem) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  return NextResponse.json({ problem })
}
