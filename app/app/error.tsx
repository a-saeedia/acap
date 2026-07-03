'use client'

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-black text-white mb-2">خطایی رخ داد</h1>
        <p className="text-sm text-gray-400 mb-6">{error.message || 'متأسفانه مشکلی پیش آمده. لطفاً مجدد تلاش کنید.'}</p>
        <button onClick={reset}
          className="px-6 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white font-medium transition-colors"
        >تلاش مجدد</button>
      </div>
    </div>
  )
}
