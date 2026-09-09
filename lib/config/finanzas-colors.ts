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
