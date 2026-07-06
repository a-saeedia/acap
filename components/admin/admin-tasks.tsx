'use client'

import { useState, useEffect } from 'react'
import {
  getTasks, createTask, updateTask, deleteTask, getTaskComments, createTaskComment,
} from '@/app/actions/settings'
import {
  Loader2, Plus, X, Trash2, MessageSquare, Calendar, Flag, User, ChevronDown,
} from 'lucide-react'

type Task = Awaited<ReturnType<typeof getTasks>>[number]
type TaskComment = Awaited<ReturnType<typeof getTaskComments>>[number]

const COLUMNS = [
  { key: 'todo', label: '📋 برای انجام', color: '#3B82F6' },
  { key: 'in_progress', label: '⚡ در حال انجام', color: '#F59E0B' },
  { key: 'review', label: '🔍 بازبینی', color: '#8B5CF6' },
  { key: 'done', label: '✅ انجام شده', color: '#10B981' },
]

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'کم', color: '#6B7280' },
  medium: { label: 'متوسط', color: '#3B82F6' },
  high: { label: 'زیاد', color: '#F59E0B' },
  urgent: { label: 'فوری', color: '#EF4444' },
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })
  const [creating, setCreating] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [taskComments, setTaskComments] = useState<TaskComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentSending, setCommentSending] = useState(false)

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    setLoading(true)
    try { setTasks(await getTasks()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleCreate() {
    if (!createForm.title.trim()) return
    setCreating(true)
    try {
      await createTask(createForm)
      setShowCreate(false)
      setCreateForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })
      await loadTasks()
    } catch (e) { console.error(e) }
    setCreating(false)
  }

  async function handleStatusChange(id: string, status: string) {
    await updateTask(id, { status })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف شود؟')) return
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (e) { console.error(e) }
  }

  async function loadComments(taskId: string) {
    try {
      const comments = await getTaskComments(taskId)
      setTaskComments(comments)
    } catch (e) { console.error(e) }
  }

  async function handleExpand(taskId: string) {
    if (expandedTask === taskId) {
      setExpandedTask(null)
      setTaskComments([])
      return
    }
    setExpandedTask(taskId)
    await loadComments(taskId)
  }

  async function handleSendComment() {
    if (!expandedTask || !commentText.trim()) return
    setCommentSending(true)
    try {
      await createTaskComment(expandedTask, commentText)
      setCommentText('')
      await loadComments(expandedTask)
    } catch (e) { console.error(e) }
    setCommentSending(false)
  }

  const grouped = COLUMNS.map(col => ({
    ...col,
    tasks: tasks.filter(t => t.status === col.key).sort((a, b) => a.order - b.order),
  }))

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">مدیریت وظایف</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> وظیفه جدید
        </button>
      </div>

      {showCreate && (
        <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4 space-y-3">
          <input value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="عنوان وظیفه *"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
          <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} placeholder="توضیحات"
            rows={2} className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none resize-none" />
          <div className="grid grid-cols-3 gap-2">
            <select value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none">
              <option value="low">اولویت: کم</option>
              <option value="medium">اولویت: متوسط</option>
              <option value="high">اولویت: زیاد</option>
              <option value="urgent">اولویت: فوری</option>
            </select>
            <input value={createForm.assignedTo} onChange={e => setCreateForm({ ...createForm, assignedTo: e.target.value })} placeholder="محول به"
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
            <input value={createForm.dueDate} onChange={e => setCreateForm({ ...createForm, dueDate: e.target.value })} type="date"
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ایجاد'}
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.08] text-gray-400 text-sm font-bold hover:text-white transition-colors">انصراف</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {grouped.map(col => (
          <div key={col.key} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">{col.label}</h3>
              <span className="text-[10px] text-gray-500 bg-white/[0.08] px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {col.tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-600 text-xs">خالی</div>
              ) : (
                col.tasks.map(task => {
                  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
                  return (
                    <div key={task.id}>
                      <div className="bg-white/[0.08] border border-white/[0.08] rounded-xl p-3 hover:border-white/[0.15] transition-colors cursor-pointer"
                        onClick={() => handleExpand(task.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-white leading-snug flex-1">{task.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id) }}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 opacity-0 hover:opacity-100 transition-all shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: `${pri.color}20`, color: pri.color }}
                          >{pri.label}</span>
                          {task.assignedTo && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <User className="w-2.5 h-2.5" />{task.assignedTo}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(task.dueDate).toLocaleDateString('fa-IR')}
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedTask === task.id && (
                        <div className="mt-2 bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 space-y-2">
                          {task.description && <p className="text-xs text-gray-400">{task.description}</p>}
                          <div className="flex gap-1.5">
                            {COLUMNS.map(c => (
                              <button key={c.key} onClick={() => handleStatusChange(task.id, c.key)}
                                className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-colors ${task.status === c.key ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                                style={task.status === c.key ? { background: `${c.color}30`, color: c.color } : {}}
                                disabled={task.status === c.key}
                              >{c.label.split(' ').slice(1).join(' ')}</button>
                            ))}
                          </div>
                          <div className="border-t border-white/[0.08] pt-2">
                            <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                              {taskComments.map(c => (
                                <div key={c.id} className="text-[11px] text-gray-400">
                                  <span className="text-gray-500">{new Date(c.createdAt).toLocaleDateString('fa-IR')}: </span>
                                  {c.content}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1.5">
                              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                                placeholder="نظر..." className="flex-1 px-2 py-1.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-white text-xs outline-none" />
                              <button onClick={handleSendComment} disabled={commentSending || !commentText.trim()}
                                className="px-2 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {commentSending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ارسال'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
