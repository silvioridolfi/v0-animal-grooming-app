-- Rendimiento: estas combinaciones se consultan MUY seguido ahora que el
-- shell global (sidebar/header/bottom-nav) y el dashboard piden KPIs en
-- cada navegación — turnos de hoy pendientes, resumen financiero del día,
-- accesorios con stock bajo. Antes cada columna tenía su índice simple
-- (idx_turnos_fecha, idx_turnos_estado), lo que obliga a Postgres a hacer
-- un bitmap AND de dos índices; con un índice compuesto va directo.

-- turnos: se filtra por fecha exacta + estado en getShellKpis, getDashboardData
-- y getResumenFinanciero. El orden (fecha, estado) también sirve para queries
-- que solo filtran por fecha (como antes).
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_estado ON turnos(fecha, estado);

-- accesorios: el badge de "stock bajo" y el grid del POS filtran siempre por
-- activo=true, y a menudo también por stock.
CREATE INDEX IF NOT EXISTS idx_accesorios_activo_stock ON accesorios(activo, stock);

-- ventas_accesorios: getResumenFinanciero y getDashboardData filtran por
-- rango de fecha para sumar ingresos del día/mes.
CREATE INDEX IF NOT EXISTS idx_ventas_accesorios_fecha_metodo ON ventas_accesorios(fecha, metodo_pago);
