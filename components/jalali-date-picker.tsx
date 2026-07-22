'use client'

import { useState } from 'react'
import { toJalaali, toGregorian } from 'jalaali-js'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

export function JalaliDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
  const parts = value.split('-').map(Number)
  const [show, setShow] = useState(false)
  const [jy, setJy] = useState(parts[0] || now.jy)
  const [jm, setJm] = useState(parts[1] || now.jm)
  const selectedDay = parts[2] || null

  const daysInMonth = (y: number, m: number) => {
    if (m <= 6) return 31
    if (m <= 11) return 30
    return y % 4 === 1 ? 30 : 29
  }

  const firstWeekday = (y: number, m: number) => {
    const g = toGregorian(y, m, 1)
    return new Date(g.gy, g.gm - 1, g.gd).getDay()
  }

  const dim = daysInMonth(jy, jm)
  const fwd = firstWeekday(jy, jm)
  const days: (number | null)[] = []
  for (let i = 0; i < fwd; i++) days.push(null)
  for (let i = 1; i <= dim; i++) days.push(i)

  function pick(d: number) {
    const str = `${jy}-${String(jm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    onChange(str)
    setShow(false)
  }

  function prevMonth() {
    if (jm === 1) { setJy(jy - 1); setJm(12) } else setJm(jm - 1)
  }

  function nextMonth() {
    if (jm === 12) { setJy(jy + 1); setJm(1) } else setJm(jm + 1)
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setShow(true)}
        placeholder="مثال: 1402-10-25"
        className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none ltr text-left font-mono cursor-pointer"
        readOnly
      />
      {show && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-xl" style={{ direction: 'ltr' }}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-800 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
            <span className="text-xs font-bold text-gray-200">{PERSIAN_MONTHS[jm - 1]} {jy}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-800 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map(d => <div key={d} className="text-[9px] text-gray-500 py-1">{d}</div>)}
            {days.map((d, i) => (
              <div key={i}>
                {d !== null ? (
                  <button onClick={() => pick(d)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${d === selectedDay ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >{d}</button>
                ) : <div className="w-8 h-8" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
