import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { Target, Filter } from 'lucide-react'

export default async function PracticePage({ searchParams }: { searchParams: { difficulty?: string; course?: string } }) {
  const session = await getSession()
  const courses = (await db.getCourses()).sort((a, b) => a.order_num - b.order_num)

  let allProblems = await db.getProblems()
  if (searchParams.difficulty) allProblems = allProblems.filter(p => p.difficulty === searchParams.difficulty)
  if (searchParams.course) allProblems = allProblems.filter(p => p.course_id === searchParams.course)

  const total = await db.getProblems()
  const counts = {
    all: total.length,
    easy: total.filter(p => p.difficulty === 'easy').length,
    medium: total.filter(p => p.difficulty === 'medium').length,
    hard: total.filter(p => p.difficulty === 'hard').length,
  }

  const diffStyle: Record<string, string> = {
    easy: 'text-green-400 bg-green-900/30 border border-green-800/50',
    medium: 'text-yellow-400 bg-yellow-900/30 border border-yellow-800/50',
    hard: 'text-red-400 bg-red-900/30 border border-red-800/50',
  }
  const diffLabel: Record<string, string> = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' }

  // Enrich with course info
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Amaliyot Masalalari</h1>
            <p className="text-gray-400 text-sm">LeetCode uslubidagi masalalar — online compiler bilan</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Hammasi', count: counts.all, color: 'text-white', href: '/practice', key: '' },
            { label: 'Oson', count: counts.easy, color: 'text-green-400', href: '/practice?difficulty=easy', key: 'easy' },
            { label: "O'rta", count: counts.medium, color: 'text-yellow-400', href: '/practice?difficulty=medium', key: 'medium' },
            { label: 'Qiyin', count: counts.hard, color: 'text-red-400', href: '/practice?difficulty=hard', key: 'hard' },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className={`bg-gray-900 border rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 ${
                (searchParams.difficulty === s.key || (!searchParams.difficulty && s.key === ''))
                  ? 'border-blue-700 bg-blue-900/20' : 'border-gray-800 hover:border-gray-700'
              }`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <Link href="/practice" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!searchParams.course ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
            Barcha fanlar
          </Link>
          {courses.map(c => (
            <Link key={c.id} href={`/practice?course=${c.id}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${searchParams.course === c.id ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {c.icon} {c.title}
            </Link>
          ))}
        </div>

        {allProblems.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
            <Target className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">Masalalar topilmadi</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 grid grid-cols-12 text-xs text-gray-500 font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Masala</div>
              <div className="col-span-3">Fan</div>
              <div className="col-span-2">Qiyinlik</div>
            </div>
            {allProblems.map((p, i) => {
              const course = courseMap[p.course_id]
              return (
                <Link key={p.id} href={`/practice/${p.id}`}
                  className="grid grid-cols-12 items-center px-5 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors group">
                  <div className="col-span-1 text-gray-600 text-sm">{i + 1}</div>
                  <div className="col-span-6">
                    <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{p.title}</span>
                  </div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {course ? `${course.icon} ${course.title}` : '—'}
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffStyle[p.difficulty]}`}>
                      {diffLabel[p.difficulty]}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
