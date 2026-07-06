'use server'

import { db } from '@/lib/db'
import { siteSetting, siteComment, task, taskComment, user } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, desc, asc } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  if (users[0]?.role !== 'admin') throw new Error('Forbidden')
  return session.user.id
}

// ── Site Settings ──

export async function getSiteSettings() {
  await requireAdmin()
  return db.select().from(siteSetting).orderBy(asc(siteSetting.group), asc(siteSetting.key))
}

export async function updateSiteSetting(id: string, value: string) {
  const userId = await requireAdmin()
  await db.update(siteSetting).set({ value, updatedAt: new Date(), updatedBy: userId }).where(eq(siteSetting.id, id))
}

export async function createSiteSetting(data: { key: string; value: string; label: string; description?: string; type?: string; group?: string }) {
  await requireAdmin()
  const id = randomUUID()
  await db.insert(siteSetting).values({ id, ...data, type: data.type ?? 'text', group: data.group ?? 'general' })
  return id
}

export async function deleteSiteSetting(id: string) {
  await requireAdmin()
  await db.delete(siteSetting).where(eq(siteSetting.id, id))
}

// ── Site Comments ──

export async function getSiteComments(status?: string) {
  await requireAdmin()
  const query = db.select().from(siteComment).orderBy(desc(siteComment.createdAt))
  if (status) {
    return db.select().from(siteComment).where(eq(siteComment.status, status)).orderBy(desc(siteComment.createdAt))
  }
  return query
}

export async function createSiteComment(data: { path: string; selector?: string; section?: string; content: string; parentId?: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Forbidden')
  const id = randomUUID()
  await db.insert(siteComment).values({ id, userId: session.user.id, ...data })
  return id
}

export async function resolveSiteComment(id: string) {
  const userId = await requireAdmin()
  await db.update(siteComment).set({ status: 'resolved', resolvedAt: new Date(), resolvedBy: userId }).where(eq(siteComment.id, id))
}

export async function reopenSiteComment(id: string) {
  await requireAdmin()
  await db.update(siteComment).set({ status: 'open', resolvedAt: null, resolvedBy: null }).where(eq(siteComment.id, id))
}

export async function deleteSiteComment(id: string) {
  await requireAdmin()
  await db.delete(siteComment).where(eq(siteComment.id, id))
}

// ── Tasks ──

export async function getTasks(status?: string) {
  await requireAdmin()
  const query = db.select().from(task).orderBy(asc(task.order), desc(task.createdAt))
  if (status) {
    return db.select().from(task).where(eq(task.status, status)).orderBy(asc(task.order), desc(task.createdAt))
  }
  return query
}

export async function createTask(data: { title: string; description?: string; priority?: string; assignedTo?: string; dueDate?: string; tags?: string[] }) {
  const userId = await requireAdmin()
  const id = randomUUID()
  await db.insert(task).values({
    id,
    title: data.title,
    description: data.description ?? null,
    priority: data.priority ?? 'medium',
    assignedTo: data.assignedTo ?? null,
    createdBy: userId,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    order: 0,
  })
  return id
}

export async function updateTask(id: string, data: { title?: string; description?: string; status?: string; priority?: string; assignedTo?: string; dueDate?: string; tags?: string[]; order?: number }) {
  await requireAdmin()
  const updateData: any = { updatedAt: new Date() }
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) {
    updateData.status = data.status
    if (data.status === 'done') updateData.completedAt = new Date()
    else updateData.completedAt = null
  }
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
  if (data.order !== undefined) updateData.order = data.order
  await db.update(task).set(updateData).where(eq(task.id, id))
}

export async function deleteTask(id: string) {
  await requireAdmin()
  await db.delete(task).where(eq(task.id, id))
}

export async function getTaskComments(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Forbidden')
  return db.select().from(taskComment).where(eq(taskComment.taskId, taskId)).orderBy(desc(taskComment.createdAt))
}

export async function createTaskComment(taskId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Forbidden')
  const id = randomUUID()
  await db.insert(taskComment).values({ id, taskId, userId: session.user.id, content })
  return id
}
