-- Create clientes table
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mascotas table
CREATE TABLE mascotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo_animal TEXT NOT NULL CHECK (tipo_animal IN ('Perro', 'Gato')),
  raza TEXT,
  tamano TEXT CHECK (tamano IN ('S', 'M', 'L')),
  notas TEXT,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create servicios table
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo_animal TEXT NOT NULL CHECK (tipo_animal IN ('Perro', 'Gato', 'Ambos')),
  precio_base DECIMAL(10,2) NOT NULL,
  duracion_estimada INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create turnos table
CREATE TABLE turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id),
  precio_base DECIMAL(10,2) NOT NULL,
  descuento_tipo TEXT CHECK (descuento_tipo IN ('fijo', 'porcentaje')),
  descuento_valor DECIMAL(10,2) DEFAULT 0,
  precio_final DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'realizado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pagos table
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('efectivo', 'transferencia')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pagado', 'pendiente')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_mascotas_cliente ON mascotas(cliente_id);
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_mascota ON turnos(mascota_id);
CREATE INDEX idx_turnos_servicio ON turnos(servicio_id);
CREATE INDEX idx_pagos_turno ON pagos(turno_id);
