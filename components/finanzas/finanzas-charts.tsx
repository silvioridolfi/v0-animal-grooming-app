"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FINANZAS_COLORS as COLORS } from "@/lib/config/finanzas-colors"
import type { ResumenMes } from "@/lib/actions/finanzas"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts"

interface DonaDatum {
  name: string
  value: number
  color: string
}

interface FinanzasChartsProps {
  historialMeses: ResumenMes[]
  dataDona: DonaDatum[]
  dataTurnos: DonaDatum[]
}

const formatPesos = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)

// Tooltip propio, con la cara de la app (bg-card, bordes redondeados, sombra)
// en vez del tooltip blanco fijo de recharts. El bug que reemplaza: sin esto,
// el texto hereda el color de letra de la app (crema clarito en modo oscuro)
// sobre un fondo que recharts deja blanco sí o sí — cream sobre blanco,
// prácticamente invisible. Acá el fondo y el texto van de la mano siempre.
interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter = (v: number) => String(v),
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  formatter?: (value: number) => string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      {label && <p className="text-xs font-semibold text-foreground mb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{formatter(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Ejes, grilla y leyenda con los mismos tokens de color que el resto de la
// app (var(--border), var(--muted-foreground)) en vez de hex fijos — así
// se adaptan solos al modo oscuro, igual que todo lo demás.
const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" }
const legendStyle = { fontSize: 12, color: "var(--muted-foreground)" }
const gridStroke = "var(--border)"

// Se exportan por separado (en vez de un solo componente combinado) para
// poder ubicar "tendencia" y "distribución" en columnas distintas del
// layout de escritorio — en finanzas-view.tsx la primera ocupa la columna
// principal (2/3) y la segunda queda en la barra lateral (1/3).
export function TrendCharts({ historialMeses }: { historialMeses: ResumenMes[] }) {
  return (
    <div className="space-y-4">
      {/* Ingresos vs Egresos por mes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ingresos vs Egresos — últimos meses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {historialMeses.every((m) => m.ingresos === 0 && m.egresos === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin datos suficientes aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={historialMeses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.ingresos} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.ingresos} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.egresos} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.egresos} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: gridStroke }} tickLine={false} />
                <YAxis tickFormatter={formatPesos} tick={axisTick} width={45} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
                <Legend wrapperStyle={legendStyle} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke={COLORS.ingresos}
                  strokeWidth={2.5}
                  fill="url(#gradIngresos)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  name="Egresos"
                  stroke={COLORS.egresos}
                  strokeWidth={2.5}
                  fill="url(#gradEgresos)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Balance mensual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Balance mensual</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {historialMeses.every((m) => m.ingresos === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin datos suficientes aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={historialMeses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: gridStroke }} tickLine={false} />
                <YAxis tickFormatter={formatPesos} tick={axisTick} width={45} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<ChartTooltip formatter={formatCurrency} />}
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                />
                <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeWidth={1} />
                <Bar dataKey="balance" name="Balance" radius={[6, 6, 6, 6]} maxBarSize={36}>
                  {historialMeses.map((entry, index) => (
                    <Cell key={index} fill={entry.balance >= 0 ? COLORS.ingresos : COLORS.egresos} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Se exportan por separado (en vez de un solo componente combinado) para
// poder ubicar "tendencia" y "distribución" en columnas distintas del
// layout de escritorio — en finanzas-view.tsx la primera ocupa la columna
// principal (2/3) y la segunda queda en la barra lateral (1/3). Siempre
// apiladas en columna (antes alternaban a 2 columnas a partir de tablet)
// porque ahora suelen vivir en un espacio angosto (la barra lateral); en
// un celular no cambia nada, ahí ya se apilaban igual.
export function DistributionCharts({ dataDona, dataTurnos }: { dataDona: DonaDatum[]; dataTurnos: DonaDatum[] }) {
  return (
    <div className="space-y-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Método de pago</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {dataDona.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin cobros</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dataDona}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataDona.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
                  <Legend wrapperStyle={legendStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Turnos por estado</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            {dataTurnos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin turnos</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dataTurnos}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataTurnos.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={legendStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
