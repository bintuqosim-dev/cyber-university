'use client'
import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { cpp } from '@codemirror/lang-cpp'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { Play, RotateCcw, Loader2 } from 'lucide-react'

type Language = 'cpp' | 'python' | 'kotlin'

const LANG_CONFIG = {
  cpp:    { label: 'C++',    pistonLang: 'c++',    version: '10.2.0', ext: 'cpp' },
  python: { label: 'Python', pistonLang: 'python',  version: '3.10.0', ext: 'py'  },
  kotlin: { label: 'Kotlin', pistonLang: 'kotlin',  version: '1.6.20', ext: 'kt'  },
}

function getExtension(lang: Language) {
  if (lang === 'cpp')    return cpp()
  if (lang === 'python') return python()
  return java()
}

interface Props {
  defaultCode?: string
  defaultLanguage?: Language
  cppCode?: string
  pythonCode?: string
  kotlinCode?: string
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({
  defaultCode = '',
  defaultLanguage = 'python',
  cppCode,
  pythonCode,
  kotlinCode,
  readOnly = false,
  height = '320px',
}: Props) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [code, setCode] = useState(() => {
    if (defaultLanguage === 'cpp' && cppCode) return cppCode
    if (defaultLanguage === 'python' && pythonCode) return pythonCode
    if (defaultLanguage === 'kotlin' && kotlinCode) return kotlinCode
    return defaultCode
  })
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [stdin, setStdin] = useState('')
  const [showStdin, setShowStdin] = useState(false)

  const switchLang = (lang: Language) => {
    setLanguage(lang)
    if (lang === 'cpp' && cppCode) setCode(cppCode)
    else if (lang === 'python' && pythonCode) setCode(pythonCode)
    else if (lang === 'kotlin' && kotlinCode) setCode(kotlinCode)
    setOutput('')
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('')
    try {
      const res = await fetch('/api/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin }),
      })
      const data = await res.json()
      setOutput(data.output || data.error || 'Natija yo\'q')
    } catch {
      setOutput('Xatolik yuz berdi. Internet aloqasini tekshiring.')
    }
    setRunning(false)
  }

  const reset = () => {
    if (language === 'cpp' && cppCode) setCode(cppCode)
    else if (language === 'python' && pythonCode) setCode(pythonCode)
    else if (language === 'kotlin' && kotlinCode) setCode(kotlinCode)
    else setCode(defaultCode)
    setOutput('')
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1">
          {(Object.keys(LANG_CONFIG) as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => switchLang(lang)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                language === lang
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {LANG_CONFIG[lang].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStdin(!showStdin)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">
            stdin
          </button>
          {!readOnly && (
            <button onClick={reset} className="text-gray-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Ishlamoqda...' : 'Ishga tushirish'}
          </button>
        </div>
      </div>

      {/* Stdin */}
      {showStdin && (
        <div className="border-b border-gray-700">
          <div className="px-4 py-1 text-xs text-gray-500 bg-gray-850">Kirish (stdin):</div>
          <textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Dasturga beriladigan ma'lumotlarni kiriting..."
            className="w-full bg-gray-950 text-gray-300 text-sm font-mono px-4 py-2 outline-none resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Editor */}
      <CodeMirror
        value={code}
        onChange={setCode}
        theme={vscodeDark}
        extensions={[getExtension(language)]}
        readOnly={readOnly}
        style={{ height }}
        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
      />

      {/* Output */}
      {output && (
        <div className="border-t border-gray-700">
          <div className="px-4 py-1.5 bg-gray-800 text-xs text-gray-400 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${output.includes('error') || output.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`} />
            Natija:
          </div>
          <pre className="px-4 py-3 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-950">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
