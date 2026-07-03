import Link from 'next/link'

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl font-black text-crimson-600/30 mb-4">۴۰۴</div>
        <h1 className="text-2xl font-bold mb-2">صفحه مورد نظر یافت نشد</h1>
        <p className="text-gray-400 mb-8">صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-all">
            صفحه اصلی
          </Link>
          <Link href="/blog" className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-all">
            وبلاگ
          </Link>
        </div>
      </div>
    </div>
  )
}
