"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Accesorio, Cliente, VentaAccesorio } from "@/lib/types"
import { getAccesorios } from "@/lib/actions/accesorios"
import { getVentasAccesorios } from "@/lib/actions/ventas-accesorios"
import { AccesoriosList } from "./accesorios-list"
import { AccesorioForm } from "./accesorio-form"
import { VentasList } from "./ventas-list"
import { VentaForm } from "./venta-form"

interface AccesoriosViewProps {
  accesoriosIniciales: Accesorio[]
  ventasIniciales: VentaAccesorio[]
  clientes: Cliente[]
  mesInicial: string
}

export function AccesoriosView({ accesoriosIniciales, ventasIniciales, clientes, mesInicial }: AccesoriosViewProps) {
  const [tab, setTab] = useState<"ventas" | "productos">("ventas")
  const [accesorios, setAccesorios] = useState(accesoriosIniciales)
  const [ventas, setVentas] = useState(ventasIniciales)
  const [mes] = useState(mesInicial)

  const [showVentaForm, setShowVentaForm] = useState(false)
  const [showAccesorioForm, setShowAccesorioForm] = useState(false)
  const [editingAccesorio, setEditingAccesorio] = useState<Accesorio | null>(null)

  const refreshAccesorios = async () => {
    setAccesorios(await getAccesorios())
  }

  const refreshVentas = async () => {
    setVentas(await getVentasAccesorios(mes))
  }

  const refreshAll = async () => {
    await Promise.all([refreshAccesorios(), refreshVentas()])
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount)

  const totalVendidoMes = ventas.reduce((sum, v) => sum + v.precio_total, 0)
  const unidadesVendidasMes = ventas.reduce((sum, v) => sum + v.cantidad, 0)
  const accesoriosSinStock = accesorios.filter((a) => a.activo && a.stock <= 0).length

  if (showVentaForm) {
    return (
      <div className="flex-1 p-4">
        <VentaForm
          accesorios={accesorios}
          clientes={clientes}
          onSuccess={() => { setShowVentaForm(false); refreshAll() }}
          onCancel={() => setShowVentaForm(false)}
        />
      </div>
    )
  }

  if (showAccesorioForm) {
    return (
      <div className="flex-1 p-4">
        <AccesorioForm
          accesorio={editingAccesorio}
          onSuccess={() => { setShowAccesorioForm(false); setEditingAccesorio(null); refreshAccesorios() }}
          onCancel={() => { setShowAccesorioForm(false); setEditingAccesorio(null) }}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Stats del mes */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 mb-1">Vendido (mes)</p>
            <p className="font-bold text-green-700">{formatCurrency(totalVendidoMes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{unidadesVendidasMes}</p>
            <p className="text-xs text-muted-foreground mt-1">Unidades</p>
          </CardContent>
        </Card>
        <Card className={cn(accesoriosSinStock > 0 && "bg-amber-50 border-amber-200")}>
          <CardContent className="p-3 text-center">
            <p className={cn("text-2xl font-bold", accesoriosSinStock > 0 ? "text-amber-600" : "text-muted-foreground")}>
              {accesoriosSinStock}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sin stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("ventas")}
          className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            tab === "ventas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Ventas
        </button>
        <button
          onClick={() => setTab("productos")}
          className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            tab === "productos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
        >
          Productos
        </button>
      </div>

      {tab === "ventas" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Ventas del Mes</h2>
            <Button size="sm" onClick={() => setShowVentaForm(true)} disabled={accesorios.every((a) => a.stock <= 0)}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Button>
          </div>
          <VentasList ventas={ventas} onDelete={refreshAll} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Catálogo</h2>
            <Button size="sm" onClick={() => { setEditingAccesorio(null); setShowAccesorioForm(true) }}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Button>
          </div>
          <AccesoriosList
            accesorios={accesorios}
            onEdit={(a) => { setEditingAccesorio(a); setShowAccesorioForm(true) }}
            onToggle={refreshAccesorios}
          />
        </div>
      )}
    </div>
  )
}
