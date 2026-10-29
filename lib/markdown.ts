// CyberEdu — kichik, xavfsiz Markdown -> HTML o'giruvchi.
// Qo'llab-quvvatlanadi: ## ### sarlavhalar, ``` kod bloklari (HTML escape bilan),
// jadval (| a | b | , | --- | ajratgichi bo'lsa birinchi qator sarlavha), - ro'yxat, 1. ro'yxat,
// > iqtibos, ![izoh](/diagrams/x.png) rasm (izoh ostida), **qalin**, `kod`, [matn](https://...).

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

const isSep = (cells: string[]) => cells.every(c => /^:?-{2,}:?$/.test(c))

export function renderMarkdown(text: string): string {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const L = lines[i]
    if (/^\s*$/.test(L)) { i++; continue }

    if (/^```/.test(L)) {
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`)
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
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3} |\||- |\d+\. |> |```|!\[)/.test(lines[i])) buf.push(lines[i++])
    if (buf.length === 0) { buf.push(lines[i++]) }
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }
  return out.join('\n')
}
