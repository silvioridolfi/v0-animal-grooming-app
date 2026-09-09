"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { VentaAccesorio } from "@/lib/types"
import { getFechaArgentina } from "@/lib/utils/fecha-argentina"

export async function getVentasAccesorios(mes?: string): Promise<VentaAccesorio[]> {
  const supabase = await createClient()

  let query = supabase
    .from("ventas_accesorios")
    .select("*, accesorio:accesorios(*), cliente:clientes(*)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (mes) {
    const [year, month] = mes.split("-")
    const startDate = `${year}-${month}-01`
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString().split("T")[0]
    query = query.gte("fecha", startDate).lte("fecha", endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function crearVentaAccesorio(formData: FormData) {
  const supabase = await createClient()

  const accesorio_id = formData.get("accesorio_id") as string
  const cantidad = Number.parseInt(formData.get("cantidad") as string, 10)
  const precio_unitario = Number.parseFloat(formData.get("precio_unitario") as string)
  const cliente_id = (formData.get("cliente_id") as string) || null
  const metodo_pago = (formData.get("metodo_pago") as string) || null
  const fecha = formData.get("fecha") as string
  const notas = (formData.get("notas") as string) || null

  if (!accesorio_id || !fecha || !cantidad || cantidad <= 0 || Number.isNaN(precio_unitario)) {
    return { success: false, error: "Completá accesorio, cantidad y fecha" }
  }

  const { data: accesorio, error: errorAccesorio } = await supabase
    .from("accesorios")
    .select("stock")
    .eq("id", accesorio_id)
    .single()

  if (errorAccesorio || !accesorio) {
    return { success: false, error: "El accesorio no existe" }
  }

  if (accesorio.stock < cantidad) {
    return { success: false, error: `Stock insuficiente (disponible: ${accesorio.stock})` }
  }

  // Descuento condicionado a que el stock siga alcanzando en este mismo instante
  // (evita que dos ventas simultáneas dejen el stock en negativo)
  const { data: updateResult, error: errorUpdate } = await supabase
    .from("accesorios")
    .update({ stock: accesorio.stock - cantidad })
    .eq("id", accesorio_id)
    .gte("stock", cantidad)
    .select("id")

  if (errorUpdate || !updateResult || updateResult.length === 0) {
    return { success: false, error: "Stock insuficiente, alguien se te adelantó" }
  }

  const precio_total = precio_unitario * cantidad

  const { error: errorInsert } = await supabase.from("ventas_accesorios").insert({
    accesorio_id,
    cliente_id,
    cantidad,
    precio_unitario,
    precio_total,
    metodo_pago,
    fecha,
    notas,
  })

  if (errorInsert) {
    // Rollback del stock si la venta no se pudo registrar
    await supabase.from("accesorios").update({ stock: accesorio.stock }).eq("id", accesorio_id)
    return { success: false, error: errorInsert.message }
  }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  return { success: true }
}

export interface ItemCarrito {
  accesorio_id: string
  cantidad: number
  precio_unitario: number
}

export interface DatosVentaCarrito {
  cliente_id: string | null
  metodo_pago: "efectivo" | "transferencia"
  fecha: string
  notas: string | null
}

/**
 * Confirma una venta de mostrador con varios productos a la vez (carrito del POS).
 * Inserta una fila en `ventas_accesorios` por cada línea (mismo modelo de datos
 * que ya existía, solo que ahora entran varias juntas). Si un ítem falla a mitad
 * de camino (p.ej. alguien vació el stock en simultáneo), se revierte el stock
 * de los ítems que ya se habían descontado antes de cortar.
 */
export async function crearVentaCarrito(items: ItemCarrito[], datos: DatosVentaCarrito) {
  if (items.length === 0) {
    return { success: false, error: "El carrito está vacío" }
  }

  const supabase = await createClient()
  const descontados: { accesorio_id: string; cantidad: number }[] = []

  for (const item of items) {
    const { data: accesorio, error: errorAccesorio } = await supabase
      .from("accesorios")
      .select("stock")
      .eq("id", item.accesorio_id)
      .single()

    if (errorAccesorio || !accesorio) {
      await revertirDescuentos(supabase, descontados)
      return { success: false, error: "Uno de los accesorios ya no existe" }
    }

    const { data: updateResult, error: errorUpdate } = await supabase
      .from("accesorios")
      .update({ stock: accesorio.stock - item.cantidad })
      .eq("id", item.accesorio_id)
      .gte("stock", item.cantidad)
      .select("id")

    if (errorUpdate || !updateResult || updateResult.length === 0) {
      await revertirDescuentos(supabase, descontados)
      return { success: false, error: "Stock insuficiente en algún producto, alguien se te adelantó" }
    }

    descontados.push({ accesorio_id: item.accesorio_id, cantidad: item.cantidad })
  }

  const filas = items.map((item) => ({
    accesorio_id: item.accesorio_id,
    cliente_id: datos.cliente_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    precio_total: item.precio_unitario * item.cantidad,
    metodo_pago: datos.metodo_pago,
    fecha: datos.fecha,
    notas: datos.notas,
  }))

  const { error: errorInsert } = await supabase.from("ventas_accesorios").insert(filas)

  if (errorInsert) {
    await revertirDescuentos(supabase, descontados)
    return { success: false, error: errorInsert.message }
  }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  revalidatePath("/")
  return { success: true }
}

async function revertirDescuentos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  descontados: { accesorio_id: string; cantidad: number }[],
) {
  for (const { accesorio_id, cantidad } of descontados) {
    const { data: actual } = await supabase.from("accesorios").select("stock").eq("id", accesorio_id).single()
    if (actual) {
      await supabase.from("accesorios").update({ stock: actual.stock + cantidad }).eq("id", accesorio_id)
    }
  }
}

export async function eliminarVentaAccesorio(id: string) {
  const supabase = await createClient()

  const { data: venta, error: errorFetch } = await supabase
    .from("ventas_accesorios")
    .select("accesorio_id, cantidad, monto_reembolsado")
    .eq("id", id)
    .single()

  if (errorFetch || !venta) {
    return { success: false, error: "Venta no encontrada" }
  }

  if (Number(venta.monto_reembolsado) > 0) {
    return {
      success: false,
      error: "Esta venta ya tiene un reembolso registrado, no se puede eliminar para mantener el registro contable.",
    }
  }

  const { error: errorDelete } = await supabase.from("ventas_accesorios").delete().eq("id", id)

  if (errorDelete) return { success: false, error: errorDelete.message }

  // Devolvemos el stock descontado por esta venta
  const { data: accesorio } = await supabase
    .from("accesorios")
    .select("stock")
    .eq("id", venta.accesorio_id)
    .single()

  if (accesorio) {
    await supabase
      .from("accesorios")
      .update({ stock: accesorio.stock + venta.cantidad })
      .eq("id", venta.accesorio_id)
  }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  return { success: true }
}

// Reembolso: NO se toca la venta original (el ingreso queda como fue), se
// registra un egreso aparte en la tabla de egresos y se marca la venta con
// el monto reembolsado. Solo se permite un reembolso por venta — si hace
// falta ajustar el monto, hay que contactar soporte o borrar y recargar
// (siempre que no tenga ya un reembolso).
export async function reembolsarVentaAccesorio(ventaId: string, monto: number, reponerStock: boolean) {
  const supabase = await createClient()

  const { data: venta, error: errorFetch } = await supabase
    .from("ventas_accesorios")
    .select("*, accesorio:accesorios(id, nombre, stock)")
    .eq("id", ventaId)
    .single()

  if (errorFetch || !venta) {
    return { success: false, error: "Venta no encontrada" }
  }

  if (Number(venta.monto_reembolsado) > 0) {
    return { success: false, error: "Esta venta ya fue reembolsada" }
  }

  if (!monto || monto <= 0 || monto > Number(venta.precio_total)) {
    return { success: false, error: `El monto debe estar entre $1 y $${venta.precio_total}` }
  }

  const { error: errorUpdate } = await supabase
    .from("ventas_accesorios")
    .update({ monto_reembolsado: monto })
    .eq("id", ventaId)

  if (errorUpdate) return { success: false, error: errorUpdate.message }

  if (reponerStock && venta.accesorio) {
    await supabase
      .from("accesorios")
      .update({ stock: venta.accesorio.stock + venta.cantidad })
      .eq("id", venta.accesorio.id)
  }

  const { error: errorEgreso } = await supabase.from("egresos").insert({
    fecha: getFechaArgentina(),
    concepto: `Reembolso: ${venta.accesorio?.nombre || "accesorio"} x${venta.cantidad}`,
    categoria: "reembolsos",
    monto,
    medio_pago: venta.metodo_pago,
    notas: `Venta original del ${venta.fecha}`,
  })

  if (errorEgreso) {
    // Revertimos lo ya hecho si no se pudo dejar constancia del egreso
    await supabase.from("ventas_accesorios").update({ monto_reembolsado: 0 }).eq("id", ventaId)
    if (reponerStock && venta.accesorio) {
      await supabase.from("accesorios").update({ stock: venta.accesorio.stock }).eq("id", venta.accesorio.id)
    }
    return { success: false, error: errorEgreso.message }
  }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  return { success: true }
}
