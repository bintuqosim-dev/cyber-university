'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, User, GraduationCap, BookMarked, Loader2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(form.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">Cyber<span className="text-blue-400">Uni</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Ro'yxatdan o'tish</h1>
          <p className="text-gray-400 text-sm">Yangi hisob yarating</p>
        </div>

        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Role selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">Rolni tanlang</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => setForm({ ...form, role: 'student' })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.role === 'student'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-medium">Talaba</span>
                <span className="text-xs opacity-70 text-center">Mavzularni o'qish va kod yozish</span>
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, role: 'teacher' })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.role === 'teacher'
                    ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                <BookMarked className="w-6 h-6" />
                <span className="text-sm font-medium">O'qituvchi</span>
                <span className="text-xs opacity-70 text-center">Mavzu va test qo'shish</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Ism va familiya</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Alisher Navoiy" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="email@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Kamida 6 ta belgi" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Yaratilmoqda...' : 'Hisob yaratish'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Kirish
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
