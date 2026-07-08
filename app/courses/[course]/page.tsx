import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { ChevronRight, BookOpen, Code2, Clock } from 'lucide-react'

const COURSE_INFO: Record<string, string> = {
  cpp: 'C++ — tezligi va kuchi bilan mashhur tizim dasturlash tili. O\'yinlar, OS, va embedded tizimlar uchun keng ishlatiladi.',
  python: 'Python — o\'rganishi eng oson va keng qo\'llaniladigan til. Web, AI/ML, Data Science, automation uchun ideal.',
  kotlin: 'Kotlin — Android ilovalar uchun rasmiy til. Java bilan to\'liq mos, lekin ancha qisqaroq va xavfsizroq.',
  cybersecurity: 'Kiberxavfsizlik — raqamli dunyoda o\'zingizni va tizimlarni himoya qilish fani.',
  dsa: 'Ma\'lumotlar tuzilmasi va algoritmlar — har qanday dasturchi uchun zarur fundamental bilimlar.',
}

export default async function CoursePage({ params }: { params: { course: string } }) {
  const session = await getSession()
  const courses = await db.getCourses()
  const course = courses.find(c => c.id === params.course)
  if (!course) notFound()

  const topics = await db.getTopicsByCourse(params.course)
  const problems = await db.getProblemsByCourse(params.course)

  const diffStyle: Record<string, string> = {
    easy: 'text-green-400 bg-green-900/30 border-green-800/50',
    medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50',
    hard: 'text-red-400 bg-red-900/30 border-red-800/50',
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Bosh sahifa</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-300">{course.title}</span>
        </div>

        <div className={`bg-gradient-to-br ${course.color} p-0.5 rounded-2xl mb-8`}>
          <div className="bg-gray-950 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {course.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>
                <p className="text-gray-400 leading-relaxed mb-4">{COURSE_INFO[params.course] || course.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{topics.length} mavzu</div>
                  <div className="flex items-center gap-1.5"><Code2 className="w-4 h-4" />{problems.length} masala</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Online compiler</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Mavzular</h2>
            {topics.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Hozircha mavzular qo'shilmagan</p>
                {session?.role === 'teacher' && (
                  <Link href="/dashboard/teacher" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">+ Mavzu qo'shish</Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((topic, idx) => (
                  <Link key={topic.id} href={`/courses/${params.course}/${topic.id}`}
                    className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-blue-800/60 rounded-xl px-5 py-4 transition-all hover:bg-gray-900/80">
                    <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-800/50 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white group-hover:text-blue-300 transition-colors">{topic.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Nazariya + Kod misoli + Online Compiler</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Amaliyot</h2>
            {problems.length === 0 ? (
              <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-gray-500 text-sm">Masalalar yo'q</p>
              </div>
            ) : (
              <div className="space-y-2">
                {problems.map(p => (
                  <Link key={p.id} href={`/practice/${p.id}`}
                    className="group flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition-all">
                    <span className="text-sm text-white group-hover:text-green-300 transition-colors truncate mr-2">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${diffStyle[p.difficulty]}`}>
                      {p.difficulty === 'easy' ? 'Oson' : p.difficulty === 'medium' ? "O'rta" : 'Qiyin'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
