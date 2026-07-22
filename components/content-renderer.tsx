'use client'

export function ContentRenderer({ text, className = '' }: { text?: string | null; className?: string }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactElement[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />)
      continue
    }

    // Detect heading-like lines (short emoji-prefixed headers or lines with | separator)
    const isHeader = /^[🟡🔵🟢🔴🟣🟠⚪✅❌⚠️⏳🎯📊📈📉💰💎🔥⭐🌟✨💡📌🔔🚀🏆]/.test(trimmed) && trimmed.length < 80

    // Price targets — lines containing numbers with commas or decimal points and تومان/ریال
    const hasPrice = /[\d,]+(,\d{3})*(\.\d+)?\s*(تومان|ریال|دلار|درصد)/.test(trimmed)

    // Percentage
    const hasPercent = /\d+(\.\d+)?%/.test(trimmed)

    let cls = 'text-sm leading-7'
    if (isHeader) cls += ' font-bold text-amber-300 text-base'
    if (hasPrice) cls += ' text-emerald-400'
    if (hasPercent) cls += ' text-amber-400'

    elements.push(
      <p key={i} className={`${cls} ${className}`} style={{ direction: 'rtl', textAlign: 'right' }}>
        {trimmed}
      </p>
    )
  }

  return <div className="space-y-0.5">{elements}</div>
}
