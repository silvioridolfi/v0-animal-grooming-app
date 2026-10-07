"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, KeyRound, Copy, Check, AlertTriangle } from "lucide-react"
import { generarContrasenaTemporal, type UsuarioAdmin } from "@/lib/actions/usuarios"

export function UsuariosSection({ usuarios }: { usuarios: UsuarioAdmin[] }) {
  const [targetUser, setTargetUser] = useState<UsuarioAdmin | null>(null)
  const [generando, setGenerando] = useState(false)
  const [passwordGenerada, setPasswordGenerada] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const cerrarDialog = (open: boolean) => {
    if (!open) {
      setTargetUser(null)
      setPasswordGenerada(null)
      setError(null)
      setCopiado(false)
    }
  }

  const handleGenerar = async () => {
    if (!targetUser) return
    setGenerando(true)
    setError(null)
    try {
      const resultado = await generarContrasenaTemporal(targetUser.id)
      if (!resultado.success) {
        setError(resultado.error || "No se pudo generar la contraseña temporal.")
        return
      }
      setPasswordGenerada(resultado.password || null)
    } finally {
      setGenerando(false)
    }
  }

  const copiarPassword = async () => {
    if (!passwordGenerada) return
    try {
      await navigator.clipboard.writeText(passwordGenerada)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Si el navegador no deja copiar (permisos, http sin TLS, etc.) la
      // contraseña sigue visible en pantalla para copiarla a mano.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </CardTitle>
        <CardDescription>
          Generá una contraseña temporal para destrabar una cuenta. La próxima vez que esa persona entre, la app le
          va a pedir elegir una nueva antes de dejarla seguir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <p className="text-sm text-foreground truncate min-w-0">{usuario.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0 bg-transparent"
              onClick={() => setTargetUser(usuario)}
            >
              <KeyRound className="h-4 w-4" />
              Generar temporal
            </Button>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!targetUser} onOpenChange={cerrarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña temporal</DialogTitle>
            <DialogDescription>
              Para <span className="font-medium text-foreground">{targetUser?.email}</span>
            </DialogDescription>
          </DialogHeader>

          {passwordGenerada ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                <code className="flex-1 text-lg font-semibold tracking-wide text-foreground">
                  {passwordGenerada}
                </code>
                <Button variant="ghost" size="icon" onClick={copiarPassword} aria-label="Copiar contraseña">
                  {copiado ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>Anotala o pasásela ahora — no se vuelve a mostrar. Al entrar con esta contraseña, se le va a pedir elegir una nueva.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Se va a generar una contraseña nueva para esta cuenta. La contraseña anterior deja de funcionar.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          <DialogFooter>
            {passwordGenerada ? (
              <Button onClick={() => cerrarDialog(false)}>Listo</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => cerrarDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerar} disabled={generando}>
                  {generando ? "Generando..." : "Generar"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
