'use client'

import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'

export function UploadBtn({ label, onUpload, accept, currentUrl }: { label: string; onUpload: (url: string) => void; accept?: string; currentUrl?: string }) {
  const [uploading, setUploading] = useState(false)
  return (
    <div>
      <label className="text-[10px] text-gray-500 mb-1 block">{label}</label>
      <div className="flex gap-2 items-center">
        <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer hover:border-blue-500/50 transition-colors text-sm text-gray-400 hover:text-white">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span className="text-xs">{uploading ? 'در حال آپلود...' : 'انتخاب فایل'}</span>
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
      {currentUrl && currentUrl.startsWith('data:') ? (
        currentUrl.startsWith('data:image') ? <img src={currentUrl} alt="" className="w-full h-20 object-cover rounded-lg mt-1 border border-gray-700" /> : <audio src={currentUrl} controls className="w-full h-8 mt-1" />
      ) : null}
    </div>
  )
}
