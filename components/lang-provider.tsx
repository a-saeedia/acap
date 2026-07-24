'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Lang = 'fa' | 'en'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (key: string) => string
}

export const LangContext = createContext<LangContextValue>({
  lang: 'fa',
  setLang: () => {},
  toggleLang: () => {},
  t: (k: string) => k,
})

const STORAGE_KEY = 'acap-lang'

function applyLang(lang: Lang) {
  const root = document.documentElement
  root.setAttribute('lang', lang)
  root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr')
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fa')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    const resolved = stored === 'en' ? 'en' : 'fa'
    setLangState(resolved)
    applyLang(resolved)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
    applyLang(l)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'fa' ? 'en' : 'fa')
  }, [lang, setLang])

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] ?? key
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

/* ------------------------------------------------------------------ */
/*  Translation dictionary                                              */
/* ------------------------------------------------------------------ */
const translations: Record<string, { fa: string; en: string }> = {
  // Navbar
  'nav.blog': { fa: 'وبلاگ', en: 'Blog' },
  'nav.academy': { fa: 'آکادمی', en: 'Academy' },
  'nav.about': { fa: 'درباره ما', en: 'About Us' },
  'nav.quiz': { fa: 'تست مالی', en: 'Quiz' },
  'nav.plus': { fa: 'A|CAP+', en: 'A|CAP+' },
  'nav.ambassador': { fa: 'سفیران', en: 'Ambassadors' },
  'nav.team': { fa: 'تیم', en: 'Team' },
  'nav.faq': { fa: 'سوالات', en: 'FAQ' },
  'nav.services': { fa: 'خدمات', en: 'Services' },
  'nav.dashboard': { fa: 'داشبورد', en: 'Dashboard' },
  'nav.ticket': { fa: 'تیکت', en: 'Ticket' },
  'nav.admin': { fa: 'مدیریت', en: 'Admin' },
  'nav.login': { fa: 'ورود / ثبت\u200cنام', en: 'Login / Register' },
  'nav.logout': { fa: 'خروج', en: 'Logout' },
  'nav.adminpanel': { fa: 'پنل مدیریت', en: 'Admin Panel' },
  'nav.my.dashboard': { fa: 'داشبورد من', en: 'My Dashboard' },
  'nav.menu': { fa: 'منو', en: 'Menu' },
  'nav.close': { fa: 'بستن منو', en: 'Close Menu' },

  // App layout sidebar
  'app.summary': { fa: 'خلاصه من', en: 'My Summary' },
  'app.revenue': { fa: 'A|CAP Revenue', en: 'A|CAP Revenue' },
  'app.assets': { fa: 'دارایی‌ها', en: 'Assets' },
  'app.prices': { fa: 'قیمت‌ها', en: 'Prices' },
  'app.personal': { fa: 'سیگنال‌های شخصی', en: 'Personal Signals' },
  'app.academy': { fa: 'آکادمی', en: 'Academy' },
  'app.invite': { fa: 'دعوت از دوستان', en: 'Invite Friends' },
  'app.blog': { fa: 'وبلاگ', en: 'Blog' },
  'app.logout': { fa: 'خروج', en: 'Logout' },
  'app.logout.account': { fa: 'خروج از حساب', en: 'Logout' },
  'app.back': { fa: 'بازگشت', en: 'Back' },
  'app.portfolio': { fa: 'مدیریت سبد سرمایه', en: 'Portfolio Management' },

  // Dashboard
  'dash.welcome': { fa: 'خوش آمدی، {{name}} 👋', en: 'Welcome, {{name}} 👋' },
  'dash.total.value': { fa: 'ارزش کل', en: 'Total Value' },
  'dash.financial.personality': { fa: 'شخصیت مالی', en: 'Financial Personality' },
  'dash.risk.tolerance': { fa: 'ریسک‌پذیری {{score}}/۱۰۰', en: 'Risk Tolerance {{score}}/100' },
  'dash.retest': { fa: 'تست مجدد', en: 'Retake Quiz' },
  'dash.quiz.cta.title': { fa: 'تست شخصیت مالی خود را شروع کنید!', en: 'Start Your Financial Personality Quiz!' },
  'dash.quiz.cta.desc': { fa: 'با انجام این تست، مسیر سرمایه‌گذاری مناسب شخصیت خود را کشف کنید', en: 'Discover the right investment path for your personality' },
  'dash.start.quiz': { fa: 'شروع تست', en: 'Start Quiz' },
  'dash.portfolio': { fa: 'سبد سرمایه', en: 'Portfolio' },
  'dash.full.manage': { fa: 'مدیریت کامل ←', en: 'Full Management →' },
  'dash.empty.portfolio': { fa: 'سبد شما خالی است — اولین دارایی را ثبت کنید', en: 'Your portfolio is empty — add your first asset' },
  'dash.add.asset': { fa: '+ افزودن دارایی', en: '+ Add Asset' },
  'dash.assets.count': { fa: 'دارایی', en: 'Assets' },
  'dash.more.assets': { fa: '+ {{count}} دارایی دیگر', en: '+ {{count}} more assets' },
  'dash.smart.scan': { fa: 'اسکن هوشمند پرتفوی', en: 'Smart Portfolio Scan' },
  'dash.quick.access': { fa: 'دسترسی سریع', en: 'Quick Access' },
  'dash.account.info': { fa: 'اطلاعات حساب', en: 'Account Info' },
  'dash.name': { fa: 'نام', en: 'Name' },
  'dash.email': { fa: 'ایمیل', en: 'Email' },
  'dash.admin.panel': { fa: 'پنل مدیریت', en: 'Admin Panel' },
  'dash.quiz.title': { fa: 'تست شخصیت مالی', en: 'Financial Personality Quiz' },
  'dash.start.test': { fa: 'شروع تست', en: 'Start Test' },
  'dash.next': { fa: 'بعدی', en: 'Next' },
  'dash.start': { fa: 'شروع کن!', en: 'Let\'s Go!' },
  'dash.skip': { fa: 'رد کردن', en: 'Skip' },

  // Tutorial steps
  'tutorial.step1.title': { fa: 'به A|CAP خوش اومدی!', en: 'Welcome to A|CAP!' },
  'tutorial.step1.desc': { fa: 'این داشبورد مرکز مدیریت سرمایه‌تست. از اینجا می‌تونی همه کارهای مالی‌ت رو انجام بدی.', en: 'This is your investment management dashboard. Manage all your finances here.' },
  'tutorial.step2.title': { fa: 'مدیریت سبد سرمایه', en: 'Portfolio Management' },
  'tutorial.step2.desc': { fa: 'می‌تونی دارایی‌هات رو اضافه کنی - از رمزارز و طلا و سهام گرفته تا وجه نقد. با اسکن هوشمند پرتفوی، پیشنهادات شخصی دریافت کن.', en: 'Add your assets — crypto, gold, stocks, cash. Get personalized suggestions with smart portfolio scanning.' },
  'tutorial.step3.title': { fa: 'سیگنال‌ها و A|CAP+', en: 'Signals & A|CAP+' },
  'tutorial.step3.desc': { fa: 'با فعال‌سازی A|CAP+ سیگنال‌های خرید و فروش اختصاصی، تحلیل پرتفوی هوشمند و پشتیبانی VIP دریافت می‌کنی.', en: 'Activate A|CAP+ to get exclusive buy/sell signals, smart portfolio analysis, and VIP support.' },
  'tutorial.step4.title': { fa: 'آکادمی و وبلاگ', en: 'Academy & Blog' },
  'tutorial.step4.desc': { fa: 'دوره‌های آموزشی ICT، هوش مصنوعی، فارکس و بورس رو در آکادمی ببین. وبلاگ هم پر از مقالات تحلیلی و آموزشی روزانه‌ست.', en: 'Take ICT, AI, Forex, and stock courses at the Academy. The blog has daily analytical articles.' },
  'tutorial.step5.title': { fa: 'آماده شروع هستی!', en: 'Ready to Start!' },
  'tutorial.step5.desc': { fa: 'همین حالا می‌تونی دارایی‌هات رو اضافه کنی، تست شخصیت مالی بدی و از همه امکانات استفاده کنی. موفق باشی!', en: 'Add your assets, take the personality quiz, and explore all features. Good luck!' },

  // Investor types
  'investor.conservative': { fa: 'محافظه‌کار', en: 'Conservative' },
  'investor.balanced': { fa: 'متعادل', en: 'Balanced' },
  'investor.growth': { fa: 'رشدگرا', en: 'Growth' },
  'investor.aggressive': { fa: 'تهاجمی', en: 'Aggressive' },

  // Asset types
  'asset.crypto': { fa: 'رمز ارز', en: 'Crypto' },
  'asset.stock': { fa: 'بورس ایران', en: 'Stock' },
  'asset.gold': { fa: 'طلا', en: 'Gold' },
  'asset.currency': { fa: 'ارز', en: 'Currency' },
  'asset.cash': { fa: 'وجه نقد', en: 'Cash' },
  'asset.other': { fa: 'سایر', en: 'Other' },
  'asset.forex': { fa: 'فارکس', en: 'Forex' },
  'asset.dollar': { fa: 'دلار', en: 'Dollar' },
  'asset.stock.market': { fa: 'سهام', en: 'Stock' },
  'asset.crypto.long': { fa: 'ارز دیجیتال', en: 'Cryptocurrency' },
  'asset.gold.coin': { fa: 'طلا و سکه', en: 'Gold & Coins' },
  'asset.currency.long': { fa: 'ارز', en: 'Currency' },

  // Revenue page
  'rev.title': { fa: 'عملکرد سیگنال‌های A|CAP', en: 'A|CAP Revenue' },
  'rev.lbl.performance': { fa: 'درصد بازده واقعی تمام سیگنال‌های صادره', en: 'Actual return percentage of all issued signals' },
  'rev.filter.net': { fa: 'خالص', en: 'Net' },
  'rev.total.signals': { fa: 'کل سیگنال‌ها', en: 'Total Signals' },
  'rev.win.rate.lbl': { fa: 'نرخ برد', en: 'Win Rate' },
  'rev.avg.return': { fa: 'میانگین بازده', en: 'Avg Return' },
  'rev.best.return': { fa: 'بهترین بازده', en: 'Best Return' },
  'rev.total.return': { fa: 'بازده کل', en: 'Total Return' },
  'rev.net.return': { fa: 'بازده خالص', en: 'Net Return' },
  'rev.this.month': { fa: 'بازده ماه جاری', en: 'Current Month' },
  'rev.3months': { fa: 'بازده سه ماه اخیر', en: 'Last 3 Months' },
  'rev.6months': { fa: 'بازده شش ماه اخیر', en: 'Last 6 Months' },
  'rev.signal.feed': { fa: 'خوراک سیگنال‌ها', en: 'Signal Feed' },
  'rev.signals.count': { fa: '{{count}} سیگنال', en: '{{count}} Signals' },
  'rev.filter.1m': { fa: '۱ ماه', en: '1M' },
  'rev.filter.3m': { fa: '۳ ماه', en: '3M' },
  'rev.filter.6m': { fa: '۶ ماه', en: '6M' },
  'rev.filter.all': { fa: 'همه', en: 'All' },
  'rev.total.pnl': { fa: 'مجموع سود / زیان', en: 'Total P&L' },
  'rev.wins': { fa: '{{count}} برد', en: '{{count}} Wins' },
  'rev.losses': { fa: '{{count}} باخت', en: '{{count}} Losses' },
  'rev.win.rate': { fa: '{{rate}}% موفقیت', en: '{{rate}}% Win Rate' },
  'rev.avg.win': { fa: 'میانگین برد', en: 'Avg Win' },
  'rev.avg.loss': { fa: 'میانگین باخت', en: 'Avg Loss' },
  'rev.profit.factor': { fa: 'فاکتور سود', en: 'Profit Factor' },
  'rev.best.trade': { fa: 'بهترین معامله', en: 'Best Trade' },
  'rev.monthly.return': { fa: 'بازده ماهانه', en: 'Monthly Return' },
  'rev.signals': { fa: 'سیگنال‌ها', en: 'Signals' },
  'rev.no.signals': { fa: 'هنوز سیگنالی ثبت نشده', en: 'No signals yet' },
  'rev.return': { fa: 'بازده', en: 'Return' },
  'rev.action': { fa: 'عملیات', en: 'Action' },
  'rev.buy': { fa: 'خرید', en: 'Buy' },
  'rev.sell': { fa: 'فروش', en: 'Sell' },
  'rev.symbol': { fa: 'نماد', en: 'Symbol' },
  'rev.type': { fa: 'نوع', en: 'Type' },
  'rev.entry.price': { fa: 'قیمت ورود', en: 'Entry Price' },
  'rev.target.price': { fa: 'قیمت هدف', en: 'Target Price' },
  'rev.stop.loss': { fa: 'حد ضرر', en: 'Stop Loss' },
  'rev.date': { fa: 'تاریخ', en: 'Date' },
  'rev.description': { fa: 'توضیحات', en: 'Description' },

  // Personal signals page
  'sig.title': { fa: 'سیگنال‌ها', en: 'Signals' },
  'sig.messages': { fa: '{{count}} پیام', en: '{{count}} Messages' },
  'sig.private': { fa: 'اختصاصی', en: 'Private' },
  'sig.public': { fa: 'عمومی', en: 'Public' },
  'sig.no.public': { fa: 'هنوز سیگنال عمومی ثبت نشده', en: 'No public signals yet' },
  'sig.no.private': { fa: 'هنوز سیگنالی ثبت نشده', en: 'No signals yet' },
  'sig.profit': { fa: 'سود', en: 'Profit' },
  'sig.suggested.profit': { fa: 'سود پیشنهادی', en: 'Suggested Profit' },
  'sig.actual.return': { fa: 'بازده واقعی', en: 'Actual Return' },
  'sig.voice': { fa: 'ویس تحلیل', en: 'Voice Analysis' },
  'sig.expired': { fa: '⛔ منقضی شده', en: '⛔ Expired' },

  // Prices page
  'price.all': { fa: 'همه', en: 'All' },
  'price.crypto': { fa: 'ارز دیجیتال', en: 'Crypto' },
  'price.gold': { fa: 'طلا و سکه', en: 'Gold & Coins' },
  'price.forex': { fa: 'ارز', en: 'Currency' },
  'price.usd': { fa: 'دلار', en: 'USD' },
  'price.toman': { fa: 'تومان', en: 'Toman' },
  'price.no.data': { fa: 'در حال حاضر داده قیمتی در دسترس نیست', en: 'Price data is currently unavailable' },
  'price.retry': { fa: 'تلاش مجدد', en: 'Retry' },
  'price.not.found': { fa: 'هیچ قیمتی در این دسته یافت نشد', en: 'No prices found in this category' },
  'price.category.crypto': { fa: 'ارز دیجیتال', en: 'Cryptocurrency' },
  'price.category.gold': { fa: 'طلا و سکه', en: 'Gold & Coins' },
  'price.category.forex': { fa: 'ارز', en: 'Currency' },

  // Academy page
  'academy.hero.badge': { fa: 'پلتفرم آموزش سرمایه‌گذاری هوشمند', en: 'Smart Investment Learning Platform' },
  'academy.title': { fa: 'آکادمی', en: 'Academy' },
  'academy.subtitle': { fa: 'دانشگاه سرمایه‌گذاری هوشمند', en: 'Smart Investment University' },
  'academy.desc': { fa: 'از مبتدی تا حرفه‌ای، مسیر موفقیت در بازارهای مالی را با اساتید برتر ایران طی کنید', en: 'From beginner to pro, master financial markets with top Iranian instructors' },
  'academy.search.placeholder': { fa: 'دوره، استاد یا موضوع مورد نظر خود را جستجو کنید...', en: 'Search courses, instructors or topics...' },
  'academy.search': { fa: 'جستجو', en: 'Search' },
  'academy.students': { fa: 'دانشجو', en: 'Students' },
  'academy.courses': { fa: 'دوره', en: 'Courses' },
  'academy.hours': { fa: 'ساعت آموزش', en: 'Training Hours' },
  'academy.satisfaction': { fa: 'رضایت', en: 'Satisfaction' },
  'academy.popular': { fa: 'دوره‌های محبوب', en: 'Popular Courses' },
  'academy.popular.desc': { fa: 'پرطرفدارترین دوره‌های آکادمی', en: 'Most popular academy courses' },
  'academy.view.all': { fa: 'مشاهده همه', en: 'View All' },
  'academy.no.courses': { fa: 'هنوز دوره‌ای ثبت نشده است', en: 'No courses yet' },
  'academy.new': { fa: 'جدید', en: 'New' },
  'academy.bestseller': { fa: 'پرفروش', en: 'Bestseller' },
  'academy.instructors': { fa: 'اساتید آکادمی', en: 'Academy Instructors' },
  'academy.instructors.desc': { fa: 'یادگیری از بهترین‌های بازارهای مالی', en: 'Learn from the best in financial markets' },
  'academy.cta.title': { fa: 'آماده شروع سفر سرمایه‌گذاری هوشمند هستید؟', en: 'Ready to start your smart investment journey?' },
  'academy.cta.desc': { fa: 'به جمع دانشجویان آکادمی A|CAP بپیوندید و از صفر تا صد بازارهای مالی را حرفه‌ای یاد بگیرید', en: 'Join A|CAP Academy students and learn financial markets from zero to hero' },
  'academy.start.learning': { fa: 'شروع یادگیری', en: 'Start Learning' },
  'academy.my.dashboard': { fa: 'داشبورد من', en: 'My Dashboard' },

  // Academy levels
  'level.beginner': { fa: 'مبتدی', en: 'Beginner' },
  'level.intermediate': { fa: 'متوسط', en: 'Intermediate' },
  'level.advanced': { fa: 'پیشرفته', en: 'Advanced' },

  // Academy categories
  'cat.ict': { fa: 'ICT', en: 'ICT' },
  'cat.ai': { fa: 'هوش مصنوعی', en: 'AI' },
  'cat.stock': { fa: 'بورس', en: 'Stock' },
  'cat.forex': { fa: 'فارکس', en: 'Forex' },
  'cat.crypto': { fa: 'ارز دیجیتال', en: 'Crypto' },
  'cat.blockchain': { fa: 'بلاکچین', en: 'Blockchain' },
  'cat.trading': { fa: 'معامله‌گری', en: 'Trading' },
  'cat.psychology': { fa: 'روانشناسی', en: 'Psychology' },

  // Invite page
  'invite.title': { fa: 'دعوت از دوستان', en: 'Invite Friends' },
  'invite.desc': { fa: 'دوستان خود را به A|CAP دعوت کنید و پاداش بگیرید', en: 'Invite your friends to A|CAP and earn rewards' },

  // Common
  'common.today': { fa: 'امروز', en: 'Today' },
  'common.yesterday': { fa: 'دیروز', en: 'Yesterday' },
  'common.back': { fa: 'بازگشت', en: 'Back' },
  'common.close': { fa: 'بستن', en: 'Close' },
  'common.loading': { fa: 'در حال بارگذاری...', en: 'Loading...' },
  'common.error': { fa: 'خطایی رخ داد', en: 'An error occurred' },
  'common.error.desc': { fa: 'متأسفانه مشکلی پیش آمده. لطفاً مجدد تلاش کنید.', en: 'Something went wrong. Please try again.' },
  'common.retry': { fa: 'تلاش مجدد', en: 'Retry' },
  'common.save': { fa: 'ذخیره', en: 'Save' },
  'common.cancel': { fa: 'لغو', en: 'Cancel' },
  'common.delete': { fa: 'حذف', en: 'Delete' },
  'common.edit': { fa: 'ویرایش', en: 'Edit' },
  'common.create': { fa: 'ایجاد', en: 'Create' },
  'common.search': { fa: 'جستجو', en: 'Search' },
  'common.no.data': { fa: 'داده‌ای وجود ندارد', en: 'No data available' },
  'common.confirm': { fa: 'تایید', en: 'Confirm' },

  // Theme
  'theme.dark': { fa: 'تم تاریک', en: 'Dark Theme' },
  'theme.binance': { fa: 'تم نارنجی', en: 'Orange Theme' },
  'theme.toggle': { fa: 'تغییر تم', en: 'Toggle Theme' },

  // Language
  'lang.switch': { fa: 'English', en: 'فارسی' },
  'lang.switch.to.en': { fa: 'Switch to English', en: 'تغییر به فارسی' },

  // Hero
  'hero.subtitle': { fa: 'دستیار هوشمند مدیریت سرمایه', en: 'Smart Investment Assistant' },
  'hero.cta': { fa: 'شروع کنید', en: 'Get Started' },

  // Hero
  'hero.badge': { fa: 'دستیار مدیریت سرمایه مبتنی بر شخصیت مالی', en: 'Personality-Based Investment Assistant' },
  'hero.headline.1': { fa: 'سرمایه‌ات را', en: 'Invest' },
  'hero.headline.2': { fa: 'هوشمند مدیریت کن', en: 'Smart, Not Hard' },
  'hero.sub.1': { fa: 'A | CAP با تحلیل شخصیت مالی شما، نقشه سرمایه‌گذاری اختصاصی طراحی می‌کند.', en: 'A|CAP designs a personalized investment roadmap based on your financial personality.' },
  'hero.sub.2': { fa: 'نه بر پایه هیجان، بلکه بر پایه اطلاعات.', en: 'Based on data, not emotion.' },
  'hero.cta.quiz': { fa: 'تست شخصیت مالی — رایگان', en: 'Free Personality Quiz' },
  'hero.cta.login': { fa: 'ورود / ثبت\u200cنام', en: 'Login / Register' },
  'hero.stat.users': { fa: 'کاربر فعال', en: 'Active Users' },
  'hero.stat.markets': { fa: 'بازار پوشش داده\u200cشده', en: 'Markets Covered' },
  'hero.stat.types': { fa: 'تیپ شخصیت مالی', en: 'Personality Types' },
  'hero.stat.satisfaction': { fa: 'رضایت کاربران', en: 'User Satisfaction' },
  'hero.scroll': { fa: 'اسکرول پایین', en: 'Scroll Down' },

  // Footer
  'footer.disclaimer.title': { fa: 'افشای ریسک و سلب مسئولیت', en: 'Risk Disclosure' },
  'footer.disclaimer.text': { fa: 'سرمایه‌گذاری در بازارهای مالی با ریسک ذاتی همراه است. تمام مطالب و تحلیل‌های ارائه‌شده توسط A | CAP جنبه اطلاعاتی و آموزشی دارند و توصیه سرمایه‌گذاری قطعی نیستند. تمام مسئولیت تصمیمات مالی برعهده شخص سرمایه‌گذار است.', en: 'Investing in financial markets involves inherent risk. All content and analysis provided by A|CAP is for informational and educational purposes only and does not constitute investment advice. All financial decisions are the sole responsibility of the investor.' },
  'footer.tagline': { fa: 'دستیار مدیریت سرمایه مبتنی بر شخصیت مالی — نقشه ثروت اختصاصی شما', en: 'Personality-Based Investment Assistant — Your Custom Wealth Map' },
  'footer.sections': { fa: 'بخش‌ها', en: 'Sections' },
  'footer.get.started': { fa: 'شروع کن', en: 'Get Started' },
  'footer.cta.quiz': { fa: 'تست شخصیت مالی رایگان', en: 'Free Personality Quiz' },
  'footer.cta.plus': { fa: 'اشتراک ACAP Plus', en: 'ACAP Plus Subscription' },
  'footer.cta.ambassador': { fa: 'عضویت در برنامه سفیران', en: 'Join Ambassador Program' },
  'footer.copyright': { fa: '© ۱۴۰۴ A | CAP — تمامی حقوق محفوظ است', en: '© 2025 A|CAP — All Rights Reserved' },
  'footer.available': { fa: 'در دسترس روی:', en: 'Available on:' },
  'footer.system.active': { fa: 'سیستم فعال', en: 'System Active' },
  'footer.support': { fa: 'پشتیبانی تلگرام', en: 'Telegram Support' },

  // About section
  'about.badge': { fa: 'ما که هستیم؟', en: 'Who We Are?' },
  'about.headline.1': { fa: 'یک اکوسیستم کامل', en: 'A Complete' },
  'about.headline.2': { fa: 'مدیریت ثروت', en: 'Wealth Management' },
  'about.desc': { fa: 'در A | CAP باور داریم که هیچ نسخه یکسانی برای همه سرمایه‌گذاران وجود ندارد. ما برای شما نقشه مدیریت ثروت شخصی می‌سازیم.', en: 'At A|CAP we believe there is no one-size-fits-all for investors. We build your personal wealth management roadmap.' },
  'about.quote': { fa: '«A | CAP جایی است برای کسانی که می‌خواهند سرمایه‌گذاری را نه بر پایه هیجان، بلکه بر پایه تحلیل، مدیریت ریسک و برنامه‌ریزی بلندمدت دنبال کنند.»', en: '"A|CAP is for those who want to pursue investing based on analysis, risk management, and long-term planning — not emotion."' },
  'about.mission': { fa: 'ماموریت ما ایجاد شفافیت در تصمیمات مالی، ارتقای سواد سرمایه‌گذاری و کمک به ساخت سبدهای سرمایه‌گذاری متعادل و هوشمند است.', en: 'Our mission is to create transparency in financial decisions, improve investment literacy, and help build balanced, intelligent portfolios.' },
  'about.stat.analyzed': { fa: 'بازارهای تحلیل\u200cشده', en: 'Analyzed Markets' },
  'about.stat.active': { fa: 'بازار فعال', en: 'Active Markets' },
  'about.stat.type': { fa: 'نوع شخصیت مالی', en: 'Personality Type' },
  'about.stat.investor': { fa: 'تیپ سرمایه‌گذار', en: 'Investor Type' },
  'about.stat.ambassador': { fa: 'برنامه سفیران', en: 'Ambassador Program' },
  'about.stat.link': { fa: 'لینک اختصاصی', en: 'Referral Link' },
  'about.stat.premium': { fa: 'اشتراک پریمیوم', en: 'Premium Subscription' },
  'about.markets.title': { fa: 'بازارهایی که پوشش می\u200cدهیم', en: 'Markets We Cover' },

  // About markets
  'about.mkt.stock': { fa: 'بورس', en: 'Stock Market' },
  'about.mkt.stock.desc': { fa: 'تحلیل سهام و اوراق بهادار', en: 'Stock & Securities Analysis' },
  'about.mkt.gold': { fa: 'طلا', en: 'Gold' },
  'about.mkt.gold.desc': { fa: 'فرصت‌های بازار طلا', en: 'Gold Market Opportunities' },
  'about.mkt.currency': { fa: 'ارز و دلار', en: 'Currency' },
  'about.mkt.currency.desc': { fa: 'تحلیل نرخ ارز', en: 'Exchange Rate Analysis' },
  'about.mkt.crypto': { fa: 'ارز دیجیتال', en: 'Crypto' },
  'about.mkt.crypto.desc': { fa: 'سیگنال‌های کریپتو', en: 'Crypto Signals' },
  'about.mkt.forex': { fa: 'فارکس', en: 'Forex' },
  'about.mkt.forex.desc': { fa: 'بازار جهانی فارکس', en: 'Global Forex Market' },
  'about.mkt.fund': { fa: 'صندوق‌های سرمایه', en: 'Investment Funds' },
  'about.mkt.fund.desc': { fa: 'صندوق‌های درآمد ثابت و کالا', en: 'Fixed Income & Commodity Funds' },

  // About values
  'about.val.smart': { fa: 'هوشمند', en: 'Smart' },
  'about.val.smart.desc': { fa: 'ساخت سبد سرمایه‌گذاری بر اساس شخصیت مالی شما به کمک هوش مصنوعی', en: 'AI-powered portfolio construction based on your financial personality' },
  'about.val.secure': { fa: 'امن', en: 'Secure' },
  'about.val.secure.desc': { fa: 'مدیریت ریسک حرفه‌ای. هیچ فرصتی بیش از ۲۰٪ سرمایه را درگیر نمی‌کند', en: 'Professional risk management. No single position exceeds 20% of your capital.' },
  'about.val.precise': { fa: 'دقیق', en: 'Precise' },
  'about.val.precise.desc': { fa: 'تحلیل جریان نقدینگی و رفتار بازار با متدولوژی ICT', en: 'Liquidity flow & market behavior analysis using ICT methodology' },
  'about.val.transparent': { fa: 'شفاف', en: 'Transparent' },
  'about.val.transparent.desc': { fa: 'سیگنال‌های واضح با سطح ریسک مشخص: کم‌ریسک، متعادل، پرریسک', en: 'Clear signals with defined risk levels: Low, Balanced, High' },
  'about.val.realtime': { fa: 'لحظه\u200cای', en: 'Real-time' },
  'about.val.realtime.desc': { fa: 'آپدیت‌ها و هشدارهای لحظه‌ای در همه بازارها', en: 'Real-time updates & alerts across all markets' },
  'about.val.social': { fa: 'اجتماعی', en: 'Social' },
  'about.val.social.desc': { fa: 'اکوسیستم سفیران با درآمد پایدار از معرفی A|CAP', en: 'Ambassador ecosystem with sustainable referral income' },

  // Blog section (homepage)
  'blog.badge': { fa: 'وبلاگ', en: 'Blog' },
  'blog.section.title.1': { fa: 'آخرین مطالب', en: 'Latest' },
  'blog.section.title.2': { fa: 'تحلیلی', en: 'Analytics' },
  'blog.section.subtitle': { fa: 'مقالات آموزشی، تحلیل‌های روز و اخبار بازارهای مالی', en: 'Educational articles, daily analysis & financial market news' },
  'blog.view.all': { fa: 'همه مطالب', en: 'View All' },
  'blog.post1.title': { fa: 'بهترین استراتژی‌های معاملاتی ۱۴۰۴', en: 'Best Trading Strategies 2025' },
  'blog.post1.desc': { fa: 'بررسی جامع استراتژی‌های برتر معاملاتی برای بازارهای ایران', en: 'Comprehensive review of top trading strategies for Iranian markets' },
  'blog.post2.title': { fa: 'هوش مصنوعی در سرمایه‌گذاری', en: 'AI in Investing' },
  'blog.post2.desc': { fa: 'چگونه AI می‌تواند به تصمیمات مالی شما کمک کند', en: 'How AI can help your financial decisions' },
  'blog.post3.title': { fa: 'تحلیل بازارهای جهانی', en: 'Global Market Analysis' },
  'blog.post3.desc': { fa: 'بررسی آخرین روندهای بازارهای مالی بین‌المللی', en: 'Latest trends in international financial markets' },

  // Blog page
  'blog.hero.badge': { fa: 'دانشنامه سرمایه‌گذاری هوشمند', en: 'Smart Investment Encyclopedia' },
  'blog.hero.title': { fa: 'وبلاگ', en: 'Blog' },
  'blog.hero.desc': { fa: 'مقالات تخصصی در زمینه مدیریت سرمایه، تحلیل بازارهای مالی، شخصیت‌شناسی مالی و معرفی ابزارهای هوشمند سرمایه‌گذاری', en: 'Specialized articles on investment management, financial market analysis, financial psychology, and smart investment tools.' },
  'blog.search.placeholder': { fa: 'جستجوی مقاله...', en: 'Search articles...' },
  'blog.featured.title': { fa: 'مقالات ویژه', en: 'Featured Articles' },
  'blog.featured.subtitle': { fa: 'پرطرفدارترین و جدیدترین مطالب', en: 'Most popular & latest content' },
  'blog.featured.badge': { fa: 'ویژه', en: 'Featured' },
  'blog.filter.all': { fa: 'همه مقالات', en: 'All Articles' },
  'blog.empty.title': { fa: 'هنوز مقاله‌ای منتشر نشده', en: 'No Articles Published Yet' },
  'blog.empty.desc': { fa: 'به زودی مقالات آموزشی جدید در این بخش منتشر خواهد شد. برای اطلاع از آخرین مطالب، ما را دنبال کنید.', en: 'New educational articles will be published soon. Follow us to stay updated.' },
  'blog.empty.cta': { fa: 'مشاهده همه مقالات', en: 'View All Articles' },
  'blog.load.more': { fa: 'مقالات بیشتر', en: 'More Articles' },
  'blog.loading': { fa: 'در حال بارگذاری...', en: 'Loading...' },
  'blog.min.read': { fa: 'دقیقه', en: 'min read' },
  'blog.views': { fa: 'بازدید', en: 'Views' },
  'blog.back.dashboard': { fa: 'بازگشت به داشبورد', en: 'Back to Dashboard' },

  // Article page
  'article.breadcrumb.home': { fa: 'خانه', en: 'Home' },
  'article.breadcrumb.blog': { fa: 'وبلاگ', en: 'Blog' },
  'article.reading.time': { fa: 'زمان مطالعه:', en: 'Reading time:' },
  'article.minutes': { fa: 'دقیقه', en: 'min' },
  'article.views': { fa: 'بازدید', en: 'views' },
  'article.educational': { fa: 'مقاله آموزشی', en: 'Educational Article' },
  'article.no.content': { fa: 'بدون محتوا', en: 'No content' },
  'article.tags': { fa: 'برچسب\u200cها:', en: 'Tags:' },
  'article.share': { fa: 'اشتراک\u200cگذاری:', en: 'Share:' },
  'article.copied': { fa: 'کپی شد!', en: 'Copied!' },
  'article.copy.link': { fa: 'کپی لینک', en: 'Copy Link' },
  'article.telegram': { fa: 'تلگرام', en: 'Telegram' },
  'article.twitter': { fa: 'توییتر', en: 'Twitter' },
  'article.back.blog': { fa: 'بازگشت به وبلاگ', en: 'Back to Blog' },

  // Academy catalog
  'catalog.title': { fa: 'دوره‌های آموزشی', en: 'Courses' },
  'catalog.subtitle': { fa: 'مرور و جستجوی تمام دوره‌های آکادمی A|CAP', en: 'Browse all A|CAP Academy courses' },
  'catalog.search.placeholder': { fa: 'جستجوی دوره...', en: 'Search courses...' },
  'catalog.filters': { fa: 'فیلترها', en: 'Filters' },
  'catalog.category': { fa: 'دسته\u200cبندی', en: 'Category' },
  'catalog.level': { fa: 'سطح دوره', en: 'Level' },
  'catalog.instructor': { fa: 'استاد', en: 'Instructor' },
  'catalog.found': { fa: 'دوره پیدا شد', en: 'courses found' },
  'catalog.empty.title': { fa: 'دوره\u200cای یافت نشد', en: 'No courses found' },
  'catalog.empty.desc': { fa: 'متن جستجو یا فیلترهای خود را تغییر دهید', en: 'Try different search or filter criteria' },
  'catalog.sort.popular': { fa: 'محبوب\u200cترین', en: 'Most Popular' },
  'catalog.sort.newest': { fa: 'جدیدترین', en: 'Newest' },
  'catalog.sort.price.asc': { fa: 'قیمت: کم به زیاد', en: 'Price: Low to High' },
  'catalog.sort.price.desc': { fa: 'قیمت: زیاد به کم', en: 'Price: High to Low' },
  'catalog.all.instructors': { fa: 'همه اساتید', en: 'All Instructors' },
  'catalog.new': { fa: 'جدید', en: 'New' },
  'catalog.bestseller': { fa: 'پرفروش', en: 'Bestseller' },
  'catalog.toman': { fa: 'تومان', en: 'Toman' },

  // Academy dashboard
  'acadash.welcome': { fa: 'خوش آمدید، {{name}}', en: 'Welcome, {{name}}' },
  'acadash.welcome.sub': { fa: 'به داشبورد آموزشی خود خوش آمدید', en: 'Welcome to your learning dashboard' },
  'acadash.stat.enrolled': { fa: 'دوره‌های ثبت نامی', en: 'Enrolled Courses' },
  'acadash.stat.completed': { fa: 'دوره‌های تکمیل شده', en: 'Completed Courses' },
  'acadash.stat.hours': { fa: 'ساعت تماشا', en: 'Hours Watched' },
  'acadash.stat.progress': { fa: 'پیشرفت کلی', en: 'Overall Progress' },
  'acadash.empty.title': { fa: 'هنوز در دوره‌ای ثبت نام نکرده‌اید', en: 'No Courses Enrolled Yet' },
  'acadash.empty.desc': { fa: 'با ثبت نام در دوره‌های آکادمی A|CAP، مسیر یادگیری سرمایه‌گذاری هوشمند را آغاز کنید', en: 'Enroll in A|CAP Academy courses and start your smart investment learning journey' },
  'acadash.browse': { fa: 'مرور دوره‌ها', en: 'Browse Courses' },
  'acadash.home': { fa: 'صفحه اصلی آکادمی', en: 'Academy Home' },
  'acadash.continue': { fa: 'ادامه یادگیری', en: 'Continue Learning' },
  'acadash.continue.desc': { fa: 'دوره‌هایی که در حال گذراندن هستید', en: 'Courses you are currently taking' },
  'acadash.progress': { fa: 'پیشرفت', en: 'Progress' },
  'acadash.completed.title': { fa: 'دوره‌های تکمیل شده', en: 'Completed Courses' },
  'acadash.completed.desc': { fa: 'تبریک! این دوره‌ها را با موفقیت به پایان رسانده‌اید', en: 'Congratulations! You have successfully completed these courses' },
  'acadash.completed.badge': { fa: 'تکمیل شده', en: 'Completed' },
  'acadash.all.courses': { fa: 'همه دوره‌های من', en: 'All My Courses' },
  'acadash.count': { fa: 'دوره', en: 'Courses' },
  'acadash.cta.title': { fa: 'به یادگیری ادامه دهید', en: 'Continue Learning' },
  'acadash.cta.desc': { fa: 'دوره‌های جدید را کاوش کنید و مهارت‌های خود را ارتقا دهید', en: 'Explore new courses and upgrade your skills' },

  // Course detail
  'course.not.found': { fa: 'دوره مورد نظر یافت نشد', en: 'Course not found' },
  'course.back.catalog': { fa: 'بازگشت به کاتالوگ', en: 'Back to Catalog' },
  'course.breadcrumb.academy': { fa: 'آکادمی', en: 'Academy' },
  'course.breadcrumb.courses': { fa: 'دوره‌ها', en: 'Courses' },
  'course.bestseller': { fa: 'پرفروش', en: 'Bestseller' },
  'course.new': { fa: 'جدید', en: 'New' },
  'course.students': { fa: 'دانشجو', en: 'Students' },
  'course.lessons': { fa: 'درس', en: 'Lessons' },
  'course.video.hours': { fa: 'ساعت ویدیو', en: 'Video Hours' },
  'course.discount': { fa: '{{percent}}% تخفیف ویژه', en: '{{percent}}% Special Discount' },
  'course.toman': { fa: 'تومان', en: 'Toman' },
  'course.enrolled': { fa: 'ثبت نام شدید', en: 'Enrolled' },
  'course.start': { fa: 'شروع دوره', en: 'Start Course' },
  'course.lifetime': { fa: 'دسترسی مادام العمر', en: 'Lifetime Access' },
  'course.online.offline': { fa: 'آموزش آنلاین و آفلاین', en: 'Online & Offline Learning' },
  'course.dedicated.support': { fa: 'پشتیبانی اختصاصی', en: 'Dedicated Support' },
  'course.what.learn': { fa: 'در این دوره چه یاد می\u200cگیرید؟', en: 'What Will You Learn?' },
  'course.prerequisites': { fa: 'پیش\u200cنیازها', en: 'Prerequisites' },
  'course.syllabus': { fa: 'سرفصل‌های دوره', en: 'Course Syllabus' },
  'course.module': { fa: 'ماژول {{number}}', en: 'Module {{number}}' },
  'course.lesson': { fa: 'درس {{number}}', en: 'Lesson {{number}}' },
  'course.updating': { fa: 'در حال بروزرسانی', en: 'Updating' },
  'course.instructor.card': { fa: 'مدرس دوره', en: 'Instructor' },
  'course.info': { fa: 'اطلاعات دوره', en: 'Course Info' },
  'course.stat.students': { fa: 'تعداد دانشجویان', en: 'Students Count' },
  'course.stat.duration': { fa: 'مدت زمان', en: 'Duration' },
  'course.stat.lessons': { fa: 'تعداد دروس', en: 'Lessons Count' },
  'course.stat.video': { fa: 'ساعت ویدیو', en: 'Video Hours' },
  'course.stat.level': { fa: 'سطح دوره', en: 'Level' },
  'course.stat.category': { fa: 'دسته\u200cبندی', en: 'Category' },
  'course.share': { fa: 'اشتراک\u200cگذاری دوره', en: 'Share Course' },
  'course.related': { fa: 'دوره‌های مرتبط', en: 'Related Courses' },
  'course.view.all': { fa: 'مشاهده همه', en: 'View All' },

  // ACAP Plus
  'plus.subtitle': { fa: 'سطح بعدی مدیریت سرمایه هوشمند', en: 'Next Level Smart Investment Management' },
  'plus.feature.custom': { fa: 'پیشنهادات سرمایه‌گذاری اختصاصی', en: 'Custom Investment Proposals' },
  'plus.feature.signals': { fa: 'سیگنال‌های خرید و فروش لحظه‌ای', en: 'Real-time Buy/Sell Signals' },
  'plus.feature.portfolio': { fa: 'تحلیل اختصاصی پورتفولیو', en: 'Dedicated Portfolio Analysis' },
  'plus.feature.vip': { fa: 'پشتیبانی VIP در تلگرام', en: 'VIP Telegram Support' },
  'plus.feature.academy': { fa: 'دسترسی به آکادمی A|CAP', en: 'ACAP Academy Access' },
  'plus.requested': { fa: 'درخواست شما ثبت شد. پس از تأیید ادمین فعال خواهد شد.', en: 'Your request has been submitted. It will be activated after admin approval.' },
  'plus.request': { fa: 'درخواست A|CAP+', en: 'Request A|CAP+' },
  'plus.activate': { fa: 'فعال\u200cسازی از طریق تلگرام', en: 'Activate via Telegram' },
  'plus.back': { fa: 'بازگشت به داشبورد', en: 'Back to Dashboard' },
  'plus.online': { fa: 'آنلاین', en: 'Online' },
  'plus.suggestions': { fa: '{{count}} پیشنهاد', en: '{{count}} Suggestions' },
  'plus.empty.title': { fa: 'هنوز پیشنهادی دریافت نکردی', en: 'No suggestions yet' },
  'plus.empty.desc': { fa: 'به زودی اولین پیشنهاد اختصاصی برات میاد', en: 'Your first custom suggestion coming soon' },
  'plus.bot.welcome': { fa: 'سلام! اینجا پیشنهادات اختصاصی سرمایه‌گذاری برای تو قرار می‌گیره. هر پیشنهاد می‌تونه شامل تحلیل، تصویر، ویس و ویدئو باشه.', en: 'Hi! This is where your exclusive investment suggestions will appear. Each suggestion can include analysis, images, voice, and video.' },
  'plus.bot.now': { fa: 'هماکنون', en: 'Now' },
  'plus.suggestion.label': { fa: 'پیشنهاد اختصاصی', en: 'Custom Suggestion' },
  'plus.voice.label': { fa: 'ویس پیام', en: 'Voice Message' },
  'plus.input.placeholder': { fa: '💬 برای ثبت نظر با ادمین تماس بگیرید', en: '💬 Contact admin to comment' },
  'plus.input.empty': { fa: 'هنوز پیشنهادی نیست', en: 'No suggestions yet' },

  // Admin setup
  'setup.title': { fa: 'تنظیم مدیر سیستم', en: 'Admin Setup' },
  'setup.desc': { fa: 'ایمیلی را وارد کنید که با آن ثبت‌نام کرده‌اید و هم‌اکنون با آن لاگین هستید.', en: 'Enter the email you registered with and are currently logged in with.' },
  'setup.success.title': { fa: 'ادمین با موفقیت تنظیم شد', en: 'Admin Setup Successful' },
  'setup.success.desc': { fa: 'اکنون می‌توانید وارد پنل ادمین شوید.', en: 'You can now access the admin panel.' },
  'setup.go.admin': { fa: 'ورود به پنل ادمین', en: 'Go to Admin Panel' },
  'setup.email.label': { fa: 'ایمیل حساب مدیریت', en: 'Admin Account Email' },
  'setup.email.placeholder': { fa: 'admin@example.com', en: 'admin@example.com' },
  'setup.email.hint': { fa: 'از حسابی که قبلاً ثبت‌نام کرده‌اید استفاده کنید.', en: 'Use an account you have already registered with.' },
  'setup.loading': { fa: 'در حال تنظیم...', en: 'Setting up...' },
  'setup.submit': { fa: 'تنظیم به عنوان مدیر', en: 'Set as Admin' },
  'setup.back': { fa: 'بازگشت به صفحه اصلی', en: 'Back to Home' },
  'setup.error.generic': { fa: 'خطا در تنظیم ادمین', en: 'Admin setup error' },
  'setup.error.server': { fa: 'خطا در ارتباط با سرور', en: 'Server connection error' },

  // Not found
  'notfound.title': { fa: '۴۰۴', en: '404' },
  'notfound.subtitle': { fa: 'صفحه مورد نظر یافت نشد', en: 'Page Not Found' },
  'notfound.desc': { fa: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.', en: 'The page you are looking for does not exist or has been removed.' },
  'notfound.home': { fa: 'صفحه اصلی', en: 'Home' },
  'notfound.blog': { fa: 'وبلاگ', en: 'Blog' },

  // Root loading
  'root.loading': { fa: 'در حال بارگذاری...', en: 'Loading...' },

  // Terms modal
  'terms.title': { fa: 'قوانین و مقررات', en: 'Terms & Conditions' },
  'terms.reject': { fa: 'رد کردن', en: 'Decline' },
  'terms.accept': { fa: 'می‌پذیرم', en: 'I Accept' },
  'terms.got.it': { fa: 'متوجه شدم', en: 'Got It' },

  // Portfolio advisor
  'pa.no.quiz.title': { fa: 'تست شخصیت مالی انجام نشده', en: 'Financial Personality Quiz Not Taken' },
  'pa.no.quiz.desc': { fa: 'برای دریافت مشاوره پرتفوی، ابتدا تست شخصیت مالی را انجام دهید', en: 'Take the financial personality quiz to get portfolio advice' },
  'pa.no.quiz.cta': { fa: 'شروع تست شخصیت مالی', en: 'Start Personality Quiz' },
  'pa.empty.title': { fa: 'سبد دارایی خالی است', en: 'Empty Portfolio' },
  'pa.empty.desc': { fa: 'برای دریافت مشاوره، ابتدا دارایی‌های خود را اضافه کنید', en: 'Add your assets to get portfolio advice' },
  'pa.personality': { fa: 'شخصیت مالی شما', en: 'Your Financial Personality' },
  'pa.score': { fa: 'امتیاز تطابق پرتفوی', en: 'Portfolio Match Score' },
  'pa.comparison': { fa: 'مقایسه توزیع فعلی و ایده‌آل', en: 'Current vs Ideal Allocation' },
  'pa.current': { fa: 'وضعیت فعلی', en: 'Current' },
  'pa.ideal': { fa: 'مقدار ایده‌آل', en: 'Ideal' },
  'pa.needs.increase': { fa: 'نیاز به افزایش', en: 'Needs Increase' },
  'pa.needs.decrease': { fa: 'نیاز به کاهش', en: 'Needs Decrease' },
  'pa.recommendations': { fa: 'توصیه های پرتفوی', en: 'Portfolio Recommendations' },
  'pa.total.value': { fa: 'ارزش کل پرتفوی', en: 'Total Portfolio Value' },
  'pa.asset.count': { fa: 'تعداد دارایی‌ها', en: 'Asset Count' },
  'pa.category.count': { fa: 'تعداد دسته‌ها', en: 'Category Count' },
  'pa.from': { fa: 'از {{value}}', en: 'out of {{value}}' },

  // ACAP Offers
  'offers.title': { fa: 'پیشنهادات A|CAP', en: 'A|CAP Offers' },
  'offers.subtitle': { fa: 'پیشنهادات معاملاتی بر اساس تحلیل هوش مصنوعی', en: 'Trading suggestions based on AI analysis' },
  'offers.total': { fa: 'کل', en: 'Total' },
  'offers.wins': { fa: 'برد', en: 'Wins' },
  'offers.losses': { fa: 'باخت', en: 'Losses' },
  'offers.win.rate': { fa: 'نرخ برد', en: 'Win Rate' },
  'offers.profit': { fa: 'سود', en: 'Profit' },
  'offers.loss': { fa: 'ضرر', en: 'Loss' },
  'offers.asset.type': { fa: 'نوع دارایی', en: 'Asset Type' },
  'offers.duration': { fa: 'مدت', en: 'Duration' },
  'offers.days': { fa: 'روز', en: 'Days' },

  // Meta descriptions
  'meta.app.title': { fa: 'پنل کاربری A|CAP — مدیریت سرمایه هوشمند', en: 'A|CAP Dashboard — Smart Investment Management' },
  'meta.app.desc': { fa: 'داشبورد مدیریت سرمایه، مشاهده دارایی‌ها، قیمت‌های لحظه‌ای بازار طلا، ارز، رمز ارز و بورس ایران.', en: 'Investment dashboard: manage assets, live prices for gold, currency, crypto, and Tehran Stock Exchange.' },

  // Additional keys for academy wiring
  'common.all': { fa: 'همه', en: 'All' },
  'common.active': { fa: 'فعال', en: 'Active' },
  'common.variable': { fa: 'متغیر', en: 'Variable' },
  'common.hours': { fa: 'ساعت', en: 'hrs' },
  'common.user': { fa: 'کاربر', en: 'User' },
  'catalog.all.categories': { fa: 'همه دوره‌ها', en: 'All Courses' },
  'catalog.level.all': { fa: 'همه سطوح', en: 'All Levels' },
  'course.instructor.founder': { fa: 'بنیان‌گذار A|CAP', en: 'Founder of A|CAP' },
  'course.instructor.analyst': { fa: 'تحلیلگر بازارهای مالی', en: 'Financial Market Analyst' },

  // Portfolio advisor dynamic advice
  'pa.increase': { fa: 'سهم {type} خود را {pct}٪ افزایش دهید', en: 'Increase your {type} share by {pct}%' },
  'pa.decrease': { fa: 'سهم {type} خود را {pct}٪ کاهش دهید', en: 'Decrease your {type} share by {pct}%' },
  'pa.balanced': { fa: 'پرتفوی شما متعادل است', en: 'Your portfolio is balanced' },
  'pa.crypto.to.gold': { fa: 'کریپتو خود را {pct}٪ کاهش دهید و به طلا اضافه کنید', en: 'Reduce crypto by {pct}% and add to gold' },
  'pa.reduce.other': { fa: 'سهم سایر دارایی‌های خود را {pct}٪ کاهش دهید', en: 'Reduce your other assets by {pct}%' },
  'pa.increase.stock': { fa: 'برای سرمایه‌گذاری در بورس ایران، {pct}٪ از سبد خود را اختصاص دهید', en: 'Allocate {pct}% of your portfolio to stocks' },

  // Common
  'common.uploading': { fa: 'در حال آپلود...', en: 'Uploading...' },
  'common.choose.file': { fa: 'انتخاب فایل', en: 'Choose File' },
  'common.refresh': { fa: 'رفرش صفحه', en: 'Refresh Page' },
  'common.refresh.desc': { fa: 'لطفاً صفحه را رفرش کنید', en: 'Please refresh the page' },

  // ACAP Offers asset types
  'offers.asset.btc': { fa: 'بیت‌کوین', en: 'Bitcoin' },
  'offers.asset.eth': { fa: 'اتریوم', en: 'Ethereum' },
  'offers.asset.gold': { fa: 'طلای اونس', en: 'Gold (XAU)' },
  'offers.asset.gold18': { fa: 'طلای ۱۸ عیار', en: '18K Gold' },
  'offers.asset.stock': { fa: 'بورس ایران', en: 'Stock' },
  'offers.asset.forex': { fa: 'فارکس', en: 'Forex' },
  'offers.asset.oil': { fa: 'نفت', en: 'Oil' },
  'offers.asset.silver': { fa: 'نقره', en: 'Silver' },
  'offers.asset.fund': { fa: 'صندوق', en: 'Fund' },
}
