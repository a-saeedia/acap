export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const title = url.searchParams.get('title') || 'A|CAP'
    const color = url.searchParams.get('color') || '#A51C30'

    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const seed = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const bg1 = `rgb(${Math.max(0, r - 80)},${Math.max(0, g - 80)},${Math.max(0, b - 80)})`
    const bg2 = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 40)})`

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="${bg1}"/>
      <rect width="1200" height="630" fill="url(#bg)" opacity="0.7"/>
      <circle cx="${15 + (seed % 35)}%" cy="${20 + (seed * 7 % 60)}%" r="${60 + (seed % 80)}" fill="rgba(${r},${g},${b},0.10)" stroke="rgba(${r},${g},${b},0.20)" stroke-width="2"/>
      <circle cx="${70 + (seed * 3 % 25)}%" cy="${60 + (seed * 11 % 30)}%" r="${80 + (seed % 100)}" fill="rgba(${r},${g},${b},0.07)"/>
      <circle cx="600" cy="315" r="350" fill="url(#glow)"/>
      <text x="600" y="300" font-family="Vazirmatn, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${title.length > 50 ? title.slice(0, 50) + '...' : title}</text>
      <text x="600" y="380" font-family="Vazirmatn, sans-serif" font-size="24" fill="rgba(255,255,255,0.6)" text-anchor="middle" dominant-baseline="middle">A | CAP — وبلاگ</text>
    </svg>`

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return new Response('', { status: 400 })
  }
}
