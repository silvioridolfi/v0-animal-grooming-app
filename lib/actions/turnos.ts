"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

export async function marcarTurnoRealizado(turnoId: string) {
  const supabase = await createClient()

  const { data: turno } = await supabase
    .from("turnos")
    .select("precio_final")
    .eq("id", turnoId)
    .single()

  if (!turno?.precio_final || turno.precio_final <= 0) {
    return { error: "Ingresá el precio antes de marcar el turno como realizado" }
  }

  await supabase
    .from("turnos")
    .update({ estado: "realizado" })
    .eq("id", turnoId)

  revalidatePath("/")
  return { success: true }
}

export async function eliminarTurno(turnoId: string) {
  const supabase = await createClient()

  const { data: turno } = await supabase
    .from("turnos")
    .select("monto_reembolsado")
    .eq("id", turnoId)
    .single()

  if (turno && Number(turno.monto_reembolsado) > 0) {
    return {
      success: false,
      error: "Este turno ya tiene un reembolso registrado, no se puede eliminar para mantener el registro contable.",
    }
  }

  const { error } = await supabase.from("turnos").delete().eq("id", turnoId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/")
  return { success: true }
}

interface CreateTurnoData {
  fecha: string
  hora: string
  mascota_id: string
  tipo_servicio: "Corte" | "Baño" | "Corte y Baño"
  descuento_tipo?: "fijo" | "porcentaje" | null
  descuento_valor?: number
  precio_final: number
  metodo_pago?: "efectivo" | "transferencia" | null
  estado?: "pendiente" | "realizado" | "cancelado"
}

export async function crearTurno(data: CreateTurnoData) {
  const supabase = await createClient()

  const { data: turnoInsertado, error } = await supabase
    .from("turnos")
    .insert({
      fecha: data.fecha,
      hora: data.hora,
      mascota_id: data.mascota_id,
      tipo_servicio: data.tipo_servicio,
      descuento_tipo: data.descuento_tipo || null,
      descuento_valor: data.descuento_valor || 0,
      precio_final: data.precio_final,
      metodo_pago: data.metodo_pago || null,
      estado: data.estado || "pendiente",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function actualizarTurno(turnoId: string, data: CreateTurnoData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("turnos")
    .update({
      fecha: data.fecha,
      hora: data.hora,
      mascota_id: data.mascota_id,
      tipo_servicio: data.tipo_servicio,
      descuento_tipo: data.descuento_tipo || null,
      descuento_valor: data.descuento_valor || 0,
      precio_final: data.precio_final,
      metodo_pago: data.metodo_pago || null,
      estado: data.estado,
    })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function actualizarEstadoTurno(
  turnoId: string,
  estado: "pendiente" | "realizado" | "cancelado"
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("turnos")
    .update({ estado })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/pagos")
  revalidatePath("/finanzas")

  return { success: true }
}

export async function actualizarNotasTurno(turnoId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("turnos")
    .update({ notes })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/mascotas")
  return { success: true }
}

export async function revertirCobro(turnoId: string) {
  const supabase = await createClient()

  const { data: turno } = await supabase
    .from("turnos")
    .select("monto_reembolsado")
    .eq("id", turnoId)
    .single()

  if (turno && Number(turno.monto_reembolsado) > 0) {
    return { error: "Este turno ya tiene un reembolso registrado, no se puede revertir el cobro." }
  }

  const { error } = await supabase
    .from("turnos")
    .update({
      estado: "pendiente",
      precio_final: 0,
      metodo_pago: null,
    })
    .eq("id", turnoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/pagos")
  revalidatePath("/finanzas")
  return { success: true }
}

// Reembolso: NO se toca el turno original (el ingreso queda como fue, el
// trabajo se hizo), se registra un egreso aparte y se marca el turno con
// el monto reembolsado. Un solo reembolso por turno.
export async function reembolsarTurno(turnoId: string, monto: number) {
  const supabase = await createClient()

  const { data: turno, error: errorFetch } = await supabase
    .from("turnos")
    .select("*, mascota:mascotas(nombre)")
    .eq("id", turnoId)
    .single()

  if (errorFetch || !turno) {
    return { success: false, error: "Turno no encontrado" }
  }

  if (Number(turno.monto_reembolsado) > 0) {
    return { success: false, error: "Este turno ya fue reembolsado" }
  }

  if (!monto || monto <= 0 || monto > Number(turno.precio_final)) {
    return { success: false, error: `El monto debe estar entre $1 y $${turno.precio_final}` }
  }

  const { error: errorUpdate } = await supabase
    .from("turnos")
    .update({ monto_reembolsado: monto })
    .eq("id", turnoId)

  if (errorUpdate) return { success: false, error: errorUpdate.message }

  const { error: errorEgreso } = await supabase.from("egresos").insert({
    fecha: getFechaArgentina(),
    concepto: `Reembolso: ${turno.tipo_servicio} — ${turno.mascota?.nombre || "mascota"}`,
    categoria: "reembolsos",
    monto,
    medio_pago: turno.metodo_pago,
    notas: `Turno original del ${turno.fecha}`,
  })

  if (errorEgreso) {
    // Revertimos si no se pudo dejar constancia del egreso
    await supabase.from("turnos").update({ monto_reembolsado: 0 }).eq("id", turnoId)
    return { success: false, error: errorEgreso.message }
  }

  revalidatePath("/")
  revalidatePath("/mascotas")
  revalidatePath("/pagos")
  revalidatePath("/finanzas")
  return { success: true }
}
