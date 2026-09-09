// Pendiente = ámbar, Realizado = accent (fucsia de marca), Cancelado = destructivo.
// Definido en un solo lugar porque antes calendar-agenda.tsx usaba azul (primary)
// para "pendiente" mientras turno-card.tsx y el resto de la app ya usaban ámbar —
// mismo estado, dos colores distintos. Todo lo que muestre un estado de turno
// (badges, franjas de color, pastillas del calendario, la leyenda) importa de acá.
export type EstadoTurno = "pendiente" | "realizado" | "cancelado"

// Badge de texto ("pendiente", "realizado"...)
export const ESTADO_BADGE: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  realizado: "bg-accent/20 text-accent-foreground",
  cancelado: "bg-destructive/20 text-destructive",
}

// Franja izquierda + fondo tenue de una card (turno-card, dia-turno-row)
export const ESTADO_CARD: Record<EstadoTurno, string> = {
  pendiente: "border-l-amber-500 bg-amber-50/60",
  realizado: "border-l-accent bg-accent/5",
  cancelado: "border-l-destructive/60 bg-destructive/5",
}

// Pastilla chica dentro de una celda del calendario mensual
export const ESTADO_PASTILLA: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  realizado: "bg-accent/15 text-accent",
  cancelado: "bg-muted text-muted-foreground",
}

// Punto de color para leyendas
export const ESTADO_DOT: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 ring-1 ring-amber-300",
  realizado: "bg-accent/20 ring-1 ring-accent/40",
  cancelado: "bg-muted ring-1 ring-border",
}
