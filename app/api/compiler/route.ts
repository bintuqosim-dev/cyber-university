import { NextRequest, NextResponse } from 'next/server'

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const LANG_MAP: Record<string, { language: string; version: string }> = {
  cpp:    { language: 'c++',    version: '10.2.0' },
  python: { language: 'python', version: '3.10.0' },
  kotlin: { language: 'kotlin', version: '1.6.20' },
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, stdin = '' } = await req.json()

    const lang = LANG_MAP[language]
    if (!lang) return NextResponse.json({ error: 'Noto\'g\'ri til' }, { status: 400 })

    const ext = language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : 'kt'

    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.language,
        version: lang.version,
        files: [{ name: `main.${ext}`, content: code }],
        stdin,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Compiler xizmatida xatolik yuz berdi' }, { status: 500 })
    }

    const data = await res.json()
    const run = data.run || {}
    const compile = data.compile || {}

    let output = ''
    if (compile.stderr) output += `Kompilyatsiya xatosi:\n${compile.stderr}\n`
    if (run.stdout)     output += run.stdout
    if (run.stderr)     output += run.stderr
    if (!output)        output = '(Hech qanday natija chiqmadi)'

    return NextResponse.json({ output: output.trim() })
  } catch (err) {
    return NextResponse.json({ error: 'Server xatoligi: ' + String(err) }, { status: 500 })
  }
}
