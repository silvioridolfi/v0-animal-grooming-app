import { PageHeader } from "@/components/page-header"
import { FinanzasView } from "@/components/finanzas/finanzas-view"
import { getResumenFinanciero, getResumenMultiMes } from "@/lib/actions/finanzas"
import { getEgresos } from "@/lib/actions/egresos"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

export default async function FinanzasPage() {
  const today = getFechaArgentina()
  const currentMonth = today.substring(0, 7)

  const [resumen, egresos, historialMeses] = await Promise.all([
    getResumenFinanciero(today),
    getEgresos(currentMonth),
    getResumenMultiMes(currentMonth, 12),
  ])

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Ingresos & Egresos" />
      <FinanzasView
        resumenInicial={resumen}
        egresosIniciales={egresos}
        fechaInicial={today}
        historialMesesInicial={historialMeses}
      />
    </main>
  )
}