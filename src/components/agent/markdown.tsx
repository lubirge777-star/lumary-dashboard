import type { JSX } from "react"

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function renderCodeBlock(code: string, lang?: string): JSX.Element {
  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-outline-variant/20 bg-[#1e1e2e]">
      {lang && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#2a2a3e] border-b border-outline-variant/10">
          <span className="text-[10px] text-gray-400 font-mono">{lang}</span>
          <button
            onClick={() => copyToClipboard(code)}
            className="text-[10px] text-gray-400 hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-200 leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = []
  let remaining = text

  while (remaining.length > 0) {
    // Bold (**text**)
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Inline code (`text`)
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Italic (*text*)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)

    const matches: { index: number; length: number; element: JSX.Element }[] = []

    if (boldMatch && boldMatch.index !== undefined) {
      matches.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        element: <strong key={parts.length} className="font-bold text-on-surface">{boldMatch[1]}</strong>,
      })
    }
    if (codeMatch && codeMatch.index !== undefined) {
      matches.push({
        index: codeMatch.index,
        length: codeMatch[0].length,
        element: (
          <code key={parts.length} className="px-1.5 py-0.5 rounded-md bg-surface-variant/30 text-primary font-mono text-xs">
            {codeMatch[1]}
          </code>
        ),
      })
    }
    if (italicMatch && italicMatch.index !== undefined) {
      matches.push({
        index: italicMatch.index,
        length: italicMatch[0].length,
        element: <em key={parts.length} className="italic text-on-surface-variant/90">{italicMatch[1]}</em>,
      })
    }

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    matches.sort((a, b) => a.index - b.index)
    const m = matches[0]

    if (m.index > 0) {
      parts.push(remaining.slice(0, m.index))
    }
    parts.push(m.element)
    remaining = remaining.slice(m.index + m.length)
  }

  return parts
}

function Markdown({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(<div key={elements.length}>{renderCodeBlock(codeLines.join("\n"), lang || undefined)}</div>)
      continue
    }

    // Empty line
    if (line.trim() === "") {
      i++
      continue
    }

    // List item
    if (line.trim().match(/^[-*]\s/)) {
      const items: (string | JSX.Element)[][] = []
      while (i < lines.length && lines[i].trim().match(/^[-*]\s/)) {
        const text = lines[i].trim().slice(2).trim()
        items.push(renderInline(text))
        i++
      }
      elements.push(
        <ul key={elements.length} className="space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Numbered list
    if (line.trim().match(/^\d+\.\s/)) {
      const items: (string | JSX.Element)[][] = []
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const text = lines[i].trim().replace(/^\d+\.\s/, "")
        items.push(renderInline(text))
        i++
      }
      elements.push(
        <ol key={elements.length} className="space-y-1 my-2 list-decimal list-inside">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm">{item}</li>
          ))}
        </ol>,
      )
      continue
    }

    // Header
    const headerMatch = line.match(/^(#{1,4})\s(.+)/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const text = headerMatch[2]
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      elements.push(
        <Tag key={elements.length} className={`font-heading font-bold text-on-surface mt-4 mb-2 ${level === 1 ? "text-lg" : level === 2 ? "text-base" : "text-sm"}`}>
          {renderInline(text)}
        </Tag>,
      )
      i++
      continue
    }

    // Regular paragraph
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("```") && !lines[i].trim().match(/^[-*]\s/) && !lines[i].trim().match(/^\d+\.\s/) && !lines[i].match(/^#{1,4}\s/)) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={elements.length} className="text-sm leading-relaxed text-on-surface/90 my-1.5">
          {renderInline(paraLines.join("\n"))}
        </p>,
      )
      continue
    }

    i++
  }

  return <div className="space-y-1">{elements}</div>
}

export default Markdown
