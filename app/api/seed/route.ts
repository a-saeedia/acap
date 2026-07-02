import { seedDatabase } from '@/lib/seed'

export async function GET() {
  try {
    const result = await seedDatabase()
    return Response.json({ success: true, ...result })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
