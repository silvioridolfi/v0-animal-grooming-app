import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { PagosList } from "@/components/pagos/pagos-list"

export default async function PagosPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: pagos } = await supabase
    .from("pagos")
    .select(`
      *,
      turno:turnos(*, mascota:mascotas(*, cliente:clientes(*)))
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: pagosHoy } = await supabase
    .from("pagos")
    .select("monto, turno:turnos!inner(fecha)")
    .eq("estado", "pagado")
    .eq("turno.fecha", today)

  const totalHoy = pagosHoy?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

  const { data: pagosEfectivoHoy } = await supabase
    .from("pagos")
    .select("monto, turno:turnos!inner(fecha)")
    .eq("estado", "pagado")
    .eq("metodo", "efectivo")
    .eq("turno.fecha", today)

  const { data: pagosTransferenciaHoy } = await supabase
    .from("pagos")
    .select("monto, turno:turnos!inner(fecha)")
    .eq("estado", "pagado")
    .eq("metodo", "transferencia")
    .eq("turno.fecha", today)

  const efectivoHoy = pagosEfectivoHoy?.reduce((sum, p) => sum + Number(p.monto), 0) || 0
  const transferenciaHoy = pagosTransferenciaHoy?.reduce((sum, p) => sum + Number(p.monto), 0) || 0

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Pagos" subtitle={`${pagos?.length || 0} pagos registrados`} />
      <main className="flex-1 px-4 py-4">
        <PagosList
          pagos={pagos || []}
          totalHoy={totalHoy}
          efectivoHoy={efectivoHoy}
          transferenciaHoy={transferenciaHoy}
        />
      </main>
      <BottomNav />
    </div>
  )
}