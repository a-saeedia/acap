import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM || 'A|CAP <onboarding@resend.dev>'

export async function sendResetPasswordEmail(email: string, url: string) {
  if (!resend) {
    console.log('RESEND_API_KEY not set. Reset URL:', url)
    return
  }
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'بازیابی رمز عبور - A Capital',
    html: `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 500px; margin: auto; padding: 20px;">
        <h2 style="color: #10B981;">بازیابی رمز عبور</h2>
        <p>برای تنظیم رمز عبور جدید، روی لینک زیر کلیک کنید:</p>
        <a href="${url}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
          تنظیم رمز عبور جدید
        </a>
        <p style="color: #666; font-size: 12px;">این لینک تا ۱ ساعت معتبر است.</p>
        <p style="color: #666; font-size: 12px;">اگر درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید.</p>
      </div>
    `,
  })
}
