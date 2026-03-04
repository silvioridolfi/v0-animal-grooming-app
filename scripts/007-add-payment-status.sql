-- Agregar columna paymentStatus a la tabla turnos
ALTER TABLE turnos ADD COLUMN paymentStatus TEXT DEFAULT 'pendiente' CHECK (paymentStatus IN ('pendiente', 'pagado', 'cancelado'));

-- Crear índice para mejorar performance en Finanzas
CREATE INDEX idx_turnos_payment_status ON turnos(paymentStatus);

COMMIT;
