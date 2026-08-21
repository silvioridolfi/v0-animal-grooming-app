-- Catálogo de accesorios (productos) con stock
CREATE TABLE IF NOT EXISTS accesorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ventas de accesorios (cada venta descuenta stock del producto)
CREATE TABLE IF NOT EXISTS ventas_accesorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accesorio_id UUID NOT NULL REFERENCES accesorios(id) ON DELETE RESTRICT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'transferencia')),
  fecha DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accesorios_activo ON accesorios(activo);
CREATE INDEX IF NOT EXISTS idx_ventas_accesorios_fecha ON ventas_accesorios(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_accesorios_accesorio ON ventas_accesorios(accesorio_id);
CREATE INDEX IF NOT EXISTS idx_ventas_accesorios_cliente ON ventas_accesorios(cliente_id);
