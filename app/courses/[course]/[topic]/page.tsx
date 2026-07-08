import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import QuizSection from '@/components/QuizSection'
import { ChevronRight, ChevronLeft, BookOpen, Code2, HelpCircle } from 'lucide-react'

function renderMarkdown(text: string): string {
  // code blocks first
  let html = text.replace(/```[\w]*\n([\s\S]*?)```/gm, '<pre><code>$1</code></pre>')
  html = html
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (_: string, row: string) => {
      const cells = row.split(' | ').map((c: string) => c.trim())
      if (cells.every((c: string) => /^-+$/.test(c))) return ''
      return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join('')}</tr>`
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
  // wrap tables
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, (m) => `<table>${m}</table>`)
  // wrap lists
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
  return html
}

export default async function TopicPage({ params }: { params: { course: string; topic: string } }) {
  const session = await getSession()

  const topic = await db.getTopicById(Number(params.topic))
  if (!topic || topic.course_id !== params.course) notFound()

  const courses = await db.getCourses()
  const course = courses.find(c => c.id === params.course)
  const allTopics = await db.getTopicsByCourse(params.course)
  const tests = await db.getTestsByTopic(topic.id)

  const currentIdx = allTopics.findIndex(t => t.id === topic.id)
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null
  const nextTopic = currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={session} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-gray-300">Bosh sahifa</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/courses/${params.course}`} className="hover:text-gray-300">{course?.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">{topic.title}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sticky top-20">
              <Link href={`/courses/${params.course}`} className="flex items-center gap-2 mb-4 text-sm text-gray-400 hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />{course?.title}
              </Link>
              <div className="space-y-1">
                {allTopics.map((t, i) => (
                  <Link key={t.id} href={`/courses/${params.course}/${t.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.id === topic.id ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.id === topic.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      {i + 1}
                    </span>
                    <span className="truncate">{t.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="xl:col-span-3 order-1 xl:order-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{topic.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />Nazariya</span>
                <span className="flex items-center gap-1"><Code2 className="w-4 h-4" />Kod misoli</span>
                {tests.length > 0 && <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" />{tests.length} ta test</span>}
              </div>
            </div>

            {/* Theory */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" /> Nazariya
              </h2>
              <div className="prose-cyber" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.content) }} />
            </div>

            {/* Code Editor */}
            {(topic.cpp_example || topic.python_example || topic.kotlin_example) && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-green-400" /> Kod Misoli
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Online Compiler</span>
                </h2>
                <CodeEditor
                  cppCode={topic.cpp_example}
                  pythonCode={topic.python_example}
                  kotlinCode={topic.kotlin_example}
                  defaultLanguage="python"
                  height="350px"
                />
              </div>
            )}

            {/* Quiz */}
            {tests.length > 0 && <QuizSection tests={tests} />}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              {prevTopic ? (
                <Link href={`/courses/${params.course}/${prevTopic.id}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  <div>
                    <div className="text-xs text-gray-600">Oldingi</div>
                    <div className="text-sm font-medium">{prevTopic.title}</div>
                  </div>
                </Link>
              ) : <div />}
              {nextTopic ? (
                <Link href={`/courses/${params.course}/${nextTopic.id}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-right">
                  <div>
                    <div className="text-xs text-gray-600">Keyingi</div>
                    <div className="text-sm font-medium">{nextTopic.title}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
