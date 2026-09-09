// Colores de ESTADO — deliberadamente separados de los colores de MARCA
// (--primary fucsia y --accent neutro, definidos en globals.css). Antes
// "realizado" reusaba el fucsia de marca, y como el navy de marca también
// pintaba el día seleccionado del calendario, terminaban pisándose entre sí
// (un turno "realizado" en un día seleccionado se veía igual que uno
// "pendiente" — todo azul). Esta paleta nunca se cruza con los colores de
// marca ni con nada que use el "estado seleccionado/activo" de la UI, así
// el color de un turno se lee igual esté donde esté:
//
//   Pendiente  → ámbar    (algo por hacer)
//   Realizado  → esmeralda (hecho / cobrado — mismo verde que "efectivo",
//                familia "cosas buenas ya pasaron")
//   Cancelado  → gris neutro
//   Feriado    → violeta  (no es un estado de turno, es un atributo del
//                día — antes compartía el ámbar con "pendiente" y se
//                confundían)
//
// IMPORTANTE — dark mode: estas son clases Tailwind de color fijo
// (bg-amber-100, etc.), que NO se adaptan solas al modo oscuro como sí
// hacen las variables del tema (bg-primary, bg-card). Cada clase acá
// lleva su variante dark: explícita — bg claro y pálido en light,
// bg oscuro y saturado + texto claro en dark. Si se agrega un color
// nuevo acá, SIEMPRE con su par dark:, o el texto queda ilegible
// (fondo pálido casi blanco compuesto sobre un fondo ya oscuro).
export type EstadoTurno = "pendiente" | "realizado" | "cancelado"

// Badge de texto ("pendiente", "realizado"...)
export const ESTADO_BADGE: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  realizado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
}

// Franja izquierda + fondo tenue de una card (turno-card, dia-turno-row)
export const ESTADO_CARD: Record<EstadoTurno, string> = {
  pendiente: "border-l-amber-500 bg-amber-50/60 dark:bg-amber-900/20",
  realizado: "border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/20",
  cancelado: "border-l-slate-400 bg-slate-50/60 dark:bg-slate-800/40",
}

// Pastilla chica dentro de una celda del calendario mensual — SIEMPRE
// visible con este color, nunca se pisa con el estilo de "día seleccionado"
export const ESTADO_PASTILLA: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  realizado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelado: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
}

// Punto de color para leyendas
export const ESTADO_DOT: Record<EstadoTurno, string> = {
  pendiente: "bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-900/50 dark:ring-amber-700",
  realizado: "bg-emerald-100 ring-1 ring-emerald-300 dark:bg-emerald-900/50 dark:ring-emerald-700",
  cancelado: "bg-slate-200 ring-1 ring-slate-300 dark:bg-slate-700 dark:ring-slate-600",
}

// Hex planos para donde no se puede usar clases Tailwind (recharts) — los
// gráficos no siguen el modo oscuro de la app en esta versión, así que
// estos valores quedan fijos en ambos modos.
export const ESTADO_HEX: Record<EstadoTurno, string> = {
  pendiente: "#d97706", // amber-600
  realizado: "#059669", // emerald-600
  cancelado: "#94a3b8", // slate-400
}

// Feriado: no es un estado de turno, es un atributo del día. Violeta a
// propósito para que nunca se confunda con "pendiente" (ámbar).
export const FERIADO_BADGE = "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800"
export const FERIADO_BANNER = "bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800"
export const FERIADO_TEXT = {
  icon: "text-violet-600 dark:text-violet-400",
  title: "text-violet-900 dark:text-violet-200",
  body: "text-violet-700 dark:text-violet-300",
  hint: "text-violet-600 dark:text-violet-400",
}
export const FERIADO_DOT = "bg-violet-100 ring-1 ring-violet-300 dark:bg-violet-900/50 dark:ring-violet-700"
