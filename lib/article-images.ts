function pickImage(images: string[], seed: number): string {
  return images[seed % images.length]
}

function svgShape(sym: string, price: string, color: string): string {
  return `data:image/svg+xml,` + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}22"/>
      <stop offset="100%" stop-color="${color}44"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="${color}11"/>
  <rect width="800" height="400" fill="url(#g)"/>
  <text x="400" y="200" text-anchor="middle" dominant-baseline="central" font-family="system-ui" font-size="48" font-weight="800" fill="${color}">${sym}</text>
  <text x="400" y="260" text-anchor="middle" dominant-baseline="central" font-family="system-ui" font-size="18" fill="${color}66">${price}</text>
</svg>`)
}

export function getArticleImage(title: string, categoryColor: string): string {
  const lower = title.toLowerCase()
  const seed = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  const themeColor = categoryColor || '#3b82f6'
  const c = themeColor.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) || 59
  const g = parseInt(c.substring(2, 4), 16) || 130
  const b = parseInt(c.substring(4, 6), 16) || 246

  const icon = (path: string, viewBox = '0 0 24 24') => `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="${viewBox}" fill="none" stroke="rgba(${r},${g},${b},0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`

  const icons: { keywords: string[]; icon: string; display: string }[] = [
    { keywords: ['بیت‌کوین', 'bitcoin', 'بیت کوین', 'cryptocurrency', 'رمز ارز', 'بلاکچین', 'blockchain', 'اتریوم', 'ethereum', 'solana', 'سولانا'],
      icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h6M9 15h6"/><path d="M8 12h8"/>', display: '₿' },
    { keywords: ['بورس', 'stock', 'سهام', 'سهم', 'بازار سرمایه', 'تالار', 'فرابورس', 'نماد'],
      icon: '<path d="M21 12h-3.5L13 5l-3 7H4l3.5 5L12 17l4.5 2L21 12Z"/><path d="M12 2v20"/>', display: '📊' },
    { keywords: ['آموزش', 'ترید', 'trading', 'trade', 'معامله', 'سیگنال', 'تحلیل', 'تکنیکال', 'بنایی'],
      icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>', display: '📈' },
    { keywords: ['سرمایه‌گذاری', 'سرمایه گذاری', 'invest', 'investment', 'پورتفو', 'portfolio', 'سبد', 'ریسک'],
      icon: '<path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>', display: '💰' },
    { keywords: ['اقتصاد', 'economy', 'تورم', 'inflation', 'دلار', 'forex', 'فارکس', 'tether', 'usdt'],
      icon: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>', display: '$' },
    { keywords: ['طلا', 'gold', 'سکه', 'طلای'],
      icon: '<circle cx="12" cy="12" r="10"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>', display: '🥇' },
    { keywords: ['هوش مصنوعی', 'ai', 'artificial', 'machine learning', 'یادگیری ماشین', 'chatgpt', 'gpt', 'ربات'],
      icon: '<path d="M12 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0v-4a8 8 0 0 0-8-8Z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9 14c.83.67 1.67 1 3 1s2.17-.33 3-1"/>', display: '🤖' },
    { keywords: ['مشاوره', 'consulting', 'راهنما', 'guide', 'دوره', 'course', 'آموزش'],
      icon: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h8M8 11h6"/>', display: '📚' },
    { keywords: ['املاک', 'real estate', 'مسکن', 'ملک', 'خانه', 'رهن', 'mortgage'],
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/>', display: '🏠' },
    { keywords: ['بازار', 'market', 'پیش‌بینی', 'پیش بینی', 'forecast', 'تحلیل', 'analysis'],
      icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', display: '📉' },
    { keywords: ['نفت', 'oil', 'پالایش', 'انرژی', 'energy'],
      icon: '<path d="M12 2a8 8 0 0 0-5 14.3V22h10v-5.7A8 8 0 0 0 12 2Z"/><circle cx="12" cy="12" r="3"/><path d="M12 6v3M12 15v3"/>', display: '🛢️' },
    { keywords: ['بانک', 'bank', 'بیمه', 'insurance'],
      icon: '<rect x="2" y="8" width="20" height="14" rx="2"/><path d="M12 2L2 8h20L12 2Z"/><line x1="8" y1="12" x2="8" y2="18"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="16" y1="12" x2="16" y2="18"/>', display: '🏛️' },
  ]

  for (const entry of icons) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)})"/>
      <stop offset="100%" stop-color="rgb(${Math.max(0,r-80)},${Math.max(0,g-80)},${Math.max(0,b-80)})"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#bg)"/>
  <circle cx="400" cy="180" r="100" fill="rgba(255,255,255,0.06)"/>
  <g transform="translate(360,140)">${entry.icon}</g>
  <text x="400" y="300" text-anchor="middle" font-family="system-ui" font-size="32" font-weight="800" fill="white" opacity="0.9">${title.length > 35 ? title.substring(0, 32) + '...' : title}</text>
</svg>`
        return 'data:image/svg+xml,' + encodeURIComponent(svg)
      }
    }
  }

  const shapes = [
    `<circle cx="${15 + (seed % 35)}%" cy="${20 + (seed * 7 % 60)}%" r="${8 + (seed % 15)}" fill="rgba(${r},${g},${b},0.13)"/>`,
    `<circle cx="${70 + (seed * 3 % 25)}%" cy="${50 + (seed * 11 % 40)}%" r="${12 + (seed % 20)}" fill="rgba(${r},${g},${b},0.09)"/>`,
    `<rect x="${5 + (seed % 40)}%" y="${60 + (seed * 13 % 30)}%" width="${20 + (seed % 25)}" height="${20 + (seed % 25)}" rx="4" fill="rgba(${r},${g},${b},0.08)" stroke="rgba(${r},${g},${b},0.20)" stroke-width="1" transform="rotate(${seed % 360}, ${15 + (seed % 40)}%, ${70 + (seed * 13 % 30)}%)"/>`,
    `<circle cx="${45 + (seed * 5 % 40)}%" cy="${10 + (seed % 20)}%" r="${4 + (seed % 8)}" fill="rgba(${r},${g},${b},0.19)"/>`,
    `<path d="M${30 + (seed % 20)}% ${80 + (seed % 15)}% L${50 + (seed % 20)}% ${40 + (seed % 20)}% L${70 + (seed % 15)}% ${75 + (seed % 15)}%" fill="none" stroke="rgba(${r},${g},${b},0.15)" stroke-width="2"/>`,
    `<circle cx="${80 + (seed * 17 % 15)}%" cy="${20 + (seed * 23 % 30)}%" r="${3 + (seed % 5)}" fill="rgba(${r},${g},${b},0.16)"/>`,
  ]

  const selectedShapes = shapes.filter((_, i) => seed % (i + 2) !== 0).join('')
  const bg1 = `rgb(${Math.max(0, r - 80)},${Math.max(0, g - 80)},${Math.max(0, b - 80)})`
  const bg2 = `rgb(${Math.max(0, r - 40)},${Math.max(0, g - 40)},${Math.max(0, b - 40)})`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="800" height="400" fill="${bg1}"/>
  <rect width="800" height="400" fill="url(#bg)" opacity="0.7"/>
  ${selectedShapes}
  <circle cx="400" cy="200" r="250" fill="url(#glow)"/>
  <text x="400" y="210" text-anchor="middle" dominant-baseline="central" font-family="system-ui" font-size="36" font-weight="800" fill="white" opacity="0.85">${title.length > 35 ? title.substring(0, 32) + '...' : title}</text>
</svg>`

  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}
