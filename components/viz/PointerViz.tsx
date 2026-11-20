'use client'

import { useState } from 'react'

const CODE = [
  'int x = 42;',
  'int* p = &x;',
  '*p = 100;',
  'int y = 7;',
  'p = &y;',
  '*p = 8;',
]

type Mem = { x: number | null; y: number | null; p: 'x' | 'y' | null }
const STEPS: { line: number; mem: Mem; note: string }[] = [
  { line: -1, mem: { x: null, y: null, p: null }, note: "Dastur hali boshlanmadi. \"Keyingi\" tugmasini bosing." },
  { line: 0, mem: { x: 42, y: null, p: null }, note: "x uchun xotirada katak ajratildi va unga 42 yozildi." },
  { line: 1, mem: { x: 42, y: null, p: 'x' }, note: "p ning qiymati — x ning manzili (0x1000). Strelka \"p x ni ko'rsatadi\" degani." },
  { line: 2, mem: { x: 100, y: null, p: 'x' }, note: "*p — p ko'rsatayotgan katak. Uni o'zgartirsak, x ning o'zi o'zgaradi: 42 → 100." },
  { line: 3, mem: { x: 100, y: 7, p: 'x' }, note: "Yangi o'zgaruvchi y yaratildi. p hali ham x ni ko'rsatadi." },
  { line: 4, mem: { x: 100, y: 7, p: 'y' }, note: "p endi y ning manzilini saqlaydi — strelka boshqa katakka ko'chdi. x o'zgarmadi." },
  { line: 5, mem: { x: 100, y: 8, p: 'y' }, note: "*p = 8 endi y ni o'zgartiradi (7 → 8). x esa 100 ligicha qoldi." },
]

const CELLS = [
  { key: 'x' as const, addr: '0x1000', cx: 90 },
  { key: 'y' as const, addr: '0x1004', cx: 250 },
  { key: 'p' as const, addr: '0x1008', cx: 410 },
]

export default function PointerViz() {
  const [s, setS] = useState(0)
  const step = STEPS[s]
  const changed = s > 0 ? (['x', 'y', 'p'] as const).filter(k => STEPS[s - 1].mem[k] !== step.mem[k]) : []
  const target = step.mem.p ? CELLS.find(c => c.key === step.mem.p)! : null
  const pCell = CELLS[2]

  return (
    <div className="viz-box not-prose">
      <div className="viz-title">Interaktiv: ko'rsatkich xotirada qanday ishlaydi?</div>
      <div className="viz-split">
        <ol className="viz-code">
          {CODE.map((c, i) => (
            <li key={c} className={i === step.line ? 'on' : i < step.line ? 'done' : ''}>
              <span className="viz-ln">{i + 1}</span><code>{c}</code>
            </li>
          ))}
        </ol>
        <svg viewBox="0 0 500 190" className="viz-svg text-fg" role="img" aria-label="Xotira kataklari va ko'rsatkich">
          <defs>
            <marker id="pv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#f59e0b" />
            </marker>
          </defs>
          {CELLS.map(c => {
            const v = step.mem[c.key]
            const declared = v !== null
            const isPtr = c.key === 'p'
            const hot = changed.includes(c.key)
            const label = !declared ? '' : isPtr ? `${CELLS.find(t => t.key === v)!.addr}` : String(v)
            return (
              <g key={c.key} opacity={declared ? 1 : 0.28}>
                <rect x={c.cx - 60} y={90} width={120} height={56} rx={8}
                  fill={hot ? 'rgba(245,158,11,0.22)' : 'transparent'}
                  stroke={hot ? '#f59e0b' : 'currentColor'} strokeWidth={hot ? 2.5 : 1.5} opacity={hot ? 1 : 0.8} />
                <text x={c.cx} y={124} textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">{label}</text>
                <text x={c.cx - 52} y={84} fontSize="13" fontWeight="700" fill="currentColor">{isPtr ? 'int* p' : `int ${c.key}`}</text>
                <text x={c.cx} y={165} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">{c.addr}</text>
              </g>
            )
          })}
          {target && (
            <path d={`M ${pCell.cx} 90 C ${pCell.cx} 20, ${target.cx} 20, ${target.cx + (target.cx < pCell.cx ? 10 : 0)} 88`}
              fill="none" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#pv-arrow)" />
          )}
          <text x={250} y={182} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.55">(manzillar misol uchun; haqiqiy manzil har ishga tushirishda boshqa bo'ladi)</text>
        </svg>
      </div>
      <p className="viz-step-note"><b>Qadam {s}/{STEPS.length - 1}.</b> {step.note}</p>
      <div className="viz-btns">
        <button type="button" onClick={() => setS(Math.max(0, s - 1))} disabled={s === 0}>← Oldingi</button>
        <button type="button" onClick={() => setS(Math.min(STEPS.length - 1, s + 1))} disabled={s === STEPS.length - 1}>Keyingi →</button>
        <button type="button" onClick={() => setS(0)}>Boshidan</button>
      </div>
    </div>
  )
}
