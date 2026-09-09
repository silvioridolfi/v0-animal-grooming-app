// Paleta financiera neutra: verde = ingreso, rojo = egreso, azul = transferencia,
// ámbar = pendiente, gris = cancelado/neutro. Nada de fucsia acá a propósito,
// aunque sea el color de identidad de la app en el resto de las pantallas.
//
// Vive en su propio archivo (sin imports de recharts) para que finanzas-view.tsx
// pueda usar estos colores para calcular datos sin arrastrar la librería de
// gráficos a su bundle — esa la carga, aparte y diferida, finanzas-charts.tsx.
export const FINANZAS_COLORS = {
  ingresos: "#059669", // emerald-600
  egresos: "#dc2626", // red-600
  efectivo: "#059669",
  transferencia: "#0284c7", // sky-600
  pendiente: "#d97706", // amber-600
  cancelado: "#94a3b8", // slate-400
} as const

// Clases Tailwind para el mismo par efectivo/transferencia, para usar en
// badges y textos fuera de los gráficos (pago-card, pagos-list,
// historial-servicios). Mismos colores que arriba (emerald-600 / sky-600),
// pero como clases en vez de hex porque acá no hace falta recharts.
export const METODO_PAGO_BADGE = {
  efectivo: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  transferencia: "bg-sky-50 text-sky-700 border border-sky-200",
} as const

export const METODO_PAGO_TEXTO = {
  efectivo: "text-emerald-700",
  transferencia: "text-sky-700",
} as const
