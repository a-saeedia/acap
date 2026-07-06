'use client'

import { useState, useEffect } from 'react'
import { getSiteComments, resolveSiteComment, reopenSiteComment, deleteSiteComment } from '@/app/actions/settings'
import { Loader2, CheckCircle, RotateCcw, Trash2, MessageSquare, ExternalLink } from 'lucide-react'

type Comment = Awaited<ReturnType<typeof getSiteComments>>[number]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'باز', color: '#3B82F6' },
  resolved: { label: 'حل شده', color: '#10B981' },
  wontfix: { label: 'نیاز نیست', color: '#6B7280' },
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'صفحه اصلی',
  '/acap-plus': 'A|CAP+',
  '/app': 'داشبورد',
  '/app/assets': 'دارایی‌ها',
  '/app/prices': 'قیمت‌ها',
  '/app/academy': 'آکادمی',
  '/blog': 'وبلاگ',
  '/admin': 'پنل مدیریت',
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    loadComments()
  }, [])

  async function loadComments() {
    setLoading(true)
    try {
      const c = await getSiteComments(filter !== 'all' ? filter : undefined)
      setComments(c)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadComments() }, [filter])

  async function handleResolve(id: string) {
    setToggling(id)
    try { await resolveSiteComment(id); await loadComments() } catch (e) { console.error(e) }
    setToggling(null)
  }

  async function handleReopen(id: string) {
    setToggling(id)
    try { await reopenSiteComment(id); await loadComments() } catch (e) { console.error(e) }
    setToggling(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف شود؟')) return
    setToggling(id)
    try { await deleteSiteComment(id); await loadComments() } catch (e) { console.error(e) }
    setToggling(null)
  }

  const openCount = comments.filter(c => c.status === 'open').length

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">نظرات و پیشنهادات صفحات</h2>
        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
          {openCount} نظر باز
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'همه' },
          { value: 'open', label: 'باز' },
          { value: 'resolved', label: 'حل شده' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-white/[0.08] text-gray-400 hover:text-white'}`}
          >{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">هنوز نظری ثبت نشده</div>
      ) : (
        <div className="space-y-2">
          {comments.map(c => {
            const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open
            const pageLabel = PAGE_LABELS[c.path] || c.path
            return (
              <div key={c.id} className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <a href={c.path} target="_blank"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {pageLabel}
                      </a>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold`}
                        style={{ background: `${cfg.color}20`, color: cfg.color }}
                      >{cfg.label}</span>
                      {c.section && <span className="text-[10px] text-gray-500">{c.section}</span>}
                    </div>
                    <p className="text-sm text-white leading-relaxed">{c.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                      <span>{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status === 'open' ? (
                      <button onClick={() => handleResolve(c.id)} disabled={toggling === c.id}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 transition-colors"
                        title="علامت حل شده">
                        {toggling === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <button onClick={() => handleReopen(c.id)} disabled={toggling === c.id}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 transition-colors"
                        title="بازگشایی">
                        {toggling === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)} disabled={toggling === c.id}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-30 transition-colors"
                      title="حذف">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
