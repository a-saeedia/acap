import { GoogleGenerativeAI } from "@google/generative-ai";

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const ACAP_CONTEXT = `You are a helpful and polite customer support agent for ACAP (A|CAP), a smart capital management platform. 
Answer the user's question concisely based on this brand context: 
- ACAP offers smart capital management, exclusive investment suggestions, real-time signals, portfolio analysis, VIP support via Telegram, and A|CAP Academy.
- Be professional, modern, and supportive.
- Reply in Persian (Farsi) by default unless user writes in English.`;

async function callGoogleAI(message: string): Promise<string | null> {
  try {
    const model = googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${ACAP_CONTEXT}\nUser message: ${message}`);
    return result.response.text();
  } catch (e) {
    console.error('Google AI error:', e);
    return null;
  }
}

async function callNvidiaAI(message: string): Promise<string | null> {
  if (!NVIDIA_API_KEY) return null;
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: ACAP_CONTEXT },
          { role: 'user', content: message },
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error('NVIDIA AI error:', e);
    return null;
  }
}

export async function POST(req: Request) {
  const { message } = await req.json();
  
  let response = await callGoogleAI(message);
  if (!response) {
    response = await callNvidiaAI(message);
  }
  if (!response) {
    return Response.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
  }
  return Response.json({ response });
}