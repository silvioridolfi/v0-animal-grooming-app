import type { Turno, ConfiguracionNegocio, Mascota } from "@/lib/types"
import { AgendaPageClient } from "@/components/agenda/agenda-page-client"
import { getConfiguracion } from "@/lib/actions/configuracion"
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()

  const { data: turnos = [] } = await supabase
    .from("turnos")
    .select(
      `*,
      mascota:mascota_id(*, cliente:cliente_id(*))`,
    )
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })

  const { data: mascotas = [] } = await supabase
    .from("mascotas")
    .select("*, cliente:cliente_id(*)")
    .order("nombre", { ascending: true })

  const config = await getConfiguracion()

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  })

  const totalCobradoHoy = (turnos as Turno[])
    .filter((turno) => turno.fecha === today && turno.estado === "realizado")
    .reduce((sum, turno) => sum + (turno.precio_final || 0), 0)

  return (
    <AgendaPageClient
      initialTurnos={turnos as Turno[]}
      initialConfig={config}
      initialMascotas={mascotas as Mascota[]}
      totalCobradoHoy={totalCobradoHoy}
      todayArgentina={today}
    />
  )
}