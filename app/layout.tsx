import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cyber University — Dasturlash va Kiberxavfsizlik',
  description: 'C++, Python, Kotlin, Cybersecurity va DSA fanlarini onlayn o\'rganing',
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
