"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { VentaAccesorio } from "@/lib/types"

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

export async function eliminarVentaAccesorio(id: string) {
  const supabase = await createClient()

  const { data: venta, error: errorFetch } = await supabase
    .from("ventas_accesorios")
    .select("accesorio_id, cantidad")
    .eq("id", id)
    .single()

  if (errorFetch || !venta) {
    return { success: false, error: "Venta no encontrada" }
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
