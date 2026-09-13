import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarClock, DollarSign, PackageX, PawPrint, Plus, ShoppingBag, ArrowRight } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import type { DashboardData } from "@/lib/actions/dashboard"
import { ESTADO_BADGE } from "@/lib/config/estado-turno"
import { AnimatedNumber } from "@/components/animated-number"

export function DashboardView({ resumen, turnosHoy, stockBajo }: DashboardData) {
  return (
    <div className="px-4 py-4 space-y-4 md:max-w-5xl md:mx-auto md:py-6">
      {/* KPIs del día */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          icon={CalendarClock}
          label="Turnos hoy"
          numericValue={resumen.turnosPendientesDia + resumen.turnosRealizadosDia}
          hint={`${resumen.turnosRealizadosDia} hechos · ${resumen.turnosPendientesDia} pendientes`}
        />
        <KpiCard
          icon={DollarSign}
          label="Ingreso hoy"
          numericValue={resumen.ingresosDia}
          format={formatCurrency}
          hint={resumen.ingresosAccesoriosDia > 0 ? `${formatCurrency(resumen.ingresosAccesoriosDia)} en accesorios` : undefined}
        />
        <KpiCard
          icon={DollarSign}
          label="Balance hoy"
          numericValue={resumen.balanceDia}
          format={formatCurrency}
          hint="Ingresos − egresos del negocio"
          tone={resumen.balanceDia >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          icon={PackageX}
          label="Stock bajo"
          numericValue={stockBajo.length}
          hint={stockBajo.length > 0 ? "Revisar accesorios" : "Todo en orden"}
          tone={stockBajo.length > 0 ? "negative" : undefined}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button asChild size="sm" className="gap-1.5 whitespace-nowrap">
          <Link href="/turnos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo turno
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5 whitespace-nowrap bg-transparent">
          <Link href="/accesorios">
            <ShoppingBag className="h-4 w-4" />
            Registrar venta
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5 whitespace-nowrap bg-transparent">
          <Link href="/mascotas/nueva">
            <PawPrint className="h-4 w-4" />
            Nueva mascota
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Agenda de hoy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-heading">Agenda de hoy</CardTitle>
            <Link href="/agenda" className="text-sm text-primary flex items-center gap-0.5 font-medium">
              Ver todo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {turnosHoy.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay turnos para hoy.</p>
            ) : (
              turnosHoy.map((turno, i) => (
                <Link
                  key={turno.id}
                  href="/agenda"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                  className="tap-scale animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center justify-between rounded-lg border border-border px-3 py-2 active:bg-muted transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {turno.hora.slice(0, 5)} · {turno.mascota?.nombre ?? "Mascota"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{turno.tipo_servicio}</p>
                  </div>
                  <Badge className={cn("shrink-0 font-normal", ESTADO_BADGE[turno.estado as keyof typeof ESTADO_BADGE])} variant="outline">
                    {turno.estado}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stock bajo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-heading">Stock bajo</CardTitle>
            <Link href="/accesorios" className="text-sm text-primary flex items-center gap-0.5 font-medium">
              Ver todo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stockBajo.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Ningún accesorio con stock bajo.</p>
            ) : (
              stockBajo.map((accesorio, i) => (
                <Link
                  key={accesorio.id}
                  href="/accesorios"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                  className="tap-scale animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center justify-between rounded-lg border border-border px-3 py-2 active:bg-muted transition-colors"
                >
                  <p className="text-sm font-medium truncate">{accesorio.nombre}</p>
                  <Badge variant="destructive" className="font-normal shrink-0">
                    {accesorio.stock} u.
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  numericValue,
  format,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  numericValue: number
  format?: (n: number) => string
  hint?: string
  tone?: "positive" | "negative"
}) {
  return (
    <Card>
      <CardContent className="p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p
          className={cn(
            "text-lg font-semibold font-heading truncate",
            tone === "positive" && "text-primary",
            tone === "negative" && "text-destructive",
          )}
        >
          <AnimatedNumber value={numericValue} format={format} />
        </p>
        {hint && <p className="text-[11px] text-muted-foreground truncate">{hint}</p>}
      </CardContent>
    </Card>
  )
}
