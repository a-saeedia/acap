import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
