"use client"

import { useEffect, useRef } from "react"
import { cerrarSesion } from "@/lib/actions/auth"

// Dispositivo compartido (tablet del local): sin esto, una sesión iniciada
// queda viva para siempre — Supabase renueva el refresh token solo, no hay
// expiración por inactividad propia. Quien toque la tablet después hereda
// acceso total a clientes/turnos/finanzas.
const TIMEOUT_MS = 30 * 60 * 1000
const CHECK_INTERVAL_MS = 30 * 1000
const STORAGE_KEY = "ultima-actividad"
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"] as const

export function InactivityLogout() {
  const loggingOutRef = useRef(false)

  useEffect(() => {
    const marcarActividad = () => {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      } catch {
        // Modo privado / storage bloqueado: sin memoria entre pestañas, pero
        // el timeout de esta pestaña sigue funcionando igual.
      }
    }
    marcarActividad()

    ACTIVITY_EVENTS.forEach((evento) => window.addEventListener(evento, marcarActividad, { passive: true }))

    const interval = setInterval(() => {
      if (loggingOutRef.current) return

      let ultimaActividad = Date.now()
      try {
        ultimaActividad = Number(localStorage.getItem(STORAGE_KEY)) || Date.now()
      } catch {
        // Sin localStorage cada pestaña cuenta su propia inactividad — sigue
        // protegiendo, solo que no se sincroniza entre pestañas.
      }

      if (Date.now() - ultimaActividad >= TIMEOUT_MS) {
        loggingOutRef.current = true
        cerrarSesion()
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((evento) => window.removeEventListener(evento, marcarActividad))
      clearInterval(interval)
    }
  }, [])

  return null
}
