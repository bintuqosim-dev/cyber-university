'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(data.user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">Cyber<span className="text-blue-400">Uni</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Tizimga kirish</h1>
          <p className="text-gray-400 text-sm">Hisobingizga kiring</p>
        </div>

        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Demo accounts */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setForm({ email: 'teacher@cyber.uz', password: 'password123' })}
              className="text-xs bg-purple-900/30 border border-purple-800 text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-900/50 transition-colors">
              Demo O'qituvchi
            </button>
            <button type="button" onClick={() => setForm({ email: 'student@cyber.uz', password: 'password123' })}
              className="text-xs bg-blue-900/30 border border-blue-800 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-900/50 transition-colors">
              Demo Talaba
            </button>
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
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Parolni kiriting" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
