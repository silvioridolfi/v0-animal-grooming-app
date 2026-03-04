import { PageHeader } from "@/components/page-header"
import { FinanzasView } from "@/components/finanzas/finanzas-view"
import { getResumenFinanciero } from "@/lib/actions/finanzas"
import { getEgresos } from "@/lib/actions/egresos"

export default async function FinanzasPage() {
  const today = new Date().toISOString().split("T")[0]
  const currentMonth = today.substring(0, 7)

  const [resumen, egresos] = await Promise.all([getResumenFinanciero(today), getEgresos(currentMonth)])

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Ingresos & Egresos" />
      <FinanzasView resumenInicial={resumen} egresosIniciales={egresos} fechaInicial={today} />
    </main>
  )
}
