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
export function formatPrice(amount: number, currency: string = 'GHS'): string {
  return `${currency} ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format currency with symbol
 * @param amount - The price amount
 * @returns Formatted price with Ghana Cedi symbol
 */
export function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
