'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'

const MAX_DURATION = 10000

export function VoiceRecorder({ onRecord }: { onRecord: (url: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setRecording(false)
  }, [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || ''

      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
        chunksRef.current = []
        if (blob.size < 200) { setError('ضبط نشد، دوباره تلاش کنید'); return }

        setUploading(true)
        try {
          const fd = new FormData()
          fd.append('file', blob, `voice.${mime.includes('mp4') ? 'mp4' : 'webm'}`)
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.url) onRecord(data.url)
          else setError(data.error || 'خطا در آپلود')
        } catch { setError('خطا در آپلود') }
        setUploading(false)
      }

      mr.onerror = () => { setError('خطا در ضبط'); stopRecording() }

      mediaRef.current = mr
      mr.start()
      setRecording(true)
      timerRef.current = setTimeout(stopRecording, MAX_DURATION)
    } catch (e: any) {
      const msg = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
        ? 'دسترسی به میکروفون ندارید'
        : 'خطا در دسترسی به میکروفون'
      setError(msg)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={recording ? stopRecording : start} disabled={uploading}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border ${
          recording ? 'bg-red-600/20 border-red-500/50 text-red-400 animate-pulse' : uploading ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-amber-500/50 hover:text-amber-400'
        }`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      {recording && <span className="text-[10px] text-red-400 font-bold">در حال ضبط...</span>}
      {error && <span className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</span>}
    </div>
  )
}
