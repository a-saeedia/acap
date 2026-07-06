'use client'

import { useState, useEffect } from 'react'
import { getSiteSettings, updateSiteSetting, createSiteSetting, deleteSiteSetting } from '@/app/actions/settings'
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react'

type Setting = Awaited<ReturnType<typeof getSiteSettings>>[number]

const GROUP_LABELS: Record<string, string> = {
  general: 'تنظیمات عمومی',
  landing: 'صفحه اصلی',
  pricing: 'قیمت‌ها و تعرفه',
  contact: 'ارتباط با ما',
  social: 'شبکه‌های اجتماعی',
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ key: '', value: '', label: '', description: '', type: 'text', group: 'general' })
  const [newCreating, setNewCreating] = useState(false)

  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s)
      const m: Record<string, string> = {}
      for (const item of s) m[item.id] = item.value
      setEdits(m)
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave(id: string) {
    setSaving(id)
    try {
      await updateSiteSetting(id, edits[id])
      setSettings(prev => prev.map(s => s.id === id ? { ...s, value: edits[id], updatedAt: new Date() } : s))
    } catch (e) { console.error(e) }
    setSaving(null)
  }

  async function handleCreate() {
    if (!newForm.key || !newForm.label) return
    setNewCreating(true)
    try {
      await createSiteSetting(newForm)
      setShowNew(false)
      setNewForm({ key: '', value: '', label: '', description: '', type: 'text', group: 'general' })
      const updated = await getSiteSettings()
      setSettings(updated)
      const m: Record<string, string> = {}
      for (const item of updated) m[item.id] = item.value
      setEdits(m)
    } catch (e) { console.error(e) }
    setNewCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف شود؟')) return
    try {
      await deleteSiteSetting(id)
      setSettings(prev => prev.filter(s => s.id !== id))
    } catch (e) { console.error(e) }
  }

  const groups = [...new Set(settings.map(s => s.group))].sort()

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">تنظیمات سایت</h2>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> تنظیم جدید
        </button>
      </div>

      {showNew && (
        <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">تنظیم جدید</h3>
          <div className="grid grid-cols-2 gap-2">
            <input value={newForm.key} onChange={e => setNewForm({ ...newForm, key: e.target.value })} placeholder="کلید (key)"
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
            <input value={newForm.label} onChange={e => setNewForm({ ...newForm, label: e.target.value })} placeholder="برچسب"
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
          </div>
          <input value={newForm.value} onChange={e => setNewForm({ ...newForm, value: e.target.value })} placeholder="مقدار پیش‌فرض"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none">
              <option value="text">متن</option>
              <option value="textarea">متن بلند</option>
              <option value="boolean">بله/خیر</option>
              <option value="number">عدد</option>
              <option value="image">تصویر</option>
            </select>
            <select value={newForm.group} onChange={e => setNewForm({ ...newForm, group: e.target.value })}
              className="px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none">
              {Object.entries(GROUP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <input value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} placeholder="توضیحات (اختیاری)"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={newCreating}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {newCreating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'ایجاد'}
            </button>
            <button onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.08] text-gray-400 text-sm font-bold hover:text-white transition-colors">انصراف</button>
          </div>
        </div>
      )}

      {groups.map(group => {
        const items = settings.filter(s => s.group === group)
        if (items.length === 0) return null
        return (
          <div key={group}>
            <h3 className="text-sm font-bold text-gray-400 mb-3">{GROUP_LABELS[group] || group}</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{item.label}</span>
                        <code className="text-[10px] text-gray-500 font-mono">{item.key}</code>
                      </div>
                      {item.description && <p className="text-[11px] text-gray-500 mb-2">{item.description}</p>}
                      {item.type === 'textarea' ? (
                        <textarea value={edits[item.id] || ''} onChange={e => setEdits({ ...edits, [item.id]: e.target.value })}
                          rows={3} className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none resize-none" />
                      ) : item.type === 'boolean' ? (
                        <select value={edits[item.id] || 'false'} onChange={e => setEdits({ ...edits, [item.id]: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none">
                          <option value="true">فعال</option>
                          <option value="false">غیرفعال</option>
                        </select>
                      ) : (
                        <input value={edits[item.id] || ''} onChange={e => setEdits({ ...edits, [item.id]: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white text-sm outline-none" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleSave(item.id)} disabled={saving === item.id || edits[item.id] === item.value}
                        className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 disabled:opacity-30 transition-colors">
                        {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
