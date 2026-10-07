"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, KeyRound, Loader2 } from "lucide-react"
import { confirmarCambioContrasenaObligatorio } from "@/lib/actions/usuarios"

export function CambiarPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      const resultado = await confirmarCambioContrasenaObligatorio(password)
      if (!resultado.success) {
        setError(resultado.error || "No se pudo cambiar la contraseña.")
        return
      }
      router.push("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Image src="/patita.png" alt="Logo" width={48} height={48} className="h-12 w-12" />
          <h1 className="text-xl font-heading font-semibold text-foreground text-center">
            Andrea | Peluquería Canina
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Creá tu nueva contraseña</CardTitle>
            </div>
            <CardDescription>
              Entraste con una contraseña temporal. Antes de seguir, elegí una nueva que solo sepas vos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nueva-password">Nueva contraseña</Label>
                <Input
                  id="nueva-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-password">Confirmar contraseña</Label>
                <Input
                  id="confirmar-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar y continuar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
