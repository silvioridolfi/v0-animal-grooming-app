"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LogOut, Loader2, User, KeyRound, Check } from "lucide-react"
import { cerrarSesion } from "@/lib/actions/auth"
import { cambiarMiContrasena } from "@/lib/actions/usuarios"

export function CuentaSection({ email }: { email: string | null }) {
  const [loading, setLoading] = useState(false)

  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const cerrarDialog = (open: boolean) => {
    setDialogAbierto(open)
    if (!open) {
      setPassword("")
      setConfirmar("")
      setError(null)
      setGuardado(false)
    }
  }

  const handleCambiarPassword = async () => {
    setError(null)

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.")
      return
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setGuardando(true)
    try {
      const resultado = await cambiarMiContrasena(password)
      if (!resultado.success) {
        setError(resultado.error || "No se pudo cambiar la contraseña.")
        return
      }
      setGuardado(true)
      setPassword("")
      setConfirmar("")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading">Mi cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-foreground truncate">{email ?? "Sesión activa"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 flex-1 bg-transparent"
            onClick={() => setDialogAbierto(true)}
          >
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 flex-1 bg-transparent"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              await cerrarSesion()
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Cerrar sesión
          </Button>
        </div>
      </CardContent>

      <Dialog open={dialogAbierto} onOpenChange={cerrarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar mi contraseña</DialogTitle>
            <DialogDescription>Elegí una nueva contraseña de al menos 6 caracteres.</DialogDescription>
          </DialogHeader>

          {guardado ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              <Check className="h-4 w-4 shrink-0" />
              Contraseña actualizada.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cuenta-nueva-password">Nueva contraseña</Label>
                <Input
                  id="cuenta-nueva-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuenta-confirmar-password">Confirmar contraseña</Label>
                <Input
                  id="cuenta-confirmar-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          <DialogFooter>
            {guardado ? (
              <Button onClick={() => cerrarDialog(false)}>Cerrar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => cerrarDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCambiarPassword} disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
