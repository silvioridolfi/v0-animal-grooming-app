"use client"

import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { ClienteCombobox } from "./cliente-combobox"
import type { Accesorio, Cliente } from "@/lib/types"
import { crearVentaCarrito } from "@/lib/actions/ventas-accesorios"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

export interface CartLine {
  accesorio: Accesorio
  cantidad: number
}

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines: CartLine[]
  clientes: Cliente[]
  onInc: (accesorioId: string) => void
  onDec: (accesorioId: string) => void
  onRemove: (accesorioId: string) => void
  onConfirmed: () => void
}

const mediosPago = [
  { value: "efectivo" as const, label: "Efectivo" },
  { value: "transferencia" as const, label: "Transferencia" },
]

export function CartDrawer({ open, onOpenChange, lines, clientes, onInc, onDec, onRemove, onConfirmed }: CartDrawerProps) {
  const [clienteId, setClienteId] = useState("")
  const [medioPago, setMedioPago] = useState<"efectivo" | "transferencia">("efectivo")
  const [notas, setNotas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = lines.reduce((sum, l) => sum + l.accesorio.precio * l.cantidad, 0)

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await crearVentaCarrito(
        lines.map((l) => ({
          accesorio_id: l.accesorio.id,
          cantidad: l.cantidad,
          precio_unitario: l.accesorio.precio,
        })),
        {
          cliente_id: clienteId || null,
          metodo_pago: medioPago,
          fecha: getFechaArgentina(),
          notas: notas || null,
        },
      )

      if (!result.success) {
        setError(result.error || "No se pudo registrar la venta")
        return
      }

      setClienteId("")
      setMedioPago("efectivo")
      setNotas("")
      onConfirmed()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Carrito ({lines.reduce((n, l) => n + l.cantidad, 0)} u.)</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">El carrito está vacío.</p>
          ) : (
            <div className="space-y-2">
              {lines.map(({ accesorio, cantidad }) => (
                <div key={accesorio.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{accesorio.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(accesorio.precio)} c/u · {formatCurrency(accesorio.precio * cantidad)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-muted px-1 py-1">
                    <button
                      type="button"
                      onClick={() => onDec(accesorio.id)}
                      className="flex h-6 w-6 items-center justify-center rounded active:bg-background"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium">{cantidad}</span>
                    <button
                      type="button"
                      disabled={cantidad >= accesorio.stock}
                      onClick={() => onInc(accesorio.id)}
                      className="flex h-6 w-6 items-center justify-center rounded active:bg-background disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(accesorio.id)}
                    className="text-muted-foreground active:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {lines.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Cliente (opcional)</Label>
                <ClienteCombobox clientes={clientes} value={clienteId} onValueChange={setClienteId} />
              </div>

              <div className="space-y-2">
                <Label>Medio de pago</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mediosPago.map((mp) => (
                    <button
                      key={mp.value}
                      type="button"
                      onClick={() => setMedioPago(mp.value)}
                      className={cn(
                        "py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors",
                        medioPago === mp.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground",
                      )}
                    >
                      {mp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas-carrito">Notas (opcional)</Label>
                <Textarea
                  id="notas-carrito"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          )}
        </div>

        {lines.length > 0 && (
          <DrawerFooter className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-xl font-bold font-heading">{formatCurrency(total)}</span>
            </div>
            <Button onClick={handleConfirm} disabled={isSubmitting} size="lg">
              {isSubmitting ? "Registrando..." : "Confirmar venta"}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
