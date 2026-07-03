import type { Metadata } from 'next'
import AppLayout from './app-layout'

export const metadata: Metadata = {
  title: 'پنل کاربری A|CAP — مدیریت سرمایه هوشمند',
  description: 'داشبورد مدیریت سرمایه، مشاهده دارایی‌ها، قیمت‌های لحظه‌ای بازار طلا، ارز، رمز ارز و بورس ایران.',
  robots: { index: false, follow: false },
}

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
