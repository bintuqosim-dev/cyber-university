import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cyber University — Dasturlash va Kiberxavfsizlik',
  description: 'C++, Python, Kotlin, Cybersecurity va DSA fanlarini onlayn o\'rganing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
