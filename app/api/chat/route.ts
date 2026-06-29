import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  const { message } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a helpful and polite customer support agent for ACAP (A|CAP), a smart capital management platform. 
  Answer the user's question concisely based on this brand context: 
  - ACAP offers smart capital management, exclusive investment suggestions, real-time signals, portfolio analysis, VIP support via Telegram, and A|CAP Academy.
  - Be professional, modern, and supportive.
  User message: ${message}`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  return Response.json({ response });
}
