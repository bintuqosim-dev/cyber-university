import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const courses = (await db.getCourses()).sort((a, b) => a.order_num - b.order_num)
  return NextResponse.json({ courses })
}
