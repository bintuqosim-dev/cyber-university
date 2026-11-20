'use client'

import { useState } from 'react'

type Fn = { label: string; color: string; f: (n: number) => number }

const FNS: Fn[] = [
  { label: 'O(log n)', color: '#22c55e', f: n => Math.log2(n) },
  { label: 'O(n)', color: '#3b82f6', f: n => n },
  { label: 'O(n log n)', color: '#a855f7', f: n => n * Math.log2(n) },
  { label: 'O(n²)', color: '#f59e0b', f: n => n * n },
  { label: 'O(2ⁿ)', color: '#ef4444', f: n => Math.pow(2, n) },
]

const fmt = (v: number) =>
  v >= 1e15 ? v.toExponential(2) : Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const W = 560, H = 280, L = 48, R = 16, T = 14, B = 34

export default function GrowthViz() {
  const [N, setN] = useState(10)
  const yMax = N * N
  const X = (n: number) => L + ((n - 1) / (N - 1)) * (W - L - R)
  const Y = (v: number) => H - B - (Math.min(v, yMax * 1.2) / yMax) * (H - T - B)
  const maxV = Math.max(...FNS.map(fn => fn.f(N)))

  return (
    <div className="viz-box not-prose">
      <div className="viz-title">Interaktiv: murakkabliklar qanday o'sadi?</div>
      <label className="viz-slider">
        <span>n = <b>{N}</b></span>
        <input type="range" min={3} max={30} value={N} onChange={e => setN(Number(e.target.value))} aria-label="n qiymati" />
      </label>

      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg text-fg" role="img" aria-label="Murakkabliklar o'sish grafigi">
        <defs><clipPath id="gv-clip"><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="currentColor" opacity="0.5" />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="currentColor" opacity="0.5" />
        <text x={L - 6} y={H - B + 4} fontSize="8.5" textAnchor="end" fill="currentColor">0</text>
        <text x={L - 6} y={T + 8} fontSize="8.5" textAnchor="end" fill="currentColor">{yMax}</text>
        <text x={L} y={H - B + 16} fontSize="8.5" textAnchor="middle" fill="currentColor">1</text>
        <text x={W - R} y={H - B + 16} fontSize="8.5" textAnchor="middle" fill="currentColor">{N}</text>
        <text x={(L + W - R) / 2} y={H - 4} fontSize="8.5" textAnchor="middle" fill="currentColor">n (kirish hajmi)</text>
        <text x={12} y={(T + H - B) / 2} fontSize="8.5" textAnchor="middle" fill="currentColor" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>amallar soni</text>
        <g clipPath="url(#gv-clip)">
          {FNS.map(fn => {
            const pts = Array.from({ length: N }, (_, k) => `${X(k + 1)},${Y(fn.f(k + 1))}`).join(' ')
            return <polyline key={fn.label} points={pts} fill="none" stroke={fn.color} strokeWidth="2.5" strokeLinejoin="round" />
          })}
        </g>
      </svg>

      <div className="viz-rows">
        {FNS.map(fn => {
          const v = fn.f(N)
          const w = Math.max(2, (Math.log10(v + 1) / Math.log10(maxV + 1)) * 100)
          return (
            <div key={fn.label} className="viz-row">
              <span className="viz-dot" style={{ background: fn.color }} />
              <span className="viz-name">{fn.label}</span>
              <span className="viz-bar"><span style={{ width: `${w}%`, background: fn.color }} /></span>
              <span className="viz-val">{fmt(v)}</span>
            </div>
          )
        })}
      </div>
      <p className="viz-note">
        Chiziqlar grafik balandligidan chiqib ketsa — qiymat shu yerdan yuqorida. Pastdagi ustunlar <b>logarifmik shkalada</b> chizilgan (aks holda kichik qiymatlar ko'rinmay qolardi). Slayderni surib, O(2ⁿ) qanchalik tez "portlashini" kuzating.
      </p>
    </div>
  )
}
