import { betterAuth } from 'better-auth'
import { pool } from './db'
import { sendResetPasswordEmail } from './email'

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL ?? 'http://localhost:3333'
}

const trustedOrigins = [
  process.env.V0_RUNTIME_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  process.env.BETTER_AUTH_URL,
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: pool,
  baseURL: getBaseURL(),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const token = url.split('/reset-password/')[1]?.split('?')[0] || ''
      const base = getBaseURL()
      await sendResetPasswordEmail(user.email, `${base}/reset-password?token=${token}`)
    },
  },
  ...(process.env.NODE_ENV === 'development' && {
    advanced: {
      defaultCookieAttributes: { sameSite: 'lax', secure: false },
    },
  }),
})
