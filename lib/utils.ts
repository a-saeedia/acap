import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const persianDigits: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}
export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, d => persianDigits[d])
}

export function formatToman(value: number): string {
  if (value >= 1_000_000_000_000) {
    return (value / 1_000_000_000_000).toFixed(2) + ' همت'
  }
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + ' میلیارد تومان'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + ' میلیون تومان'
  }
  return value.toLocaleString('fa-IR') + ' تومان'
}
