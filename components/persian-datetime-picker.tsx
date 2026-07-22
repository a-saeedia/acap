'use client'

import { toJalaali, toGregorian } from 'jalaali-js'

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

function persianToGregorianDate(persianStr: string): Date | null {
  const parts = persianStr.trim().split(/\s+/)[0].split('-')
  if (parts.length !== 3) return null
  const jy = parseInt(parts[0]), jm = parseInt(parts[1]), jd = parseInt(parts[2])
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null
  const g = toGregorian(jy, jm, jd)
  return new Date(g.gy, g.gm - 1, g.gd)
}

function gregorianDateToPersianStr(gregDate: Date): string {
  const j = toJalaali(gregDate.getFullYear(), gregDate.getMonth() + 1, gregDate.getDate())
  return `${j.jy}-${String(j.jm).padStart(2, '0')}-${String(j.jd).padStart(2, '0')}`
}

export function PersianDateTimePicker({
  value, onChange, label, placeholder,
}: {
  value: string
  onChange: (val: string) => void
  label?: string
  placeholder?: string
}) {
  const persianDateStr = value.split(/\s+/)[0] || ''
  const timeStr = value.split(/\s+/)[1] || ''

  const gregDate = persianToGregorianDate(persianDateStr) || new Date()
  const gregDateStr = gregDate.toISOString().split('T')[0]

  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] text-gray-500 block">{label}</label>}
      <div className="grid grid-cols-2 gap-1.5">
        <input type="date" value={gregDateStr}
          onChange={e => {
            if (!e.target.value) return
            const d = new Date(e.target.value + 'T00:00:00')
            const persianDate = gregorianDateToPersianStr(d)
            onChange(`${persianDate} ${timeStr}`)
          }}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors text-gray-300 [color-scheme:dark]"
        />
        <input type="time" value={timeStr}
          onChange={e => onChange(`${persianDateStr} ${e.target.value}`)}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm outline-none focus:border-amber-500/50 transition-colors text-gray-300 [color-scheme:dark]"
        />
      </div>
      {persianDateStr && (
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>{persianDateStr.replace(/-/g, '/')}</span>
          {timeStr && <span>{timeStr}</span>}
          {persianDateStr && (() => {
            const parts = persianDateStr.split('-')
            if (parts.length === 3) {
              const monthName = PERSIAN_MONTHS[parseInt(parts[1]) - 1]
              return monthName ? <span className="font-semibold text-gray-400">{parseInt(parts[2])} {monthName} {parts[0]}</span> : null
            }
            return null
          })()}
        </div>
      )}
      {placeholder && !persianDateStr && (
        <p className="text-[9px] text-gray-600">{placeholder}</p>
      )}
    </div>
  )
}
