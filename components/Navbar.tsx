'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react'

type NavUser = { name: string; role: string } | null

export default function Navbar({ user }: { user: NavUser }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Cyber<span className="text-blue-400">Uni</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/#courses" className="text-gray-400 hover:text-white transition-colors text-sm">Fanlar</Link>
            <Link href="/practice" className="text-gray-400 hover:text-white transition-colors text-sm">Amaliyot</Link>
            {user ? (
              <>
                <Link
                  href={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">{user.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${user.role === 'teacher' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                    {user.role === 'teacher' ? 'O\'qituvchi' : 'Talaba'}
                  </span>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm">
                  <LogOut className="w-4 h-4" />
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Kirish</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-4 space-y-3">
          <Link href="/#courses" className="block text-gray-400 hover:text-white py-2">Fanlar</Link>
          <Link href="/practice" className="block text-gray-400 hover:text-white py-2">Amaliyot</Link>
          {user ? (
            <>
              <Link href={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} className="block text-gray-400 hover:text-white py-2">Panel</Link>
              <button onClick={logout} className="block text-red-400 py-2">Chiqish</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-400 hover:text-white py-2">Kirish</Link>
              <Link href="/register" className="block bg-blue-600 text-white text-center py-2 rounded-lg">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
