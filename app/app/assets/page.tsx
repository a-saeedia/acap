'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMyAssets, createAsset, updateAsset, deleteAsset } from '@/app/actions/assets'

type Asset = Awaited<ReturnType<typeof getMyAssets>>[number]

const ASSET_TYPES = [
  { value: 'crypto', label: 'رمز ارز' },
  { value: 'stock', label: 'بورس ایران' },
  { value: 'gold', label: 'طلا' },
  { value: 'currency', label: 'ارز' },
  { value: 'other', label: 'سایر' },
]

const INITIAL = { type: 'crypto', symbol: '', label: '', quantity: 0, purchasePrice: undefined as number | undefined, purchaseDate: '', notes: '' }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [form, setForm] = useState(INITIAL)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { getMyAssets().then(setAssets) }, [])

  async function handleSubmit() {
    if (!form.label || !form.quantity) return
    if (editing) {
      await updateAsset(editing, form)
    } else {
      await createAsset(form)
    }
    setForm(INITIAL)
    setEditing(null)
    setShowForm(false)
    setAssets(await getMyAssets())
  }

  function startEdit(a: Asset) {
    setForm({
      type: a.type,
      symbol: a.symbol,
      label: a.label,
      quantity: a.quantity,
      purchasePrice: a.purchasePrice ?? undefined,
      purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : '',
      notes: a.notes || '',
    })
    setEditing(a.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    await deleteAsset(id)
    setAssets(await getMyAssets())
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-black">دارایی‌ها</h1>
        <button onClick={() => { setForm(INITIAL); setEditing(null); setShowForm(true) }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          + افزودن دارایی
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">{editing ? 'ویرایش دارایی' : 'افزودن دارایی جدید'}</h2>

            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
            >
              {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })}
                placeholder="نماد (مثال: BTC)" className="input-field" />
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="نام دارایی *" className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                placeholder="تعداد *" type="number" className="input-field" />
              <input value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                placeholder="قیمت خرید (تومان)" type="number" className="input-field" />
            </div>

            <input value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
              placeholder="تاریخ خرید" type="date" className="input-field" />

            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="یادداشت" rows={2} className="input-field" />

            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-colors">
                {editing ? 'ویرایش' : 'افزودن'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
                انصراف
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Asset list */}
      {assets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">💰</div>
          <p className="text-lg">هیچ دارایی ثبت نشده</p>
          <p className="text-sm mt-1">روی دکمه افزودن دارایی کلیک کنید</p>
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{a.label}</div>
                <div className="text-sm text-gray-400">
                  {a.symbol} · {a.quantity.toLocaleString()} عدد
                  {a.purchasePrice ? ` · قیمت خرید: ${a.purchasePrice.toLocaleString()}` : ''}
                </div>
                {a.notes && <div className="text-xs text-gray-500 mt-1">{a.notes}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(a)} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors">ویرایش</button>
                <button onClick={() => handleDelete(a.id)} className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm transition-colors">حذف</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
