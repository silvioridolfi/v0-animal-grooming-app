"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function iniciarSesion(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email o contraseña incorrectos." }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function crearCuenta(email: string, password: string, codigoInvitacion: string) {
  // El código de invitación es la única traba para que esta app no quede
  // abierta a que cualquiera con la URL se cree una cuenta — no vive en
  // NEXT_PUBLIC_*, así que nunca llega al navegador ni queda visible en
  // el código fuente del cliente.
  const codigoValido = process.env.SUPABASE_INVITE_CODE

  if (!codigoValido) {
    return { error: "El sistema de invitación no está configurado. Contactá al desarrollador." }
  }

  if (codigoInvitacion.trim() !== codigoValido) {
    return { error: "Código de invitación incorrecto." }
  }

  if (password.length < 6) {
    return { error: "La contraseña tiene que tener al menos 6 caracteres." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      return { error: "Ya existe una cuenta con ese email. Iniciá sesión en vez de crear una nueva." }
    }
    return { error: error.message }
  }

  // Si el proyecto de Supabase tiene "Confirm email" activado, signUp no
  // deja una sesión activa hasta que se confirme por mail — en ese caso
  // avisamos en vez de asumir que ya quedó adentro.
  if (data.user && !data.session) {
    return { success: true, requiereConfirmacion: true }
  }

  return { success: true, requiereConfirmacion: false }
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function obtenerUsuarioActual() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
