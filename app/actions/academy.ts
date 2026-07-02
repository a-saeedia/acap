'use server'

import { db } from '@/lib/db'
import { course, enrollment, learningPath, article, articleCategory } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, asc, and } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getCourses(category?: string) {
  const q = db.select().from(course).orderBy(desc(course.isPopular), desc(course.studentsCount))
  if (category && category !== 'all') {
    return q.where(eq(course.category, category))
  }
  return q
}

export async function getCourseBySlug(slug: string) {
  const [c] = await db.select().from(course).where(eq(course.slug, slug)).limit(1)
  return c || null
}

export async function getCourseById(id: string) {
  const [c] = await db.select().from(course).where(eq(course.id, id)).limit(1)
  return c || null
}

export async function getFeaturedCourses() {
  return db.select().from(course).where(eq(course.isPopular, true)).orderBy(desc(course.studentsCount)).limit(6)
}

export async function getNewCourses() {
  return db.select().from(course).where(eq(course.isNew, true)).orderBy(desc(course.createdAt)).limit(4)
}

export async function getCoursesByInstructor(instructor: string) {
  return db.select().from(course).where(eq(course.instructor, instructor)).orderBy(desc(course.studentsCount))
}

export async function getMyEnrollments() {
  const userId = await getUserId()
  const rows = await db.select().from(enrollment).where(eq(enrollment.userId, userId)).orderBy(desc(enrollment.startedAt))
  const enrolledCourses = []
  for (const e of rows) {
    const [c] = await db.select().from(course).where(eq(course.id, e.courseId)).limit(1)
    if (c) enrolledCourses.push({ ...e, course: c })
  }
  return enrolledCourses
}

export async function enrollInCourse(courseId: string) {
  const userId = await getUserId()
  const [existing] = await db.select().from(enrollment).where(and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId))).limit(1)
  if (existing) return existing.id
  const { randomUUID } = await import('node:crypto')
  const id = randomUUID()
  await db.insert(enrollment).values({ id, userId, courseId })
  return id
}

export async function getLearningPaths() {
  return db.select().from(learningPath).orderBy(asc(learningPath.difficulty))
}

export async function getLearningPathBySlug(slug: string) {
  const [p] = await db.select().from(learningPath).where(eq(learningPath.slug, slug)).limit(1)
  if (!p) return null
  const courseIds: string[] = (p.courseIds as string[]) || []
  const pathCourses = courseIds.length > 0 ? await db.select().from(course).where(eq(course.id, courseIds[0])) : []
  return { ...p, courses: pathCourses }
}

export async function getPathRecommendations(investorType?: string, score?: number) {
  let paths = await db.select().from(learningPath)
  if (investorType) {
    const matched = paths.filter(p => p.investorType === investorType)
    if (matched.length > 0) paths = matched
  }
  if (score !== undefined) {
    const scored = paths.filter(p => {
      const min = p.minScore ?? 0
      const max = p.maxScore ?? 100
      return score >= min && score <= max
    })
    if (scored.length > 0) paths = scored
  }
  const result = []
  for (const p of paths.slice(0, 3)) {
    const courseIds: string[] = (p.courseIds as string[]) || []
    const pathCourses = courseIds.length > 0 ? await db.select().from(course).where(eq(course.id, courseIds[0])) : []
    result.push({ ...p, courses: pathCourses })
  }
  return result
}

export async function getArticles(categoryId?: string, page = 1, limit = 12) {
  const offset = (page - 1) * limit
  let q: any = db.select().from(article).orderBy(desc(article.publishedAt)) as any
  if (categoryId) q = q.where(eq(article.categoryId, categoryId))
  const items = await q.limit(limit).offset(offset)
  return items as any[]
}

export async function getArticleBySlug(slug: string) {
  const [a] = await db.select().from(article).where(eq(article.slug, slug)).limit(1)
  return a || null
}

export async function getFeaturedArticles() {
  return db.select().from(article).where(eq(article.isFeatured, true)).orderBy(desc(article.publishedAt)).limit(6)
}

export async function getArticleCategories() {
  return db.select().from(articleCategory).orderBy(asc(articleCategory.order))
}

export async function getCategoryBySlug(slug: string) {
  const [c] = await db.select().from(articleCategory).where(eq(articleCategory.slug, slug)).limit(1)
  return c || null
}

export async function getCategoryById(id: string) {
  const [c] = await db.select().from(articleCategory).where(eq(articleCategory.id, id)).limit(1)
  return c || null
}
