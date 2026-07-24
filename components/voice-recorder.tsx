'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

export function VoiceRecorder({ onRecord }: { onRecord: (url: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = getSupportedMimeType()
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
        if (blob.size < 100) { setError('ضبط نشد، دوباره تلاش کنید'); return }
        setUploading(true)
        try {
          const fd = new FormData()
          fd.append('file', blob, 'voice.webm')
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.url) onRecord(data.url)
          else setError('خطا در آپلود')
        } catch (e) { setError('خطا در آپلود') }
        setUploading(false)
      }
      mediaRef.current = mr
      mr.start()
      setRecording(true)
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') setError('دسترسی به میکروفون ندارید')
      else setError('خطا در دسترسی به میکروفون')
    }
  }

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
      setRecording(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={recording ? stop : start} disabled={uploading}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border ${
          recording ? 'bg-red-600/20 border-red-500/50 text-red-400 animate-pulse' : uploading ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'
        }`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {uploading ? '' : recording ? '' : ''}
      </button>
      {recording && <span className="text-[10px] text-red-400 font-bold">در حال ضبط...</span>}
      {error && <span className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</span>}
    </div>
  )
}
