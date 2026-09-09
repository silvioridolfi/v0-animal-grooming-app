"use client"

import { useMemo, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PosGrid } from "./pos-grid"
import { CartDrawer, type CartLine } from "./cart-drawer"
import type { Accesorio, Cliente } from "@/lib/types"

interface PosViewProps {
  accesorios: Accesorio[]
  clientes: Cliente[]
  onVentaConfirmada: () => void
}

export function PosView({ accesorios, clientes, onVentaConfirmada }: PosViewProps) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const cantidadesEnCarrito = useMemo(() => {
    return Object.fromEntries(lines.map((l) => [l.accesorio.id, l.cantidad]))
  }, [lines])

  const totalUnidades = lines.reduce((sum, l) => sum + l.cantidad, 0)
  const totalMonto = lines.reduce((sum, l) => sum + l.accesorio.precio * l.cantidad, 0)

  const addOne = (accesorio: Accesorio) => {
    setLines((prev) => {
      const existente = prev.find((l) => l.accesorio.id === accesorio.id)
      if (existente) {
        if (existente.cantidad >= accesorio.stock) return prev
        return prev.map((l) => (l.accesorio.id === accesorio.id ? { ...l, cantidad: l.cantidad + 1 } : l))
      }
      return [...prev, { accesorio, cantidad: 1 }]
    })
  }

  const decOne = (accesorioId: string) => {
    setLines((prev) =>
      prev
        .map((l) => (l.accesorio.id === accesorioId ? { ...l, cantidad: l.cantidad - 1 } : l))
        .filter((l) => l.cantidad > 0),
    )
  }

  const removeLine = (accesorioId: string) => {
    setLines((prev) => prev.filter((l) => l.accesorio.id !== accesorioId))
  }

  const handleConfirmed = () => {
    setLines([])
    setCartOpen(false)
    onVentaConfirmada()
  }

  return (
    <div className="relative">
      <div className={totalUnidades > 0 ? "pb-20" : undefined}>
        <PosGrid
          accesorios={accesorios}
          cantidadesEnCarrito={cantidadesEnCarrito}
          onAdd={addOne}
          onRemove={decOne}
        />
      </div>

      {totalUnidades > 0 && (
        <div className="fixed inset-x-0 bottom-16 md:bottom-4 z-40 px-4">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg active:opacity-90"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4" />
              {totalUnidades} {totalUnidades === 1 ? "producto" : "productos"}
            </span>
            <span className="text-sm font-bold">{formatCurrency(totalMonto)}</span>
          </button>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        lines={lines}
        clientes={clientes}
        onInc={(id) => {
          const line = lines.find((l) => l.accesorio.id === id)
          if (line) addOne(line.accesorio)
        }}
        onDec={decOne}
        onRemove={removeLine}
        onConfirmed={handleConfirmed}
      />
    </div>
  )
}
