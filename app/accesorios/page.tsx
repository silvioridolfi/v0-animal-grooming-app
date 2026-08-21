import { PageHeader } from "@/components/page-header"
import { AccesoriosView } from "@/components/accesorios/accesorios-view"
import { getAccesorios } from "@/lib/actions/accesorios"
import { getVentasAccesorios } from "@/lib/actions/ventas-accesorios"
import { getClientes } from "@/lib/actions/clientes"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

export default async function AccesoriosPage() {
  const hoy = getFechaArgentina()
  const mesActual = hoy.substring(0, 7)

  const [accesorios, ventas, clientes] = await Promise.all([
    getAccesorios(),
    getVentasAccesorios(mesActual),
    getClientes(),
  ])

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Accesorios" subtitle="Ventas y stock" />
      <AccesoriosView
        accesoriosIniciales={accesorios}
        ventasIniciales={ventas}
        clientes={clientes}
        mesInicial={mesActual}
      />
    </main>
  )
}
