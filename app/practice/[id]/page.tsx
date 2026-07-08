import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import { ChevronLeft, Target, Lightbulb } from 'lucide-react'

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
}

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  const problem = await db.getProblemById(Number(params.id))
  if (!problem) notFound()

  let examples: any[] = []
  try { examples = JSON.parse(problem.examples) } catch {}

  const diffStyle: Record<string, string> = {
    easy: 'text-green-400 bg-green-900/30 border-green-800',
    medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
    hard: 'text-red-400 bg-red-900/30 border-red-800',
  }
  const diffLabel: Record<string, string> = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' }

  const defaultCpp = problem.starter_cpp || `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Kodingizni shu yerga yozing\n    \n    return 0;\n}`
  const defaultPy = problem.starter_python || `# Kodingizni shu yerga yozing\n\n`
  const defaultKt = problem.starter_kotlin || `fun main() {\n    // Kodingizni shu yerga yozing\n}`

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link href="/practice" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Masalalarga qaytish
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Problem */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-xl font-bold text-white leading-tight">{problem.title}</h1>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium flex-shrink-0 ${diffStyle[problem.difficulty]}`}>
                  {diffLabel[problem.difficulty]}
                </span>
              </div>
              <div className="prose-cyber mb-6" dangerouslySetInnerHTML={{ __html: renderMd(problem.description) }} />

              {examples.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Misollar:</h3>
                  {examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 font-mono text-sm">
                      <div><span className="text-gray-500">Kirish: </span><span className="text-white">{ex.input}</span></div>
                      <div><span className="text-gray-500">Chiqish: </span><span className="text-green-400">{ex.output}</span></div>
                      {ex.explanation && <div className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-700">💡 {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className="mt-4">
                  <h3 className="font-semibold text-white text-sm mb-2">Cheklovlar:</h3>
                  <div className="bg-gray-800 rounded-xl p-4">
                    {problem.constraints.split('\n').map((c: string, i: number) => (
                      <p key={i} className="text-sm text-gray-400 font-mono">{c}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-sm font-medium mb-1">Maslahat</p>
                <p className="text-yellow-200/70 text-xs leading-relaxed">
                  Kod yozishdan oldin algoritmni qog'ozda chizing. Kichik misollar bilan boshlang.
                </p>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-white">Yechim yozing</h2>
              <span className="text-xs bg-green-900/30 text-green-400 border border-green-800/50 px-2 py-0.5 rounded-full">Online Compiler</span>
            </div>
            <CodeEditor cppCode={defaultCpp} pythonCode={defaultPy} kotlinCode={defaultKt} defaultLanguage="python" height="500px" />
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Qanday ishlaydi:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• C++, Python yoki Kotlin tilini tanlang</li>
                <li>• <strong className="text-white">Ishga tushirish</strong> tugmasini bosing</li>
                <li>• stdin orqali test kirishlarini bering</li>
                <li>• Piston API orqali haqiqiy serverda ishlaydi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
