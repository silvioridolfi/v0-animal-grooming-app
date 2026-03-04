"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HolidayBadgeProps {
  holidayName: string
  className?: string
}

export function HolidayBadge({ holidayName, className }: HolidayBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full",
              "bg-amber-100 text-amber-900 border border-amber-300",
              "text-xs font-semibold cursor-help hover:bg-amber-200 transition-colors",
              className
            )}
          >
            <AlertCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Feriado</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-amber-900 text-amber-50 border-amber-700">
          <p className="font-medium">{holidayName}</p>
          <p className="text-xs opacity-90">Puedes agendar normalmente</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
