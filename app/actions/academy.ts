'use server'

import { db } from '@/lib/db'
import { course, enrollment, learningPath, article, articleCategory, user as userTable } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, asc, and } from 'drizzle-orm'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const [u] = await db.select().from(userTable).where(eq(userTable.id, session.user.id)).limit(1)
  if (u?.role !== 'admin') throw new Error('Forbidden')
  return session.user
}

function sanitize(str: string, maxLen = 2000) {
  return str.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

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

// --- Admin: Article CRUD ---

export async function createArticle(data: {
  title: string; slug: string; excerpt: string; content: string;
  categoryId?: string; author?: string; authorRole?: string;
  image?: string; tags?: string[]; readingTime?: number;
  isFeatured?: boolean; publishedAt?: string;
}) {
  await requireAdmin()
  const { randomUUID } = await import('node:crypto')
  const id = randomUUID()
  await db.insert(article).values({
    id,
    title: sanitize(data.title, 200),
    slug: data.slug,
    excerpt: sanitize(data.excerpt, 500),
    content: data.content,
    categoryId: data.categoryId || null,
    author: data.author || 'تیم A|CAP',
    authorRole: data.authorRole || 'تحلیلگر بازارهای مالی',
    image: data.image || null,
    tags: data.tags ? JSON.parse(JSON.stringify(data.tags)) : null,
    readingTime: data.readingTime || 5,
    isFeatured: data.isFeatured || false,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
  })
  return id
}

export async function updateArticle(id: string, data: {
  title?: string; slug?: string; excerpt?: string; content?: string;
  categoryId?: string; author?: string; authorRole?: string;
  image?: string; tags?: string[]; readingTime?: number;
  isFeatured?: boolean; publishedAt?: string;
}) {
  await requireAdmin()
  await db.update(article).set({
    ...(data.title && { title: sanitize(data.title, 200) }),
    ...(data.slug && { slug: data.slug }),
    ...(data.excerpt && { excerpt: sanitize(data.excerpt, 500) }),
    ...(data.content && { content: data.content }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
    ...(data.author && { author: data.author }),
    ...(data.authorRole !== undefined && { authorRole: data.authorRole || null }),
    ...(data.image !== undefined && { image: data.image || null }),
    ...(data.tags && { tags: JSON.parse(JSON.stringify(data.tags)) }),
    ...(data.readingTime && { readingTime: data.readingTime }),
    ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
    ...(data.publishedAt && { publishedAt: new Date(data.publishedAt) }),
    updatedAt: new Date(),
  }).where(eq(article.id, id))
}

export async function deleteArticle(id: string) {
  await requireAdmin()
  await db.delete(article).where(eq(article.id, id))
}

// --- Admin: Course CRUD ---

export async function createCourse(data: {
  title: string; slug: string; description: string; category: string;
  instructor: string; instructorName: string; price: number;
  originalPrice?: number; duration?: string; level?: string;
  lessons?: number; videoHours?: number; thumbnail?: string;
  color?: string; icon?: string; isPopular?: boolean; isNew?: boolean;
  isBestseller?: boolean; rating?: number; studentsCount?: number;
  prerequisites?: string; whatYouLearn?: string[]; syllabus?: any;
  publishedAt?: string;
}) {
  await requireAdmin()
  const { randomUUID } = await import('node:crypto')
  const id = randomUUID()
  await db.insert(course).values({
    id,
    title: sanitize(data.title, 200),
    slug: data.slug,
    description: sanitize(data.description, 1000),
    longDescription: null,
    category: data.category,
    instructor: data.instructor,
    instructorName: data.instructorName,
    price: data.price,
    originalPrice: data.originalPrice || null,
    duration: data.duration || null,
    level: data.level || 'beginner',
    lessons: data.lessons || 0,
    videoHours: data.videoHours || 0,
    thumbnail: data.thumbnail || null,
    color: data.color || '#3B82F6',
    icon: data.icon || 'BookOpen',
    isPopular: data.isPopular || false,
    isNew: data.isNew || false,
    isBestseller: data.isBestseller || false,
    rating: data.rating || 0,
    studentsCount: data.studentsCount || 0,
    prerequisites: data.prerequisites || null,
    whatYouLearn: data.whatYouLearn ? JSON.parse(JSON.stringify(data.whatYouLearn)) : null,
    syllabus: data.syllabus ? JSON.parse(JSON.stringify(data.syllabus)) : null,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
  })
  return id
}

export async function updateCourse(id: string, data: {
  title?: string; slug?: string; description?: string; category?: string;
  instructor?: string; instructorName?: string; price?: number;
  originalPrice?: number; duration?: string; level?: string;
  lessons?: number; videoHours?: number; thumbnail?: string;
  color?: string; icon?: string; isPopular?: boolean; isNew?: boolean;
  isBestseller?: boolean; rating?: number; studentsCount?: number;
  prerequisites?: string; whatYouLearn?: string[]; syllabus?: any;
  publishedAt?: string;
}) {
  await requireAdmin()
  await db.update(course).set({
    ...(data.title && { title: sanitize(data.title, 200) }),
    ...(data.slug && { slug: data.slug }),
    ...(data.description && { description: sanitize(data.description, 1000) }),
    ...(data.category && { category: data.category }),
    ...(data.instructor && { instructor: data.instructor }),
    ...(data.instructorName && { instructorName: data.instructorName }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice || null }),
    ...(data.duration !== undefined && { duration: data.duration || null }),
    ...(data.level && { level: data.level }),
    ...(data.lessons !== undefined && { lessons: data.lessons }),
    ...(data.videoHours !== undefined && { videoHours: data.videoHours }),
    ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail || null }),
    ...(data.color && { color: data.color }),
    ...(data.icon && { icon: data.icon }),
    ...(data.isPopular !== undefined && { isPopular: data.isPopular }),
    ...(data.isNew !== undefined && { isNew: data.isNew }),
    ...(data.isBestseller !== undefined && { isBestseller: data.isBestseller }),
    ...(data.rating !== undefined && { rating: data.rating }),
    ...(data.studentsCount !== undefined && { studentsCount: data.studentsCount }),
    ...(data.prerequisites !== undefined && { prerequisites: data.prerequisites || null }),
    ...(data.whatYouLearn && { whatYouLearn: JSON.parse(JSON.stringify(data.whatYouLearn)) }),
    ...(data.syllabus && { syllabus: JSON.parse(JSON.stringify(data.syllabus)) }),
    ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }),
    updatedAt: new Date(),
  }).where(eq(course.id, id))
}

export async function deleteCourse(id: string) {
  await requireAdmin()
  await db.delete(course).where(eq(course.id, id))
}
