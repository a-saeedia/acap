import { toJalaali, toGregorian } from 'jalaali-js'

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

export function toPersianDate(gregorianDate: Date | string): { year: number; month: number; day: number; monthName: string } {
  const d = typeof gregorianDate === 'string' ? new Date(gregorianDate) : gregorianDate
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return { year: j.jy, month: j.jm, day: j.jd, monthName: PERSIAN_MONTHS[j.jm - 1] }
}

export function formatPersianDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${j.jd} ${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`
}

export function formatPersianMonth(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`
}

export function formatPersianDateEn(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`
}

export function gregorianToPersianInput(gregorianStr: string): string {
  const d = new Date(gregorianStr)
  if (isNaN(d.getTime())) return ''
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${j.jy}-${String(j.jm).padStart(2, '0')}-${String(j.jd).padStart(2, '0')}`
}

export function persianInputToGregorian(persianStr: string): Date | null {
  const parts = persianStr.split('-')
  if (parts.length !== 3) return null
  const jy = parseInt(parts[0]), jm = parseInt(parts[1]), jd = parseInt(parts[2])
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null
  const g = toGregorian(jy, jm, jd)
  return new Date(g.gy, g.gm - 1, g.gd)
}

export { PERSIAN_MONTHS }
