"use server"

import { createClient } from "@/lib/supabase/server"

export interface ResultadoBusqueda {
  id: string
  nombre: string
  tipo: "mascota" | "cliente" | "accesorio" | "egreso"
  subtitulo: string
  tipo_animal?: string
}

export async function buscarGlobal(query: string): Promise<ResultadoBusqueda[]> {
  const supabase = await createClient()
  const patron = `%${query}%`

  const [
    { data: mascotas },
    { data: clientes },
    { data: accesorios },
    { data: egresos },
  ] = await Promise.all([
    supabase
      .from("mascotas")
      .select("id, nombre, tipo_animal, raza, cliente:clientes(nombre)")
      .ilike("nombre", patron)
      .limit(8),
    supabase.from("clientes").select("id, nombre, telefono").ilike("nombre", patron).limit(5),
    supabase.from("accesorios").select("id, nombre, categoria, precio, stock").ilike("nombre", patron).limit(5),
    supabase.from("egresos").select("id, concepto, categoria, monto").ilike("concepto", patron).limit(5),
  ])

  const resultadosMascotas: ResultadoBusqueda[] = (mascotas || []).map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    tipo: "mascota",
    subtitulo: `${m.cliente?.nombre || "Sin dueño"} · ${m.raza || ""}`,
    tipo_animal: m.tipo_animal,
  }))

  const resultadosClientes: ResultadoBusqueda[] = (clientes || []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    tipo: "cliente",
    subtitulo: c.telefono || "Sin teléfono",
  }))

  const resultadosAccesorios: ResultadoBusqueda[] = (accesorios || []).map((a: any) => ({
    id: a.id,
    nombre: a.nombre,
    tipo: "accesorio",
    subtitulo: `$${Number(a.precio).toLocaleString("es-AR")} · ${a.stock} en stock`,
  }))

  const resultadosEgresos: ResultadoBusqueda[] = (egresos || []).map((e: any) => ({
    id: e.id,
    nombre: e.concepto,
    tipo: "egreso",
    subtitulo: `$${Number(e.monto).toLocaleString("es-AR")}`,
  }))

  return [...resultadosMascotas, ...resultadosClientes, ...resultadosAccesorios, ...resultadosEgresos]
}
