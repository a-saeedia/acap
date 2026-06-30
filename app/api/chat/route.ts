import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

const ACAP_CONTEXT = `You are a smart investment advisor and customer support agent for A|CAP, a Persian capital management platform.
Your capabilities:
- Analyze investment portfolios and suggest improvements
- Explain financial concepts in simple Persian
- Provide risk assessment and diversification advice
- Recommend allocation strategies based on investor personality
- Answer questions about ACAP+ subscription, signals, and features

Rules:
- Be professional, concise, and supportive
- Default to Persian (Farsi), switch to English if user writes in English
- Never give guaranteed profit promises
- Always mention that investments carry risk
- Keep responses under 3 paragraphs unless asked for detail`;

const RATE_LIMIT = 10 // max requests per window
const rateMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Periodically clean stale entries
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateMap) if (now > val.resetAt) rateMap.delete(key)
}, 60000)

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  let message: string
  try {
    const body = await req.json()
    message = (body.message || '').replace(/[<>&]/g, '').trim().slice(0, 2000)
    if (!message) throw new Error()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(`${ACAP_CONTEXT}\n\nUser: ${message}`)
    const response = result.response.text()
    if (!response) throw new Error('Empty response')
    return Response.json({ response })
  } catch (e) {
    console.error('Gemini error:', e)
    return Response.json({ error: 'AI service temporarily unavailable' }, { status: 503 })
  }
}