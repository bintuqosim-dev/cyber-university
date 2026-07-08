import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ensureInitialized } from '@/lib/init'
import Navbar from '@/components/Navbar'
import { BookOpen, Code2, Shield, Layers, ChevronRight, Users, Trophy, Zap } from 'lucide-react'

export default async function Home() {
  await ensureInitialized()
  const session = await getSession()
  const courses = (await db.getCourses()).sort((a, b) => a.order_num - b.order_num)

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 text-blue-300 text-sm px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Online Compiler bilan o'rganing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Cyber<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">University</span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-300 font-semibold">Dasturlash & Kiberxavfsizlik</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            C++, Python, Kotlin, Cybersecurity va DSA fanlarini nazariy va amaliy misollar bilan o'rganing.
            Kod yozib, online compile qiling!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {session ? (
              <Link href={session.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105">
                Panelga o'tish <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105">
                  Bepul ro'yxatdan o'tish <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/login"
                  className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-all">
                  Kirish
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { icon: <BookOpen className="w-6 h-6" />, val: '5', label: 'Fan' },
            { icon: <Code2 className="w-6 h-6" />, val: '3', label: 'Dasturlash tili' },
            { icon: <Trophy className="w-6 h-6" />, val: '50+', label: 'Amaliy masala' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="text-blue-400">{s.icon}</div>
              <div className="text-3xl font-bold text-white">{s.val}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Fanlar</h2>
            <p className="text-gray-400">Har bir fan uchun nazariy ma'lumot, kod misollari va amaliy masalalar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Link key={course.id} href={`/courses/${course.id}`}
                className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
                <div className={`w-14 h-14 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {course.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                  O'rganish <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!session && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-3xl p-12">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Bugun boshlang!</h2>
            <p className="text-gray-400 mb-8">O'qituvchi yoki talaba sifatida ro'yxatdan o'ting va o'rganishni boshlang</p>
            <Link href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 transition-all">
              Ro'yxatdan o'tish <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        © 2024 CyberUniversity. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  )
}
