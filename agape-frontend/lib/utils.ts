import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price in Ghana Cedis
 * @param amount - The price amount
 * @param currency - Currency code (default: GHS)
 * @returns Formatted price string
 */
export function formatPrice(amount: number | string | undefined | null, currency: string = 'GHS'): string {
  const numericAmount = Number(amount)
  const safeAmount = !isNaN(numericAmount) ? numericAmount : 0
  return `${currency} ${safeAmount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format currency with symbol
 * @param amount - The price amount
 * @returns Formatted price with Ghana Cedi symbol
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  const numericAmount = Number(amount)
  const safeAmount = !isNaN(numericAmount) ? numericAmount : 0
  return `GH₵ ${safeAmount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
