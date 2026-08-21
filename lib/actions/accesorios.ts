"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Accesorio } from "@/lib/types"

export async function getAccesorios(soloActivos = false): Promise<Accesorio[]> {
  const supabase = await createClient()

  let query = supabase.from("accesorios").select("*").order("nombre", { ascending: true })

  if (soloActivos) {
    query = query.eq("activo", true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function crearAccesorio(formData: FormData) {
  const supabase = await createClient()

  const nombre = formData.get("nombre") as string
  const categoria = (formData.get("categoria") as string) || null
  const precio = Number.parseFloat(formData.get("precio") as string)
  const stock = Number.parseInt(formData.get("stock") as string, 10) || 0

  if (!nombre || Number.isNaN(precio) || precio < 0) {
    return { success: false, error: "Nombre y precio son requeridos" }
  }

  const { error } = await supabase.from("accesorios").insert({
    nombre,
    categoria,
    precio,
    stock,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  return { success: true }
}

export async function actualizarAccesorio(id: string, formData: FormData) {
  const supabase = await createClient()

  const nombre = formData.get("nombre") as string
  const categoria = (formData.get("categoria") as string) || null
  const precio = Number.parseFloat(formData.get("precio") as string)
  const stock = Number.parseInt(formData.get("stock") as string, 10)

  if (!nombre || Number.isNaN(precio) || precio < 0) {
    return { success: false, error: "Nombre y precio son requeridos" }
  }

  const { error } = await supabase
    .from("accesorios")
    .update({
      nombre,
      categoria,
      precio,
      stock: Number.isNaN(stock) ? 0 : stock,
    })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/accesorios")
  revalidatePath("/finanzas")
  return { success: true }
}

// Baja lógica: no se borra el producto (las ventas ya hechas lo referencian),
// simplemente deja de aparecer como opción para nuevas ventas.
export async function toggleActivoAccesorio(id: string, activo: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("accesorios").update({ activo }).eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/accesorios")
  return { success: true }
}

// Sumar/restar stock manualmente (ej: reposición de mercadería)
export async function ajustarStockAccesorio(id: string, delta: number) {
  const supabase = await createClient()

  const { data: accesorio, error: errorFetch } = await supabase
    .from("accesorios")
    .select("stock")
    .eq("id", id)
    .single()

  if (errorFetch || !accesorio) {
    return { success: false, error: "Accesorio no encontrado" }
  }

  const nuevoStock = accesorio.stock + delta
  if (nuevoStock < 0) {
    return { success: false, error: "El stock no puede quedar negativo" }
  }

  const { error } = await supabase.from("accesorios").update({ stock: nuevoStock }).eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/accesorios")
  return { success: true }
}
