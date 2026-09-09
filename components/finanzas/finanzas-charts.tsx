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

export default function FinanzasCharts({ historialMeses, dataDona, dataTurnos }: FinanzasChartsProps) {
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
                    <stop offset="5%" stopColor={COLORS.ingresos} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.ingresos} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.egresos} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.egresos} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatPesos} tick={{ fontSize: 11 }} width={45} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ fontWeight: 600 }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke={COLORS.ingresos}
                  strokeWidth={2}
                  fill="url(#gradIngresos)"
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  name="Egresos"
                  stroke={COLORS.egresos}
                  strokeWidth={2}
                  fill="url(#gradEgresos)"
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
              <BarChart data={historialMeses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatPesos} tick={{ fontSize: 11 }} width={45} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                <Bar dataKey="balance" name="Balance" radius={[4, 4, 4, 4]}>
                  {historialMeses.map((entry, index) => (
                    <Cell key={index} fill={entry.balance >= 0 ? COLORS.ingresos : COLORS.egresos} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Dona: método de pago + turnos por estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Pie data={dataDona} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value" stroke="none">
                    {dataDona.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
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
                  <Pie data={dataTurnos} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value" stroke="none">
                    {dataTurnos.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
