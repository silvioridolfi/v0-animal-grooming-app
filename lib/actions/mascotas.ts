"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PetHistoryEntry } from "@/lib/types"

interface CreateMascotaData {
  nombre: string
  tipo_animal: "Perro" | "Gato"
  raza?: string
  tamano?: "S" | "M" | "L"
  sexo?: "Macho" | "Hembra"
  notas?: string
  cliente_id: string
}

export async function crearMascota(data: CreateMascotaData) {
  const supabase = await createClient()

  const { data: nuevaMascota, error } = await supabase
    .from("mascotas")
    .insert(data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/mascotas")
  revalidatePath("/clientes")
  // Return mascotaId so navigation can work properly
  return { success: true, mascota: nuevaMascota, mascotaId: nuevaMascota.id }
}

export async function verificarMascotaDuplicada(clienteId: string, nombreMascota: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: existente } = await supabase
    .from("mascotas")
    .select("id")
    .eq("cliente_id", clienteId)
    .ilike("nombre", nombreMascota)
    .single()

  return !!existente
}

export async function crearMascotaConClienteSimple(data: {
  nombreMascota: string
  tipoAnimal: "Perro" | "Gato"
  raza: string
  sexo: "Macho" | "Hembra"
  observaciones?: string
  nombreCliente: string
  contactoCliente: string
}) {
  const supabase = await createClient()

  try {
    // Primero, crear el cliente
    const { data: nuevoCliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nombre: data.nombreCliente.trim(),
        telefono: data.contactoCliente.trim(),
      })
      .select()
      .single()

    if (clienteError || !nuevoCliente) {
      return { error: `Error al crear cliente: ${clienteError?.message}` }
    }

    // Luego, crear la mascota asociada
    const { data: nuevaMascota, error: mascotaError } = await supabase
      .from("mascotas")
      .insert({
        nombre: data.nombreMascota.trim(),
        tipo_animal: data.tipoAnimal,
        raza: data.raza.trim(),
        sexo: data.sexo,
        notas: data.observaciones?.trim() || null,
        cliente_id: nuevoCliente.id,
      })
      .select()
      .single()

    if (mascotaError || !nuevaMascota) {
      return { error: `Error al crear mascota: ${mascotaError?.message}` }
    }

    revalidatePath("/mascotas")
    revalidatePath("/clientes")

    return { success: true, mascotaId: nuevaMascota.id, clienteId: nuevoCliente.id }
  } catch (err) {
    return { error: "Error inesperado al crear mascota y cliente" }
  }
}

export async function eliminarMascota(mascotaId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("mascotas").delete().eq("id", mascotaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/mascotas")
  revalidatePath("/clientes")
  return { success: true }
}

export async function obtenerMascotasPorCliente(clienteId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mascotas")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("nombre")

  if (error) {
    return { error: error.message, mascotas: [] }
  }

  return { mascotas: data || [] }
}

export async function obtenerHistorialMascota(mascotaId: string): Promise<{ history: PetHistoryEntry[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("turnos")
    .select("id, fecha, hora, tipo_servicio, precio_final, metodo_pago, estado")
    .eq("mascota_id", mascotaId)
    .order("fecha", { ascending: false })

  if (error) {
    return { error: error.message, history: [] }
  }

  const history: PetHistoryEntry[] = (data || []).map((turno: any) => ({
    id: turno.id,
    fecha_servicio: turno.fecha,
    tipo_servicio: turno.tipo_servicio,
    precio_total: turno.precio_final,
    metodo_pago: turno.metodo_pago,
    estado: turno.estado,
    turno_id: turno.id,
  }))

  return { history }
}

interface CrearMascotaConClienteInput {
  cliente: {
    nombre: string
    telefono?: string
    notas?: string
  }
  mascota: {
    nombre: string
    tipo_animal: "Perro" | "Gato"
    raza: string
    tamano: "S" | "M" | "L"
    sexo?: "Macho" | "Hembra"
    notas?: string
  }
}

export async function crearMascotaConCliente(input: CrearMascotaConClienteInput) {
  const supabase = await createClient()

  // Step 1: Check if client already exists (by name)
  let clienteId: string
  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("id")
    .eq("nombre", input.cliente.nombre.trim())
    .maybeSingle()

  if (clienteExistente) {
    // Use existing client
    clienteId = clienteExistente.id
  } else {
    // Create new client
    const { data: nuevoCliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nombre: input.cliente.nombre.trim(),
        telefono: input.cliente.telefono?.trim() || null,
        notas: input.cliente.notas?.trim() || null,
      })
      .select()
      .single()

    if (clienteError || !nuevoCliente) {
      return { error: `Error al crear cliente: ${clienteError?.message || "desconocido"}` }
    }

    clienteId = nuevoCliente.id
  }

  // Step 2: Create mascota with the cliente_id
  const { data: nuevaMascota, error: mascotaError } = await supabase
    .from("mascotas")
    .insert({
      nombre: input.mascota.nombre.trim(),
      tipo_animal: input.mascota.tipo_animal,
      raza: input.mascota.raza.trim(),
      tamano: input.mascota.tamano,
      sexo: input.mascota.sexo || null,
      notas: input.mascota.notas?.trim() || null,
      cliente_id: clienteId,
    })
    .select()
    .single()

  if (mascotaError || !nuevaMascota) {
    return { error: `Error al crear mascota: ${mascotaError?.message || "desconocido"}` }
  }

  // Revalidate relevant paths
  revalidatePath("/mascotas")
  revalidatePath("/clientes")

  return { success: true, mascotaId: nuevaMascota.id, mascota: nuevaMascota }
}

export async function actualizarMascota(mascotaId: string, data: Partial<CreateMascotaData>) {
  const supabase = await createClient()

  const { error } = await supabase.from("mascotas").update(data).eq("id", mascotaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/mascotas")
  revalidatePath(`/mascotas/${mascotaId}`)
  revalidatePath("/clientes")
  return { success: true, mascotaId }
}
