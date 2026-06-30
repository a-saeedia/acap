import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from '@/lib/auth'

const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY
let googleAI: GoogleGenerativeAI | null = null
let keyOk = false
try {
  if (key && key.length > 0) {
    googleAI = new GoogleGenerativeAI(key)
    keyOk = true
  }
} catch { keyOk = false }

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

const RATE_LIMIT = 10
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

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateMap) if (now > val.resetAt) rateMap.delete(key)
}, 60000)

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!keyOk) {
    console.error('Chat: GOOGLE_GENERATIVE_AI_API_KEY missing or empty')
    return Response.json({ error: 'AI service not configured' }, { status: 503 })
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
    const model = googleAI!.getGenerativeModel({ model: "gemini-2.0-flash-001" })
    const result = await model.generateContent(`${ACAP_CONTEXT}\n\nUser: ${message}`)
    const response = result.response.text()
    if (!response) throw new Error('Empty response')
    return Response.json({ response })
  } catch (e) {
    console.error('Gemini error:', e instanceof Error ? e.message : e)
    return Response.json({ error: 'AI service temporarily unavailable' }, { status: 503 })
  }
}