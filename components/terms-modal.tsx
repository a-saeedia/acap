'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ScrollText } from 'lucide-react'

const TERMS = `قوانین و مقررات A | CAP

۱. معرفی خدمات
A Capital (ACAP) یک پلتفرم آموزشی و تحلیلی در حوزه مدیریت سرمایه است. تمامی محتوا، تحلیل‌ها و سیگنال‌های ارائه‌شده صرفاً جنبه آموزشی و اطلاع‌رسانی دارند.

۲. مسئولیت سرمایه‌گذاری
هیچ‌یک از مطالب A Capital توصیه مستقیم سرمایه‌گذاری نیستند. مسئولیت هر تصمیم مالی با کاربر است. A Capital هیچ‌گونه ضمانتی برای سود یا جلوگیری از ضرر نمی‌دهد.

۳. ریسک بازارهای مالی
سرمایه‌گذاری در بازارهای مالی همواره با ریسک همراه است. بازارهای مالی نوسانات بالایی دارند و احتمال از دست دادن بخشی یا تمام سرمایه وجود دارد.

۴. اشتراک و پرداخت
اشتراک A Capital از طریق کانال رسمی تلگرام قابل خرید است. در صورت عدم رضایت، تا ۷ روز پس از خرید امکان بازگشت وجه کامل وجود دارد.

۵. برنامه سفیران
شرکت در برنامه سفیران داوطلبانه است. هر کاربر پس از تکمیل تست شخصیت مالی یک لینک معرف اختصاصی دریافت می‌کند. آمار بازدید، تست و خرید از طریق لینک شما در داشبورد قابل مشاهده است.

۶. حریم خصوصی
اطلاعات کاربران صرفاً برای ارائه خدمات بهتر استفاده می‌شود و هرگز به اشخاص ثالث منتقل نخواهد شد. داده‌های شما با امنیت کامل نگهداری می‌شود.

۷. تغییرات
A Capital حق تغییر این قوانین را با اطلاع‌رسانی مناسب دارد. ادامه استفاده از خدمات پس از اطلاع‌رسانی، به‌منزله قبول تغییرات است.

با استفاده از خدمات A Capital، این قوانین را کامل پذیرفته‌اید.`

interface Props {
  open: boolean
  onClose: () => void
  onAccept?: () => void
  showAccept?: boolean
}

export function TermsModal({ open, onClose, onAccept, showAccept }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="glass border border-border rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ScrollText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-foreground font-black text-lg">قوانین و مقررات</h2>
                  <p className="text-muted-foreground text-xs">A | CAP</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="whitespace-pre-line text-muted-foreground text-sm leading-relaxed font-vazirmatn">
                {TERMS}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex-shrink-0 flex gap-3 justify-end">
              {showAccept ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-colors text-sm font-semibold"
                  >
                    رد کردن
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { onAccept?.(); onClose() }}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-black transition-all hover:shadow-lg hover:shadow-primary/30"
                  >
                    می‌پذیرم
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-black"
                >
                  متوجه شدم
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
