'use client'

// Mavzu matnidagi `::viz <nom>` joylariga interaktiv vizualizatsiyalarni ulaydi.
// Markdown HTML'ida <div class="viz-mount" data-viz="..."> bo'sh joy qoldiriladi,
// bu komponent esa brauzerda ularni topib, ichiga React komponentini chizadi.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import GrowthViz from './viz/GrowthViz'
import PointerViz from './viz/PointerViz'

const REGISTRY: Record<string, () => JSX.Element> = {
  growth: () => <GrowthViz />,
  pointer: () => <PointerViz />,
}

export default function VizRoot() {
  const [mounts, setMounts] = useState<{ el: Element; type: string }[]>([])

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
  }, [])

  return <>{mounts.map((m, i) => createPortal(REGISTRY[m.type](), m.el, `${m.type}-${i}`))}</>
}
