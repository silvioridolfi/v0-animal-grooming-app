-- Agregar columna tipo_servicio a tabla turnos
ALTER TABLE turnos ADD COLUMN tipo_servicio TEXT CHECK (tipo_servicio IN ('Corte', 'Baño', 'Corte y Baño')) DEFAULT 'Corte y Baño';

-- Agregar índice para mejor rendimiento
CREATE INDEX idx_turnos_tipo_servicio ON turnos(tipo_servicio);

-- Comentario para documentación
COMMENT ON COLUMN turnos.tipo_servicio IS 'Tipo de servicio: Corte, Baño o Corte y Baño';
