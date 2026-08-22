"use server"

import { createClient } from "@/lib/supabase/server"

export interface DatosBackup {
  mascotas: any[]
  clientes: any[]
  turnos: any[]
  egresos: any[]
  accesorios: any[]
  ventas_accesorios: any[]
  generado_en: string
}

// Trae TODAS las filas de todas las tablas, sin filtrar por fecha — a
// diferencia del resto de las consultas de la app, que siempre acotan
// por mes/día. Es un respaldo completo, pensado para descargar y
// guardar aparte (Drive, email, etc.), no para mostrar en pantalla.
export async function exportarBackupCompleto(): Promise<DatosBackup> {
  const supabase = await createClient()

  const [
    { data: mascotas },
    { data: clientes },
    { data: turnos },
    { data: egresos },
    { data: accesorios },
    { data: ventasAccesorios },
  ] = await Promise.all([
    supabase.from("mascotas").select("*").order("nombre"),
    supabase.from("clientes").select("*").order("nombre"),
    supabase.from("turnos").select("*").order("fecha", { ascending: false }),
    supabase.from("egresos").select("*").order("fecha", { ascending: false }),
    supabase.from("accesorios").select("*").order("nombre"),
    supabase.from("ventas_accesorios").select("*").order("fecha", { ascending: false }),
  ])

  return {
    mascotas: mascotas || [],
    clientes: clientes || [],
    turnos: turnos || [],
    egresos: egresos || [],
    accesorios: accesorios || [],
    ventas_accesorios: ventasAccesorios || [],
    generado_en: new Date().toISOString(),
  }
}
