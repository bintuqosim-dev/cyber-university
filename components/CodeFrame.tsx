'use client'

// Matn ichidagi interaktiv kod oynasi (:::code bloklari uchun):
// til yorliqlari, rangli sintaksis, TAHRIRLASH, NUSXA OLISH, qayta tiklash va ISHGA TUSHIRISH (/api/compiler).
import { useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { cpp } from '@codemirror/lang-cpp'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { Play, RotateCcw, Copy, Check, Loader2 } from 'lucide-react'
import { useTheme } from './ThemeToggle'

export type Panel = { lang: string; code: string }
type Props = { title?: string; panels: Panel[]; expected?: string }

const LABELS: Record<string, string> = { cpp: 'C++', python: 'Python', kotlin: 'Kotlin', java: 'Java' }
// To'liq dastur bo'lmagan parchalarni ishga tushirish uchun tayyorlaydi:
//  - buyruqlar parchasi (main yo'q) -> main() ichiga o'raladi;
//  - faqat funksiya/klass e'lonlari bo'lsa -> bo'sh main() qo'shiladi va kod faqat kompilyatsiya qilinadi.
function prepareForRun(lang: string, code: string): { src: string; compileOnly: boolean } {
  if (lang === 'python') return { src: code, compileOnly: false }
  if (lang === 'cpp') {
    if (/\bmain\s*\(/.test(code)) return { src: code, compileOnly: false }
    const lines = code.split('\n')
    const head = lines.filter(l => /^\s*(#include|using\s+namespace)/.test(l))
    const body = lines.filter(l => !/^\s*(#include|using\s+namespace)/.test(l)).join('\n')
    const base = ['#include <bits/stdc++.h>', 'using namespace std;', ...head.filter(l => !/bits\/stdc|namespace std/.test(l))].join('\n')
    const hasDefs = /^\s*(class|struct|template|namespace|enum)\b/m.test(body) ||
      /^[A-Za-z_][\w:<>,*&\s]*\s+[\w:~]+\s*\([^;{]*\)\s*(const\s*)?\{/m.test(body)
    return hasDefs
      ? { src: `${base}\n${body}\nint main() { return 0; }\n`, compileOnly: true }
      : { src: `${base}\nint main() {\n${body}\n    return 0;\n}\n`, compileOnly: false }
  }
  if (/\bfun\s+main\s*\(/.test(code)) return { src: code, compileOnly: false }
  if (/^\s*(fun|class|object|interface|data\s+class|enum\s+class)\b/m.test(code)) return { src: `${code}\nfun main() {}\n`, compileOnly: true }
  return { src: `fun main() {\n${code}\n}\n`, compileOnly: false }
}

const ext = (lang: string) => (lang === 'cpp' ? cpp() : lang === 'python' ? python() : java())

export default function CodeFrame({ title, panels, expected }: Props) {
  const theme = useTheme()
  const [active, setActive] = useState(0)
  const [codes, setCodes] = useState<string[]>(() => panels.map(p => p.code))
  const [outputs, setOutputs] = useState<(string | null)[]>(() => panels.map(() => null))
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lang = panels[active].lang
  const code = codes[active]
  const out = outputs[active]
  const edited = code !== panels[active].code

  const setCode = (v: string) => setCodes(c => c.map((x, i) => (i === active ? v : x)))
  const setOut = (v: string | null) => setOutputs(o => o.map((x, i) => (i === active ? v : x)))

  const run = async () => {
    const prepared = prepareForRun(lang, code)
    setRunning(true)
    setOut(null)
    try {
      const res = await fetch('/api/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: prepared.src, language: lang, stdin: '' }),
      })
      const data = await res.json()
      let text: string = data.output || data.error || "Natija yo'q"
      if (prepared.compileOnly && /Hech qanday natija chiqmadi|^Natija yo'q$/.test(text)) {
        text = "Kod xatosiz kompilyatsiya qilindi. Bu parcha faqat funksiya/klass e'lonlaridan iborat (main() yo'q), shuning uchun natija chiqmaydi — chaqirib ko'rish uchun main() ichiga qo'shing."
      }
      setOut(text)
    } catch {
      setOut('Xatolik yuz berdi. Internet aloqasini tekshiring.')
    }
    setRunning(false)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* e'tiborsiz */ }
      document.body.removeChild(ta)
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const reset = () => { setCode(panels[active].code); setOut(null) }
  const isErr = !!out && /Kompilyatsiya xatosi|error|Error|Traceback|Xatolik|Server/.test(out)

  return (
    <div className="cf-box not-prose">
      <div className="cf-head">
        <div className="cf-tabs" role="tablist">
          {panels.length === 1 ? (
            <span className="cf-lang">{LABELS[panels[0].lang] || panels[0].lang}</span>
          ) : panels.map((p, i) => (
            <button key={p.lang + i} type="button" role="tab" aria-selected={i === active}
              className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
              {LABELS[p.lang] || p.lang}
            </button>
          ))}
        </div>
        <div className="cf-actions">
          {title && <span className="cf-title">{title}</span>}
          <button type="button" onClick={reset} disabled={!edited && out === null} title="Asl holatga qaytarish" aria-label="Asl holatga qaytarish"><RotateCcw size={15} /></button>
          <button type="button" onClick={copy} title="Nusxa olish" aria-label="Nusxa olish">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
          <button type="button" className="cf-run" onClick={run} disabled={running}>
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Ishlamoqda…' : 'Ishga tushirish'}
          </button>
        </div>
      </div>

      <CodeMirror
        value={code}
        onChange={setCode}
        theme={theme === 'light' ? vscodeLight : vscodeDark}
        extensions={[ext(lang)]}
        height="auto"
        minHeight="80px"
        maxHeight="460px"
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
      />

      <div className="cf-out">
        <div className="cf-out-label">
          {out === null ? (expected ? 'Namunaviy natija' : '') : <><span className={isErr ? 'dot err' : 'dot ok'} /> Sizning natijangiz</>}
        </div>
        {out !== null
          ? <pre>{out}</pre>
          : expected ? <pre className="muted">{expected}</pre> : <div className="cf-hint">Kodni tahrirlab, «Ishga tushirish» ni bosing.</div>}
      </div>
    </div>
  )
}
