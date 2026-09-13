"use client"

import { useMemo, useState } from "react"
import { Minus, Package, Plus, Search } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { Accesorio } from "@/lib/types"

interface PosGridProps {
  accesorios: Accesorio[]
  cantidadesEnCarrito: Record<string, number>
  onAdd: (accesorio: Accesorio) => void
  onRemove: (accesorioId: string) => void
}

export function PosGrid({ accesorios, cantidadesEnCarrito, onAdd, onRemove }: PosGridProps) {
  const [categoria, setCategoria] = useState<string>("__todas__")
  const [busqueda, setBusqueda] = useState("")

  const categorias = useMemo(() => {
    const set = new Set(accesorios.map((a) => a.categoria).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [accesorios])

  const filtrados = useMemo(() => {
    return accesorios
      .filter((a) => a.activo)
      .filter((a) => categoria === "__todas__" || a.categoria === categoria)
      .filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  }, [accesorios, categoria, busqueda])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {categorias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CategoriaChip label="Todas" active={categoria === "__todas__"} onClick={() => setCategoria("__todas__")} />
          {categorias.map((c) => (
            <CategoriaChip key={c} label={c} active={categoria === c} onClick={() => setCategoria(c)} />
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No hay productos que coincidan.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtrados.map((accesorio, i) => {
            const enCarrito = cantidadesEnCarrito[accesorio.id] || 0
            const sinStock = accesorio.stock <= 0
            const alTope = enCarrito >= accesorio.stock

            return (
              <div
                key={accesorio.id}
                style={{ animationDelay: `${Math.min(i, 12) * 40}ms`, animationFillMode: "backwards" }}
                className={cn(
                  "animate-in fade-in zoom-in-95 duration-300 flex flex-col rounded-xl border border-border bg-card p-3 transition-colors",
                  sinStock && "opacity-50",
                  enCarrito > 0 && "border-primary ring-1 ring-primary/30",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 mb-2">
                  <Package className="h-4.5 w-4.5 text-primary" />
                </div>
                <p className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{accesorio.nombre}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{formatCurrency(accesorio.precio)}</p>
                <p className={cn("text-[11px] mb-2", sinStock ? "text-destructive" : "text-muted-foreground")}>
                  {sinStock ? "Sin stock" : `${accesorio.stock} disp.`}
                </p>

                {enCarrito === 0 ? (
                  <button
                    type="button"
                    disabled={sinStock}
                    onClick={() => onAdd(accesorio)}
                    className="tap-scale mt-auto flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                ) : (
                  <div className="mt-auto flex items-center justify-between rounded-lg bg-primary/10 px-1 py-1">
                    <button
                      type="button"
                      onClick={() => onRemove(accesorio.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-primary active:bg-primary/20"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-primary">{enCarrito}</span>
                    <button
                      type="button"
                      disabled={alTope}
                      onClick={() => onAdd(accesorio)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-primary active:bg-primary/20 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CategoriaChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors tap-scale",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
      )}
    >
      {label}
    </button>
  )
}
