-- Create egresos (expenses) table
CREATE TABLE egresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('mantenimiento', 'insumos', 'herramientas', 'otros')),
  monto DECIMAL(10,2) NOT NULL,
  medio_pago TEXT CHECK (medio_pago IN ('efectivo', 'transferencia')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_egresos_fecha ON egresos(fecha);
CREATE INDEX idx_egresos_categoria ON egresos(categoria);
