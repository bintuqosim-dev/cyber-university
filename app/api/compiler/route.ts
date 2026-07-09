import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// Judge0 CE — hech qanday API kalitisiz ishlaydigan bepul kod-ijro xizmati
// (Piston API 2026-yil fevraldan boshlab ommaviy foydalanish uchun yopildi).
const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true'

// Judge0 CE'dagi barqaror til ID'lari
const LANG_MAP: Record<string, number> = {
  cpp: 54,    // C++ (GCC 9.2.0)
  python: 71, // Python (3.8.1)
  kotlin: 78, // Kotlin (1.3.70)
}

function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64')
}

function fromBase64(str: string | null | undefined): string {
  if (!str) return ''
  return Buffer.from(str, 'base64').toString('utf-8')
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: bitta IP uchun 1 daqiqada 6 martadan ko'p kod ijro qilinmasin
    const ip = getClientIp(req)
    const { allowed, retryAfterSec } = rateLimit(`compiler:${ip}`, 6, 60_000)
    if (!allowed) {
      return NextResponse.json({
        error: `Juda ko'p so'rov yubordingiz. Iltimos, ${retryAfterSec} soniyadan so'ng qayta urinib ko'ring.`,
      }, { status: 429 })
    }

    const { code, language, stdin = '' } = await req.json()

    const language_id = LANG_MAP[language]
    if (!language_id) return NextResponse.json({ error: 'Noto\'g\'ri til' }, { status: 400 })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let res: Response
    try {
      res = await fetch(JUDGE0_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_id,
          source_code: toBase64(code),
          stdin: toBase64(stdin),
        }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) {
      // Diagnostika uchun: haqiqiy status va javob matnini qaytaramiz
      const bodyText = await res.text().catch(() => '')
      return NextResponse.json({
        error: `Compiler xizmatida xatolik yuz berdi (status: ${res.status}). ${bodyText.slice(0, 300)}`,
      }, { status: 500 })
    }

    const data = await res.json()

    let output = ''
    const compileOutput = fromBase64(data.compile_output)
    const stdout = fromBase64(data.stdout)
    const stderr = fromBase64(data.stderr)
    const message = fromBase64(data.message)

    if (compileOutput) output += `Kompilyatsiya xatosi:\n${compileOutput}\n`
    if (stdout)        output += stdout
    if (stderr)         output += stderr
    if (message && !stdout && !stderr) output += message
    if (!output)        output = '(Hech qanday natija chiqmadi)'

    return NextResponse.json({ output: output.trim() })
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError'
    return NextResponse.json({
      error: isAbort
        ? 'Compiler javob berish vaqti tugadi (timeout). Qaytadan urinib ko\'ring.'
        : 'Server xatoligi: ' + String(err),
    }, { status: 500 })
  }
}
