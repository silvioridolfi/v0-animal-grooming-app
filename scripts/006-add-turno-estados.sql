-- Add support for new turno estados in database
-- Update the CHECK constraint to include all possible states
ALTER TABLE turnos DROP CONSTRAINT IF EXISTS turnos_estado_check;

ALTER TABLE turnos ADD CONSTRAINT turnos_estado_check 
  CHECK (estado IN ('pendiente', 'pagado', 'pendiente_pago', 'cancelado', 'reprogramado', 'realizado'));

-- Add index for estado column to improve query performance
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
