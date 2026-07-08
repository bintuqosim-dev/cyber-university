import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import { BookOpen, Code2, Trophy, ChevronRight, Target } from 'lucide-react'

export default async function StudentDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'student') redirect('/dashboard/teacher')

  const courses = (await db.getCourses()).sort((a, b) => a.order_num - b.order_num)
  const allTopics = (await db.getTopics()).sort((a, b) => b.id - a.id).slice(0, 6)
  const problems = (await db.getProblems()).slice(0, 5)

  const diffColor: Record<string, string> = {
    easy: 'text-green-400 bg-green-900/30',
    medium: 'text-yellow-400 bg-yellow-900/30',
    hard: 'text-red-400 bg-red-900/30',
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🎓</div>
          <div>
            <h1 className="text-xl font-bold text-white">Salom, {session.name}!</h1>
            <p className="text-gray-400 text-sm">Bugun ham o'rganishni davom ettiring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" /> Fanlar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {courses.map(c => (
                  <Link key={c.id} href={`/courses/${c.id}`}
                    className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all hover:-translate-y-0.5">
                    <div className={`w-10 h-10 bg-gradient-to-br ${c.color} rounded-lg flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-tight">{c.title}</h3>
                    <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs">O'rganish <ChevronRight className="w-3 h-3" /></div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" /> So'nggi mavzular
              </h2>
              <div className="space-y-2">
                {allTopics.map(t => (
                  <Link key={t.id} href={`/courses/${t.course_id}/${t.id}`}
                    className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 group transition-all">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.course_id}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" /> Amaliyot
            </h2>
            <div className="space-y-2">
              {problems.map(p => (
                <Link key={p.id} href={`/practice/${p.id}`}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 group transition-all">
                  <p className="text-sm text-white group-hover:text-green-300 transition-colors">{p.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[p.difficulty]}`}>
                    {p.difficulty === 'easy' ? 'Oson' : p.difficulty === 'medium' ? "O'rta" : 'Qiyin'}
                  </span>
                </Link>
              ))}
              <Link href="/practice" className="block text-center text-blue-400 text-sm py-2 hover:text-blue-300 transition-colors">
                Barcha masalalar →
              </Link>
            </div>
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Maslahat</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">Har kuni kamida bitta masala yeching. Muntazamlik — dasturlashda muvaffaqiyatning kaliti!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
