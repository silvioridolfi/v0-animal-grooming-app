"use client"

import { useEffect, useRef, useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  duration?: number
  /**
   * String, no función — este componente es "use client" pero se usa
   * desde Server Components (dashboard-view.tsx). Pasar una función como
   * prop de Server a Client Component no es válido en React Server
   * Components ("Functions cannot be passed directly to Client
   * Components..."), así que el formato se elige por nombre y se aplica
   * acá adentro.
   */
  format?: "currency"
}

/**
 * Cuenta desde 0 hasta `value` en `duration` ms con una curva ease-out
 * (arranca rápido, frena hacia el final — se siente más natural que
 * lineal). Si el usuario tiene "reducir movimiento" activado, muestra el
 * valor final directo sin animar.
 */
export function AnimatedNumber({ value, duration = 700, format }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(from + (value - from) * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <>{format === "currency" ? formatCurrency(display) : display}</>
}
