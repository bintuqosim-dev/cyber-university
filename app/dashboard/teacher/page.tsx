'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PlusCircle, BookOpen, FileQuestion, Trash2, ChevronRight, Loader2, X, Check } from 'lucide-react'

type Course = { id: string; title: string; icon: string; color: string }
type Topic = { id: number; course_id: string; title: string; order_num: number }
type Problem = { id: number; title: string; difficulty: string }

export default function TeacherDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'topics' | 'tests' | 'problems'>('topics')

  // Topic form
  const [topicForm, setTopicForm] = useState({ course_id: '', title: '', content: '', cpp_example: '', python_example: '', kotlin_example: '' })
  const [topicSaving, setTopicSaving] = useState(false)
  const [topicMsg, setTopicMsg] = useState('')

  // Test form
  const [testTopicId, setTestTopicId] = useState('')
  const [testQuestion, setTestQuestion] = useState('')
  const [testOptions, setTestOptions] = useState(['', '', '', ''])
  const [testCorrect, setTestCorrect] = useState(0)
  const [testSaving, setTestSaving] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  // Problem form
  const [probForm, setProbForm] = useState({ course_id: '', title: '', difficulty: 'easy', description: '', examples: '', constraints: '', starter_cpp: '', starter_python: '', starter_kotlin: '' })
  const [probSaving, setProbSaving] = useState(false)
  const [probMsg, setProbMsg] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'teacher') { router.push('/login'); return }
      setUser(d.user)
    })
    Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/topics').then(r => r.json()),
      fetch('/api/problems').then(r => r.json()),
    ]).then(([c, t, p]) => {
      setCourses(c.courses || [])
      setTopics(t.topics || [])
      setProblems(p.problems || [])
      setLoading(false)
    })
  }, [])

  const saveTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopicSaving(true); setTopicMsg('')
    const res = await fetch('/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(topicForm) })
    const d = await res.json()
    setTopicSaving(false)
    if (res.ok) {
      setTopicMsg('✅ Mavzu qo\'shildi!')
      setTopicForm({ course_id: '', title: '', content: '', cpp_example: '', python_example: '', kotlin_example: '' })
      fetch('/api/topics').then(r => r.json()).then(d => setTopics(d.topics || []))
    } else { setTopicMsg('❌ ' + d.error) }
  }

  const deleteTopic = async (id: number) => {
    if (!confirm('Mavzuni o\'chirishni tasdiqlaysizmi?')) return
    await fetch(`/api/topics?id=${id}`, { method: 'DELETE' })
    setTopics(topics.filter(t => t.id !== id))
  }

  const saveTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setTestSaving(true); setTestMsg('')
    const res = await fetch('/api/tests', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: testTopicId, question: testQuestion, options: testOptions.filter(Boolean), correct_index: testCorrect }) })
    const d = await res.json()
    setTestSaving(false)
    if (res.ok) { setTestMsg('✅ Test qo\'shildi!'); setTestQuestion(''); setTestOptions(['', '', '', '']); setTestCorrect(0) }
    else { setTestMsg('❌ ' + d.error) }
  }

  const saveProb = async (e: React.FormEvent) => {
    e.preventDefault()
    setProbSaving(true); setProbMsg('')
    const examples = probForm.examples.split('\n').filter(Boolean).map((line, i) => ({ input: `Misol ${i+1}`, output: line }))
    const res = await fetch('/api/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...probForm, examples }) })
    const d = await res.json()
    setProbSaving(false)
    if (res.ok) { setProbMsg('✅ Masala qo\'shildi!'); setProbForm({ course_id: '', title: '', difficulty: 'easy', description: '', examples: '', constraints: '', starter_cpp: '', starter_python: '', starter_kotlin: '' }) }
    else { setProbMsg('❌ ' + d.error) }
  }

  if (loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">O'qituvchi Paneli</h1>
            <p className="text-gray-400 text-sm">Mavzu, test va masalalar qo'shing</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-blue-400">{topics.length}</div>
              <div className="text-gray-500 text-xs">Mavzu</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-green-400">{problems.length}</div>
              <div className="text-gray-500 text-xs">Masala</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'topics', label: 'Mavzu qo\'shish', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'tests', label: 'Test qo\'shish', icon: <FileQuestion className="w-4 h-4" /> },
            { key: 'problems', label: 'Masala qo\'shish', icon: <PlusCircle className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Forms */}
          <div>
            {activeTab === 'topics' && (
              <form onSubmit={saveTopic} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-white text-lg">Yangi mavzu</h2>
                {topicMsg && <div className={`text-sm px-3 py-2 rounded-lg ${topicMsg.startsWith('✅') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{topicMsg}</div>}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fan *</label>
                  <select value={topicForm.course_id} onChange={e => setTopicForm({...topicForm, course_id: e.target.value})} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Fanni tanlang</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mavzu sarlavhasi *</label>
                  <input value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Masalan: O'zgaruvchilar va turlari" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nazariy matn (Markdown qo'llab-quvvatlanadi) *</label>
                  <textarea value={topicForm.content} onChange={e => setTopicForm({...topicForm, content: e.target.value})} required rows={6}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                    placeholder="## Sarlavha&#10;&#10;Matn bu yerga..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">C++ misol kodi</label>
                  <textarea value={topicForm.cpp_example} onChange={e => setTopicForm({...topicForm, cpp_example: e.target.value})} rows={4}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                    placeholder="#include <iostream>&#10;int main() { ... }" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Python misol kodi</label>
                  <textarea value={topicForm.python_example} onChange={e => setTopicForm({...topicForm, python_example: e.target.value})} rows={4}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                    placeholder="print('Hello')" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Kotlin misol kodi</label>
                  <textarea value={topicForm.kotlin_example} onChange={e => setTopicForm({...topicForm, kotlin_example: e.target.value})} rows={4}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                    placeholder="fun main() { println(&quot;Hello&quot;) }" />
                </div>
                <button type="submit" disabled={topicSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                  {topicSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {topicSaving ? 'Saqlanmoqda...' : 'Mavzu qo\'shish'}
                </button>
              </form>
            )}

            {activeTab === 'tests' && (
              <form onSubmit={saveTest} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-white text-lg">Yangi test savoli</h2>
                {testMsg && <div className={`text-sm px-3 py-2 rounded-lg ${testMsg.startsWith('✅') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{testMsg}</div>}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mavzu *</label>
                  <select value={testTopicId} onChange={e => setTestTopicId(e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Mavzuni tanlang</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Savol *</label>
                  <textarea value={testQuestion} onChange={e => setTestQuestion(e.target.value)} required rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Savol matnini kiriting" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Javob variantlari * (to'g'ri javobni belgilang)</label>
                  <div className="space-y-2">
                    {testOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setTestCorrect(i)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${testCorrect === i ? 'border-green-500 bg-green-500' : 'border-gray-600'}`}>
                          {testCorrect === i && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <input value={opt} onChange={e => { const o = [...testOptions]; o[i] = e.target.value; setTestOptions(o) }}
                          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          placeholder={`${i + 1}-variant`} />
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={testSaving}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                  {testSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileQuestion className="w-4 h-4" />}
                  {testSaving ? 'Saqlanmoqda...' : 'Test qo\'shish'}
                </button>
              </form>
            )}

            {activeTab === 'problems' && (
              <form onSubmit={saveProb} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-white text-lg">Yangi masala</h2>
                {probMsg && <div className={`text-sm px-3 py-2 rounded-lg ${probMsg.startsWith('✅') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{probMsg}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Fan</label>
                    <select value={probForm.course_id} onChange={e => setProbForm({...probForm, course_id: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Tanlang</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Qiyinlik</label>
                    <select value={probForm.difficulty} onChange={e => setProbForm({...probForm, difficulty: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      <option value="easy">Oson</option>
                      <option value="medium">O'rta</option>
                      <option value="hard">Qiyin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Masala sarlavhasi *</label>
                  <input value={probForm.title} onChange={e => setProbForm({...probForm, title: e.target.value})} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Masalan: Ikki Sonni Yig'indisi" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Masala matni (Markdown) *</label>
                  <textarea value={probForm.description} onChange={e => setProbForm({...probForm, description: e.target.value})} required rows={5}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Masala shartini yozing..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cheklovlar</label>
                  <input value={probForm.constraints} onChange={e => setProbForm({...probForm, constraints: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="1 <= n <= 10^5" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Python boshlang'ich kod</label>
                  <textarea value={probForm.starter_python} onChange={e => setProbForm({...probForm, starter_python: e.target.value})} rows={4}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                    placeholder="class Solution:&#10;    def solve(self): pass" />
                </div>
                <button type="submit" disabled={probSaving}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                  {probSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {probSaving ? 'Saqlanmoqda...' : 'Masala qo\'shish'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Lists */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> Mavzular ({topics.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topics.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                    <div>
                      <Link href={`/courses/${t.course_id}/${t.id}`} className="text-sm text-white hover:text-blue-300 transition-colors">{t.title}</Link>
                      <p className="text-xs text-gray-500">{t.course_id}</p>
                    </div>
                    <button onClick={() => deleteTopic(t.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Masalalar ({problems.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {problems.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                    <Link href={`/practice/${p.id}`} className="text-sm text-white hover:text-green-300 transition-colors">{p.title}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' : p.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
