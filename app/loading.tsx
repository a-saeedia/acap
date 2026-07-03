export default function Loading() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-crimson-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">در حال بارگذاری...</span>
      </div>
    </div>
  )
}
