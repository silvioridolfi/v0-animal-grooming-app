import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { PagosList } from "@/components/pagos/pagos-list"

export default async function PagosPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  // Una sola query — todos los turnos realizados
  const { data: turnos } = await supabase
    .from("turnos")
    .select("*, mascota:mascotas(*, cliente:clientes(*))")
    .eq("estado", "realizado")
    .order("fecha", { ascending: false })
    .limit(50)

  // Cálculos en JS en vez de múltiples queries
  const turnosHoy = (turnos || []).filter((t) => t.fecha === today)
  const totalHoy = turnosHoy.reduce((sum, t) => sum + (t.precio_final || 0), 0)
  const efectivoHoy = turnosHoy.filter((t) => t.metodo_pago === "efectivo").reduce((sum, t) => sum + (t.precio_final || 0), 0)
  const transferenciaHoy = turnosHoy.filter((t) => t.metodo_pago === "transferencia").reduce((sum, t) => sum + (t.precio_final || 0), 0)

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Pagos" subtitle={`${turnos?.length || 0} pagos registrados`} />
      <main className="flex-1 px-4 py-4">
        <PagosList
          pagos={turnos || []}
          totalHoy={totalHoy}
          efectivoHoy={efectivoHoy}
          transferenciaHoy={transferenciaHoy}
        />
      </main>
      <BottomNav />
    </div>
  )
}