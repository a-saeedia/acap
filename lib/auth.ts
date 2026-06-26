import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 1,
})

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
  emailAndPassword: { enabled: true },
  ...(process.env.NODE_ENV === 'development' && {
    advanced: {
      defaultCookieAttributes: { sameSite: 'lax', secure: false },
    },
  }),
})
