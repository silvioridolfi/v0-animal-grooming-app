"use client"

import { Calendar } from "lucide-react"
import { getNombreFeriado } from "@/lib/feriados-argentina-2026"
import { cn } from "@/lib/utils"

interface HolidayIndicatorProps {
  date: string
  showName?: boolean
  className?: string
}

export function HolidayIndicator({
  date,
  showName = true,
  className,
}: HolidayIndicatorProps) {
  const holidayName = getNombreFeriado(date)

  if (!holidayName) return null

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1",
        className
      )}
    >
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 transition-colors">
        <Calendar className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-semibold text-amber-900">
          {holidayName}
        </span>
      </div>
    </div>
  )
}
