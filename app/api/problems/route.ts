import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('course_id')
  const problems = courseId
    ? (await db.getProblemsByCourse(courseId)).map(p => ({ id: p.id, course_id: p.course_id, title: p.title, difficulty: p.difficulty, created_at: p.created_at }))
    : (await db.getProblems()).map(p => ({ id: p.id, course_id: p.course_id, title: p.title, difficulty: p.difficulty, created_at: p.created_at }))
  return NextResponse.json({ problems })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'teacher') return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  const body = await req.json()
  const { course_id, title, difficulty, description, examples, constraints, starter_cpp, starter_python, starter_kotlin, solution_cpp, solution_python } = body
  if (!title || !description) return NextResponse.json({ error: 'Sarlavha va matn kerak' }, { status: 400 })
  const problem = await db.createProblem({
    course_id: course_id || '',
    title, difficulty: difficulty || 'easy', description,
    examples: JSON.stringify(examples || []),
    constraints: constraints || '',
    starter_cpp: starter_cpp || '', starter_python: starter_python || '', starter_kotlin: starter_kotlin || '',
    solution_cpp: solution_cpp || '', solution_python: solution_python || '',
    created_by: session.id,
  })
  return NextResponse.json({ success: true, id: problem.id })
}
