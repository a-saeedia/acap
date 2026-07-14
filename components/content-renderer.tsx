'use client'

export function ContentRenderer({ text }: { text?: string | null }) {
  if (!text) return null
  const processed = text
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
    .replace(/\n/g, '<br/>')
  return <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processed }} />
}
