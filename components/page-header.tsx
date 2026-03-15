import type React from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  logo?: React.ReactNode
}

export function PageHeader({ title, subtitle, action, logo }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {logo}
          <div>
            <h1 className="text-lg font-semibold font-heading text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </header>
  )
}