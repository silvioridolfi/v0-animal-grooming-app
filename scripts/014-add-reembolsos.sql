-- Reembolsos: se registran como un egreso aparte (categoría "reembolsos"),
-- el ingreso original NO se modifica. Se guarda el monto reembolsado en la
-- propia venta/turno para poder mostrarlo y evitar reembolsar dos veces.

ALTER TABLE egresos DROP CONSTRAINT IF EXISTS egresos_categoria_check;
ALTER TABLE egresos ADD CONSTRAINT egresos_categoria_check
  CHECK (categoria = ANY (ARRAY['mantenimiento'::text, 'insumos'::text, 'herramientas'::text, 'reembolsos'::text, 'otros'::text]));

ALTER TABLE ventas_accesorios ADD COLUMN IF NOT EXISTS monto_reembolsado DECIMAL(10,2) NOT NULL DEFAULT 0;

-- No se toca la columna "estado" de turnos a propósito: los filtros existentes
-- de agenda/finanzas/historial usan estado = 'realizado', y un turno reembolsado
-- sigue estando realizado (el trabajo se hizo). monto_reembolsado > 0 es la señal.
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS monto_reembolsado DECIMAL(10,2) NOT NULL DEFAULT 0;
