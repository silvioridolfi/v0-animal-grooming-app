"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2, User } from "lucide-react"
import { cerrarSesion } from "@/lib/actions/auth"

export function CuentaSection({ email }: { email: string | null }) {
  const [loading, setLoading] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading">Mi cuenta</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground truncate">{email ?? "Sesión activa"}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0 bg-transparent"
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            await cerrarSesion()
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Cerrar sesión
        </Button>
      </CardContent>
    </Card>
  )
}
