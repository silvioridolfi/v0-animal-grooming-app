import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export { esFeriado, getNombreFeriado, FERIADOS_ARGENTINA_2026 } from './feriados-argentina-2026'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(
    amount,
  )
}
