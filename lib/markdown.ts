// CyberEdu — kichik, xavfsiz Markdown -> HTML o'giruvchi.
// Qo'llab-quvvatlanadi: ## ### sarlavhalar, ``` kod bloklari (HTML escape bilan),
// jadval (| a | b | , | --- | ajratgichi bo'lsa birinchi qator sarlavha), - ro'yxat, 1. ro'yxat,
// > iqtibos, ::viz nom (interaktiv vizualizatsiya joyi), :::code Sarlavha + ```cpp/```python/```kotlin bloklari + >>> natija + ::: (tilni yorliqdan tanlanadigan kod bloki), :::scenario Sarlavha ... >>> javob ... ::: (bosilganda javob ochiladigan mini-stsenariy), ![izoh](/diagrams/x.png) rasm (izoh ostida), **qalin**, `kod`, [matn](https://...).

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inline(raw: string): string {
  const codes: string[] = []
  let s = esc(raw)
  s = s.replace(/`([^`\n]+)`/g, (_m, c: string) => {
    codes.push(c)
    return `\u0000${codes.length - 1}\u0000`
  })
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${codes[Number(i)]}</code>`)
  return s
}


// Kod bloki qaysi tilda ekanini aniqlaydi (bo'sh teg bo'lsa — mazmunidan taxmin qiladi).
// null qaytsa — bu dastur kodi emas (masalan, natija matni) va oddiy <pre> bo'lib qoladi.
function guessLang(tag: string, code: string): 'cpp' | 'python' | 'kotlin' | null {
  if (/^(cpp|c\+\+|cc|cxx|c)$/.test(tag)) return 'cpp'
  if (/^(python|py|python3)$/.test(tag)) return 'python'
  if (/^(kotlin|kt)$/.test(tag)) return 'kotlin'
  if (tag) return null // text, json, bash va h.k.
  if (/#include|\bcout\s*<<|\bcin\s*>>|\bstd::|\bnullptr\b|\bint\s*\*?\s*\w+\s*(=|\(|\[|;)|\bvoid\s+\w+\s*\(|\bfor\s*\(\s*(int|size_t|auto)\b|\bdelete(\[\])?\s+\w|\bnew\s+\w+/.test(code)) return 'cpp'
  if (/^\s*(def\s+\w+\(|import\s+\w+|from\s+\w+\s+import|print\(|for\s+\w+\s+in\s)/m.test(code)) return 'python'
  if (/\bfun\s+\w+\s*\(|\bval\s+\w+\s*[:=]|\bvar\s+\w+\s*[:=]/.test(code)) return 'kotlin'
  return null
}

const isSep = (cells: string[]) => cells.every(c => /^:?-{2,}:?$/.test(c))

export function renderMarkdown(text: string): string {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const L = lines[i]
    if (/^\s*$/.test(L)) { i++; continue }

    if (/^```/.test(L)) {
      const tag = L.replace(/^```\s*/, '').trim().toLowerCase()
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      const code = buf.join('\n')
      const lang = guessLang(tag, code)
      const pre = `<pre><code>${esc(code)}</code></pre>`
      // Dasturlash tilidagi bloklar brauzerda rangli, tahrirlanadigan va ishga tushiriladigan CodeFrame'ga aylanadi.
      // JS o'chiq bo'lsa yoki yuklanmaguncha oddiy <pre> ko'rinadi.
      if (lang) {
        const data = esc(JSON.stringify({ title: '', panels: [{ lang, code }], expected: '' }))
        out.push(`<div class="codeframe-mount" data-codeframe="${data}">${pre}</div>`)
      } else {
        out.push(pre)
      }
      continue
    }

    let vm: RegExpExecArray | null
    if ((vm = /^::viz\s+([a-z0-9_-]+)\s*$/.exec(L))) {
      out.push(`<div class="viz-mount" data-viz="${esc(vm[1])}"><div class="viz-fallback">Interaktiv vizualizatsiya yuklanmoqda…</div></div>`)
      i++; continue
    }

    let cm: RegExpExecArray | null
    if ((cm = /^:::code\s*(.*)$/.exec(L))) {
      const panels: { lang: string; code: string }[] = []
      const outBuf: string[] = []
      let inOut = false
      i++
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        const fm = inOut ? null : /^```(\w*)\s*$/.exec(lines[i])
        if (fm) {
          const buf: string[] = []
          i++
          while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++])
          i++
          panels.push({ lang: fm[1], code: buf.join('\n') })
          continue
        }
        if (/^>>>\s*$/.test(lines[i])) inOut = true
        else if (inOut) outBuf.push(lines[i])
        i++
      }
      i++ // yopuvchi :::
      const names: Record<string, string> = { cpp: 'C++', python: 'Python', kotlin: 'Kotlin', java: 'Java', js: 'JavaScript' }
      const id = `ct${out.length}`
      const radios = panels.map((_p, k) => `<input type="radio" name="${id}" id="${id}-${k}"${k === 0 ? ' checked' : ''} />`).join('')
      const labels = panels.map((p, k) => `<label for="${id}-${k}">${esc(names[p.lang] || p.lang || 'Kod')}</label>`).join('')
      const pres = panels.map(p => `<pre><code>${esc(p.code)}</code></pre>`).join('')
      const result = outBuf.length
        ? `<div class="ct-out"><div class="ct-out-label">Natija</div><pre><code>${esc(outBuf.join('\n').replace(/\s+$/, ''))}</code></pre></div>`
        : ''
      const fallback = `<div class="codetabs">${radios}<div class="ct-head"><span class="ct-title">${inline(cm[1])}</span><div class="ct-labels">${labels}</div></div><div class="ct-panels">${pres}</div>${result}</div>`
      const data = esc(JSON.stringify({ title: cm[1], panels, expected: outBuf.join('\n').replace(/\s+$/, '') }))
      // Statik variant (JS o'chiq bo'lsa) ichida turadi; brauzerda CodeFrame uni almashtiradi.
      out.push(`<div class="codeframe-mount" data-codeframe="${data}">${fallback}</div>`)
      continue
    }

    let sm: RegExpExecArray | null
    if ((sm = /^:::scenario\s*(.*)$/.exec(L))) {
      const qBuf: string[] = []
      const aBuf: string[] = []
      let inAnswer = false
      i++
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        if (/^>>>\s*$/.test(lines[i])) inAnswer = true
        else (inAnswer ? aBuf : qBuf).push(lines[i])
        i++
      }
      i++ // yopuvchi :::
      out.push(
        `<div class="scenario"><div class="scenario-head">Mini-stsenariy${sm[1] ? ' · ' + inline(sm[1]) : ''}</div>` +
        `<div class="scenario-body">${renderMarkdown(qBuf.join('\n'))}</div>` +
        `<details class="scenario-answer"><summary>Javobni ko'rish</summary><div class="scenario-answer-body">${renderMarkdown(aBuf.join('\n'))}</div></details></div>`
      )
      continue
    }

    let m: RegExpExecArray | null
    if ((m = /^!\[(.*)\]\(([^)\s]+)\)\s*$/.exec(L))) {
      const alt = esc(m[1]); const src = esc(m[2])
      out.push(`<figure><img src="${src}" alt="${alt}" loading="lazy" /><figcaption>${inline(m[1])}</figcaption></figure>`)
      i++; continue
    }
    if ((m = /^### (.+)$/.exec(L))) { out.push(`<h3>${inline(m[1])}</h3>`); i++; continue }
    if ((m = /^#{1,2} (.+)$/.exec(L))) { out.push(`<h2>${inline(m[1])}</h2>`); i++; continue }

    if (/^\|/.test(L)) {
      const rows: string[][] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()))
        i++
      }
      const hasHeader = rows.length > 1 && isSep(rows[1])
      const body = rows.filter(r => !isSep(r))
      const cell = (tag: string) => (c: string) => `<${tag}>${inline(c)}</${tag}>`
      let html = '<div class="table-wrap"><table>'
      body.forEach((r, ri) => {
        const tag = hasHeader && ri === 0 ? 'th' : 'td'
        html += `<tr>${r.map(cell(tag)).join('')}</tr>`
      })
      out.push(html + '</table></div>')
      continue
    }

    if (/^- /.test(L)) {
      const items: string[] = []
      while (i < lines.length && /^- /.test(lines[i])) items.push(`<li>${inline(lines[i++].slice(2))}</li>`)
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }
    if (/^\d+\. /.test(L)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\d+\. /, ''))}</li>`)
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }
    if (/^> /.test(L)) {
      const buf: string[] = []
      while (i < lines.length && /^> /.test(lines[i])) buf.push(lines[i++].slice(2))
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`)
      continue
    }

    const buf: string[] = []
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3} |\||- |\d+\. |> |```|::|!\[)/.test(lines[i])) buf.push(lines[i++])
    if (buf.length === 0) { buf.push(lines[i++]) }
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }
  return out.join('\n')
}
