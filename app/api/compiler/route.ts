import { NextRequest, NextResponse } from 'next/server'

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
    const { code, language, stdin = '' } = await req.json()

    const language_id = LANG_MAP[language]
    if (!language_id) return NextResponse.json({ error: 'Noto\'g\'ri til' }, { status: 400 })

    const res = await fetch(JUDGE0_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id,
        source_code: toBase64(code),
        stdin: toBase64(stdin),
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Compiler xizmatida xatolik yuz berdi' }, { status: 500 })
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
  } catch (err) {
    return NextResponse.json({ error: 'Server xatoligi: ' + String(err) }, { status: 500 })
  }
}
