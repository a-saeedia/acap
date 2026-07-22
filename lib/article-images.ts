function pickImage(images: string[], seed: number): string {
  return images[seed % images.length]
}

export function getArticleImage(title: string, categoryColor: string): string {
  const lower = title.toLowerCase()
  const seed = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  const categoryMap: { keywords: string[]; images: string[] }[] = [
    {
      keywords: ['بیت‌کوین', 'bitcoin', 'بیت کوین', 'ارز دیجیتال', 'crypto', 'cryptocurrency', 'رمزارز', 'blockchain', 'بلاکچین', 'بلاک چین', 'اتریوم', 'ethereum', 'solana', 'سولانا'],
      images: ['/blog/crypto-bitcoin.jpg', '/blog/crypto-coins.jpg', '/blog/crypto-mining.jpg', '/blog/mobile-trading.jpg'],
    },
    {
      keywords: ['بورس', 'stock', 'سهام', 'سهم', 'بازار سرمایه', 'تالار', 'فرابورس', 'نماد'],
      images: ['/blog/stock-chart.jpg', '/blog/stock-graph.jpg', '/blog/market-board.jpg', '/blog/trading-screens.jpg'],
    },
    {
      keywords: ['آموزش', 'ترید', 'trading', 'trade', 'معامله', 'سیگنال', 'تحلیل', 'تحلیل تکنیکال', 'تحلیل بنیادی'],
      images: ['/blog/trading-phone.jpg', '/blog/trader-desk.jpg', '/blog/trading-screens.jpg', '/blog/mobile-trading.jpg', '/blog/education-laptop.jpg'],
    },
    {
      keywords: ['سرمایه‌گذاری', 'سرمایه گذاری', 'invest', 'investment', 'پورتفو', 'portfolio', 'مدیریت ریسک', 'ریسک', 'سبد سهام'],
      images: ['/blog/invest-portfolio.jpg', '/blog/money-stack.jpg', '/blog/growth-chart.jpg', '/blog/startup-meeting.jpg'],
    },
    {
      keywords: ['اقتصاد', 'economy', 'تورم', 'inflation', 'دلار', 'usd', 'forex', 'فارکس', 'نرخ بهره', 'tether', 'usdt'],
      images: ['/blog/forex-globe.jpg', '/blog/money-stack.jpg', '/blog/gold-bars.jpg', '/blog/market-board.jpg'],
    },
    {
      keywords: ['طلا', 'gold', 'سکه', 'طلای'],
      images: ['/blog/gold-bars.jpg', '/blog/crypto-coins.jpg', '/blog/money-stack.jpg'],
    },
    {
      keywords: ['هوش مصنوعی', 'ai', 'artificial intelligence', 'یادگیری ماشین', 'machine learning', 'chatgpt', 'gpt', 'ربات', 'bot', 'automation'],
      images: ['/blog/ai-brain.jpg', '/blog/startup-meeting.jpg', '/blog/education-laptop.jpg'],
    },
    {
      keywords: ['مشاوره', 'consulting', 'راهنما', 'guide', 'آموزش', 'educational', 'دوره', 'course'],
      images: ['/blog/education-laptop.jpg', '/blog/ai-brain.jpg', '/blog/trading-phone.jpg'],
    },
    {
      keywords: ['املاک', 'real estate', 'مسکن', 'ملک', 'خانه', 'mortgage', 'رهن'],
      images: ['/blog/real-estate.jpg', '/blog/money-stack.jpg', '/blog/growth-chart.jpg'],
    },
    {
      keywords: ['بازار', 'market', 'تحلیل', 'analysis', 'پیش‌بینی', 'پیش بینی', 'forecast'],
      images: ['/blog/market-board.jpg', '/blog/stock-graph.jpg', '/blog/trading-screens.jpg', '/blog/invest-portfolio.jpg'],
    },
  ]

  for (const entry of categoryMap) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return pickImage(entry.images, seed)
      }
    }
  }

  const hex = categoryColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const shapes = [
    `<circle cx="${15 + (seed % 35)}%" cy="${20 + (seed * 7 % 60)}%" r="${8 + (seed % 15)}" fill="rgba(${r},${g},${b},0.13)" stroke="rgba(${r},${g},${b},0.27)" stroke-width="1"/>`,
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
</svg>`

  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}