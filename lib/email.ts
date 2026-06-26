import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetPasswordEmail(email: string, url: string) {
  if (!process.env.SMTP_USER) {
    console.log('Reset password URL:', url)
    return
  }
  await transporter.sendMail({
    from: `"A|CAP" <${process.env.SMTP_USER}>`,
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
