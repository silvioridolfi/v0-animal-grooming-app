## Eliminación de referencias a `precio_base` del Frontend

### Resumen
Se han eliminado todas las referencias a `precio_base` del frontend. Ahora el sistema obtiene exclusivamente los precios desde la tabla `servicio_precios` basado en el tamaño de la mascota.

---

## Cambios realizados por archivo

### 1. **lib/actions/turnos.ts**
- **Línea 72**: Eliminado `precio_base: precioDato.precio,` en la creación de turnos
- **Línea 119**: Eliminado `precio_base: precioBase,` en la actualización de turnos
- Los precios se copian desde `servicio_precios` al momento de crear/actualizar el turno

### 2. **components/agenda/turno-card.tsx**
- **Líneas 127-131**: Eliminado bloque que mostraba el precio base tachado cuando había descuento
- Ahora solo muestra `precio_final` sin comparación

### 3. **components/turnos/turno-modal.tsx**
- **Línea 212**: Eliminado `precio_base: precio,` del objeto enviado a `crearTurno()`

### 4. **components/turnos/editar-turno-form.tsx**
- **Línea 41**: Reemplazado cálculo de `precioBase` que usaba `servicioSeleccionado?.precio_base`
- Ahora obtiene el precio del array `servicio.precios` filtrado por tamaño de mascota
- **Línea 72**: Eliminado `precio_base: precioBase,` del objeto enviado a `actualizarTurno()`
- **Líneas 153-157**: Actualizado selector de servicios para mostrar el precio correcto según tamaño
- El precio se obtiene buscando en `servicio.precios` el registro con `tamano === mascotaSeleccionada.tamano`

### 5. **components/turnos/nuevo-turno-form.tsx**
- **Línea 187**: Eliminado `precio_base: precioBase,` del objeto enviado a `crearTurno()`
- El cálculo de `precioBase` ya obtiene correctamente el precio desde `servicio.precios` por tamaño

---

## Flujo actualizado

1. **Creación/Edición de turno**: 
   - Se selecciona la mascota (la cual tiene tamaño: S, M, L)
   - Se selecciona el servicio
   - El sistema busca el precio en `servicio.precios` donde `tamano === mascota.tamano`
   - Este precio se muestra y se utiliza como `precio_final` del turno

2. **Visualización de turnos**:
   - Solo muestra `precio_final` del turno
   - No hay referencia a `precio_base` en ningún lado

3. **Base de datos**:
   - La tabla `turnos` aún tiene la columna `precio_base` (sin eliminar)
   - Pero el frontend NO la utiliza ni la envía

---

## Validaciones importantes

✅ No existe ninguna referencia a `precio_base` en componentes del frontend
✅ Los precios siempre se obtienen desde `servicio_precios`
✅ El precio correcto según tamaño de mascota se aplica automáticamente
✅ No hay precios hardcodeados
✅ Los cambios se reflejan en tiempo real

---

## Nota técnica

- El campo `precio_base` sigue existiendo en la BD como columna en las tablas `servicios` y `turnos`
- Esto es deliberado para no romper datos existentes
- El frontend simplemente no lo usa ni lo envía
- Puede eliminarse de la BD en el futuro si se desea limpiar completamente
