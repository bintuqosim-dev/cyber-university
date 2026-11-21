'use client'

// Mavzu matnidagi `::viz <nom>` joylariga interaktiv vizualizatsiyalarni ulaydi.
// Markdown HTML'ida <div class="viz-mount" data-viz="..."> bo'sh joy qoldiriladi,
// (shuningdek `:::code` bloklarini tahrirlanadigan va ishga tushiriladigan CodeFrame'ga aylantiradi) bu komponent esa brauzerda ularni topib, ichiga React komponentini chizadi.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import GrowthViz from './viz/GrowthViz'
import PointerViz from './viz/PointerViz'
import CodeFrame, { Panel } from './CodeFrame'

const REGISTRY: Record<string, () => JSX.Element> = {
  growth: () => <GrowthViz />,
  pointer: () => <PointerViz />,
}

export default function VizRoot() {
  const [mounts, setMounts] = useState<{ el: Element; type: string }[]>([])
  const [frames, setFrames] = useState<{ el: Element; title: string; panels: Panel[]; expected: string }[]>([])

  useEffect(() => {
    const found: { el: Element; type: string }[] = []
    document.querySelectorAll('.viz-mount').forEach(el => {
      const type = el.getAttribute('data-viz') || ''
      if (REGISTRY[type]) {
        el.innerHTML = ''
        found.push({ el, type })
      }
    })
    setMounts(found)

    const fr: { el: Element; title: string; panels: Panel[]; expected: string }[] = []
    document.querySelectorAll('.codeframe-mount').forEach(el => {
      try {
        const d = JSON.parse(el.getAttribute('data-codeframe') || '{}')
        if (Array.isArray(d.panels) && d.panels.length) {
          el.innerHTML = ''
          fr.push({ el, title: d.title || '', panels: d.panels, expected: d.expected || '' })
        }
      } catch { /* buzuq ma'lumot: statik variant qoladi */ }
    })
    setFrames(fr)
  }, [])

  return (
    <>
      {mounts.map((m, i) => createPortal(REGISTRY[m.type](), m.el, `${m.type}-${i}`))}
      {frames.map((f, i) => createPortal(<CodeFrame title={f.title} panels={f.panels} expected={f.expected} />, f.el, `cf-${i}`))}
    </>
  )
}
