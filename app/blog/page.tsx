import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'وبلاگ',
  description: 'مقالات آموزشی مدیریت سرمایه، تحلیل بازارهای مالی، شخصیت‌شناسی مالی و معرفی ابزارهای A|CAP',
  openGraph: { title: 'وبلاگ آموزشی A|CAP', description: 'مقالات آموزشی مدیریت سرمایه، تحلیل بازارهای مالی و شخصیت‌شناسی مالی' },
}

export default function BlogPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/app" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> بازگشت به داشبورد
        </Link>

        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-3xl font-black mb-3">وبلاگ A|CAP</h1>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            به زودی! مقالات آموزشی در مورد مدیریت سرمایه، تحلیل بازار طلا و ارز،
            شخصیت‌شناسی مالی و معرفی ابزارهای هوشمند A|CAP در این بخش منتشر خواهد شد.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { title: 'مدیریت سرمایه', desc: 'اصول و استراتژی‌های مدیریت سرمایه' },
              { title: 'تحلیل بازار', desc: 'بررسی بازار طلا، ارز، رمز ارز و بورس' },
              { title: 'شخصیت مالی', desc: 'شناسایی تیپ شخصیتی در سرمایه‌گذاری' },
            ].map(item => (
              <div key={item.title} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-right">
                <div className="text-xs font-bold text-primary mb-1">{item.title}</div>
                <div className="text-[10px] text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
