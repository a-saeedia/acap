'use client'

import { useState } from 'react'
import { Loader2, Plus, X, ZoomIn } from 'lucide-react'
import { useLang } from '@/components/lang-provider'

export function UploadBtn({ label, onUpload, accept, currentUrl }: { label: string; onUpload: (url: string) => void; accept?: string; currentUrl?: string }) {
  const { t } = useLang()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  return (
    <div>
      <label className="text-[10px] text-gray-500 mb-1 block">{label}</label>
      <div className="flex gap-2 items-center">
        <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500/50 transition-colors text-sm text-gray-400 hover:text-white">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span className="text-xs">{uploading ? t('common.uploading') : t('common.choose.file')}</span>
          <input type="file" accept={accept || 'image/*'} className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]; if (!file) return
            setUploading(true)
            const fd = new FormData(); fd.append('file', file)
            fetch('/api/upload', { method: 'POST', body: fd })
              .then(r => r.json())
              .then(r => { if (r.url) onUpload(r.url) })
              .catch(() => {})
              .finally(() => setUploading(false))
          }} />
        </label>
        {currentUrl ? <button onClick={() => onUpload('')} className="p-2 text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button> : null}
      </div>
      {currentUrl && (currentUrl.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(currentUrl)) ? (
        <>
          <img src={currentUrl} alt="" className="w-full h-24 object-cover rounded-lg mt-1 border border-gray-700 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreview(currentUrl)} />
          <div className="flex justify-end mt-1">
            <button onClick={() => setPreview(currentUrl)} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"><ZoomIn className="w-3 h-3" />بزرگنمایی</button>
          </div>
        </>
      ) : currentUrl && (currentUrl.startsWith('data:audio') || /\.(webm|mp3|m4a|ogg|wav)$/i.test(currentUrl)) ? <audio src={currentUrl} controls className="w-full h-8 mt-1" /> : null}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={preview} alt="" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" style={{ objectFit: 'contain' }} />
            <button onClick={() => setPreview(null)} className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
