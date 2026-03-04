import React from 'react'

/**
 * DIAGRAMA DE FLUJO - REDISEÑO DE NUEVA MASCOTA
 * 
 * ┌─────────────────────────────────────────┐
 * │         PÁGINA: /mascotas/nueva         │
 * │         o desde /clientes/[id]          │
 * └─────────────────────────────────────────┘
 *                      ↓
 * ┌─────────────────────────────────────────┐
 * │    FORMULARIO: NuevaMascotaForm         │
 * └─────────────────────────────────────────┘
 *                      ↓
 *   ┌──────────────────────────────────┐
 *   │   1. SELECCIONAR TIPO ANIMAL     │
 *   │   [🐕 Perro] [🐱 Gato]          │
 *   │                                  │
 *   │   tipoAnimal = "Perro" | "Gato"  │
 *   │   Acción: razasDisponibles =     │
 *   │   obtenerRazas(tipoAnimal)       │
 *   │   Raza anterior se resetea       │
 *   └──────────────────────────────────┘
 *                      ↓
 *   ┌──────────────────────────────────┐
 *   │    2. INGRESAR DATOS DE MASCOTA  │
 *   │                                  │
 *   │    ✓ Nombre                      │
 *   │    ✓ Raza (Dropdown dinámico)    │
 *   │      - Si Perro: 160+ razas      │
 *   │      - Si Gato: 90+ razas        │
 *   │    ✓ Sexo (♂ ♀)                 │
 *   │    ○ Observaciones (opcional)    │
 *   └──────────────────────────────────┘
 *                      ↓
 *   ┌──────────────────────────────────┐
 *   │    3. INGRESAR DATOS DEL DUEÑO   │
 *   │                                  │
 *   │    ✓ Nombre                      │
 *   │    ✓ Contacto                    │
 *   └──────────────────────────────────┘
 *                      ↓
 *   ┌──────────────────────────────────┐
 *   │    4. VALIDACIÓN                 │
 *   │                                  │
 *   │    isValid = tipoAnimal &&       │
 *   │              nombreMascota &&    │
 *   │              raza &&             │
 *   │              sexo &&             │
 *   │              nombreCliente &&    │
 *   │              contactoCliente     │
 *   │                                  │
 *   │    Botón "Guardar": Enabled?     │
 *   └──────────────────────────────────┘
 *                      ↓
 *   ┌──────────────────────────────────┐
 *   │    5. CLICK EN "GUARDAR"         │
 *   │                                  │
 *   │    crearMascotaConClienteSimple()│
 *   │    ├─ Crear Cliente              │
 *   │    ├─ Crear Mascota con tipo     │
 *   │    └─ Revalidar paths            │
 *   └──────────────────────────────────┘
 *                      ↓
 *          ┌──────────────────┐
 *          │   ¿Éxito?        │
 *          └──────────────────┘
 *          /                  \
 *       SÍ                    NO
 *        ↓                     ↓
 *   ┌─────────────┐      ┌──────────────┐
 *   │ Success     │      │ Error Card   │
 *   │ Message +   │      │ + Retry      │
 *   │ Redirect    │      │              │
 *   │ /mascotas   │      │ Intenta de   │
 *   │ /[id]       │      │ nuevo        │
 *   └─────────────┘      └──────────────┘
 *        ↓
 *   ┌──────────────────┐
 *   │ Pet Detail Page  │
 *   │ /mascotas/[id]   │
 *   └──────────────────┘
 */

export const DiagramaFlujo = () => {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
      {`
┌──────────────────────────────────────────────────┐
│    REDISEÑO - FLUJO DE NUEVA MASCOTA             │
└──────────────────────────────────────────────────┘

COMPONENTES INTERACTIVOS:

1️⃣  SELECCIÓN DE TIPO
    ┌─────────────────────────────────┐
    │ Tipo de Animal *                │
    │ ┌─────────────┬─────────────┐   │
    │ │ 🐕 Perro    │ 🐱 Gato     │   │
    │ │ (Primary bg)│ (Muted bg)  │   │
    │ └─────────────┴─────────────┘   │
    └─────────────────────────────────┘
    
    Componente: Button toggle
    Icono: Dog | Cat (lucide-react)
    Estados: Selected | Unselected | Hover
    Tamaño: py-4 px-4 (responsive)
    Gap: gap-3 (breathing room)

2️⃣  DROPDOWN DINÁMICO DE RAZAS
    ┌─────────────────────────────────┐
    │ Raza *                          │
    │ ┌──────────────────────────────┐│
    │ │ [Selecciona una raza...]     ││ ← Trigger
    │ │ ▼                            ││
    │ │ ┌────────────────────────┐   ││ ← Contenido
    │ │ │ Labrador Retriever     │   ││
    │ │ │ Golden Retriever       │   ││
    │ │ │ German Shepherd        │   ││
    │ │ │ Bulldog Francés        │   ││
    │ │ │ ... (160+ more)        │   ││
    │ │ └────────────────────────┘   ││
    │ └──────────────────────────────┘│
    └─────────────────────────────────┘
    
    Componente: Select (shadcn/ui)
    Lógica: useMemo + obtenerRazas()
    Dinámico: Cambia según tipoAnimal
    Ordenado: Alfabético (locale "es")
    Reset: Si cambias tipo → raza = ""

3️⃣  SÍMBOLOS DE GÉNERO
    ┌─────────────────────────────────┐
    │ Sexo *                          │
    │ ┌─────────────┬─────────────┐   │
    │ │ ♂ Macho     │ ♀ Hembra    │   │
    │ └─────────────┴─────────────┘   │
    └─────────────────────────────────┘

VALIDACIÓN:

✓ tipoAnimal (obligatorio)
✓ nombreMascota (obligatorio)
✓ raza (obligatorio, dinámico)
✓ sexo (obligatorio)
○ observaciones (opcional)
✓ nombreCliente (obligatorio)
✓ contactoCliente (obligatorio)

Botón "Guardar":
├─ Deshabilitado: Si falta algo
├─ Habilitado: Si todo completo
└─ Loading: Mientras envía

FLUJO DE DATOS:

[Usuario] → [Componente] → [Estado] → [Acción] → [Base Datos]
                ↓
           NuevaMascotaForm
           ├─ tipoAnimal
           ├─ nombreMascota
           ├─ raza
           ├─ sexo
           ├─ observaciones
           ├─ nombreCliente
           └─ contactoCliente
                ↓
           crearMascotaConClienteSimple()
           ├─ INSERT INTO clientes
           ├─ INSERT INTO mascotas
           │  (con tipo_animal)
           ├─ revalidatePath()
           └─ return { success, mascotaId }
                ↓
           router.push(/mascotas/[id])

ARCHIVOS MODIFICADOS:

1. components/mascotas/nueva-mascota-form.tsx
   ├─ Agregado: TipoAnimal type
   ├─ Agregado: useSelector para tipo
   ├─ Agregado: useMemo para razas
   ├─ Reemplazado: Input raza → Select dinámico
   ├─ Actualizado: Pasada tipoAnimal a acción
   └─ Total: 311 líneas

2. lib/actions/mascotas.ts
   ├─ Parámetro: tipoAnimal agregado
   ├─ Uso: data.tipoAnimal en INSERT
   └─ Actualizado: crearMascotaConClienteSimple()

3. lib/razas-mascotas.ts
   ├─ SIN CAMBIOS (ya existente)
   ├─ RAZAS_PERROS: 160+ razas
   ├─ RAZAS_GATOS: 90+ razas
   └─ Función: obtenerRazas(tipo)

      `}
    </div>
  )
}
