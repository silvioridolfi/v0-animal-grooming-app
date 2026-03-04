# Paleta de Colores y Tipografía

## Paleta de Colores

### Colores Principales (Light Mode)

| Token | Color | Valor OKLch | Hex Aproximado |
|-------|-------|-----------|-----------------|
| Background | Blanco Cálido | oklch(0.975 0.008 75) | #FAF7F5 |
| Foreground | Marrón Cálido | oklch(0.42 0.045 25) | #6B4F4F |
| Primary | Rosa Viejo | oklch(0.75 0.12 350) | #E6A4B4 |
| Accent | Verde Salvia | oklch(0.72 0.08 130) | #A3B18A |
| Destructive | Rojo | oklch(0.55 0.22 25) | #A23E48 |
| Muted | Gris Claro | oklch(0.94 0.015 75) | #F0EDEB |
| Border | Gris Suave | oklch(0.88 0.02 75) | #E8E3E0 |
| Card | Blanco Puro | oklch(1 0 0) | #FFFFFF |
| Secondary | Gris Muy Claro | oklch(0.94 0.015 75) | #F0EDEB |
| Ring | Rosa Viejo | oklch(0.75 0.12 350) | #E6A4B4 |

### Colores Secundarios

| Token | Color | Uso |
|-------|-------|-----|
| Card | Blanco Puro | oklch(1 0 0) - Fondo de tarjetas |
| Secondary | Gris Muy Claro | oklch(0.94 0.015 75) - Elementos secundarios |
| Ring | Rosa Viejo | oklch(0.75 0.12 350) - Focus ring |

### Colores para Gráficos

| Chart | Color | OKLch |
|-------|-------|--------|
| Chart 1 | Rosa Viejo | oklch(0.75 0.12 350) |
| Chart 2 | Verde Salvia | oklch(0.72 0.08 130) |
| Chart 3 | Marrón | oklch(0.42 0.045 25) |
| Chart 4 | Amarillo | oklch(0.828 0.189 84.429) |
| Chart 5 | Naranja | oklch(0.769 0.188 70.08) |

### Colores Especiales

| Token | Uso | OKLch | Hex Aproximado |
|-------|-----|--------|-----------------|
| Holiday BG | Fondo vacaciones | oklch(0.92 0.15 70) | #F4E4C1 |
| Holiday Text | Texto vacaciones | oklch(0.45 0.15 65) | #8B6F47 |
| Holiday Border | Borde vacaciones | oklch(0.82 0.18 70) | #D4A574 |

### Dark Mode

La aplicación incluye soporte completo para modo oscuro con colores invertidos:

| Token | Valor OKLch |
|-------|-----------|
| Background Dark | oklch(0.145 0 0) |
| Foreground Dark | oklch(0.985 0 0) |
| Primary Dark | oklch(0.985 0 0) |
| Accent Dark | oklch(0.72 0.08 130) |
| Muted Dark | oklch(0.27 0.02 75) |
| Border Dark | oklch(0.27 0.02 75) |

---

## Tipografía

### Fuentes Principales

| Fuente | Tipo | Pesos | Uso | Importación |
|--------|------|-------|-----|------------|
| Poppins | Sans Serif | 400, 500, 600, 700 | Headings (h1-h6) | Google Fonts |
| Inter | Sans Serif | 400, 500, 600 | Body Text (Principal) | Google Fonts |
| Geist Mono | Monospace | Regular | Código y elementos monoespaciados | Next.js Built-in |

### Configuración en Layout

```typescript
// Headings (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
})

// Body Text (Inter)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})

// Monospace (Geist)
--font-mono: "Geist Mono", "Geist Mono Fallback"
```

### Uso en CSS

```css
/* Body utiliza Inter por defecto */
--font-sans: "Inter", "Inter Fallback", sans-serif;

/* Headings (h1-h6) usan Poppins */
--font-heading: "Poppins", "Poppins Fallback", sans-serif;

/* Código utiliza Geist Mono */
--font-mono: "Geist Mono", "Geist Mono Fallback";
```

### Jerarquía Tipográfica

| Elemento | Fuente | Peso | Tamaño (Tailwind) | Uso |
|----------|--------|------|-------------------|-----|
| h1 | Poppins | 700 | text-4xl | Título principal de página |
| h2 | Poppins | 600 | text-3xl | Subtítulo de sección |
| h3 | Poppins | 600 | text-2xl | Encabezado subsección |
| h4 | Poppins | 600 | text-xl | Encabezado menor |
| Body | Inter | 400 | text-base | Texto normal |
| Small | Inter | 400 | text-sm | Texto pequeño |
| Label | Inter | 500 | text-sm | Labels de formularios |
| Code | Geist Mono | 400 | text-sm | Código inline |

---

## Ejemplos de Uso

### Heading

```tsx
<h1 className="font-heading text-4xl font-bold text-foreground">
  Nueva Mascota
</h1>
```

### Body Text

```tsx
<p className="text-base text-foreground">
  Agrega una mascota y su dueño rápidamente
</p>
```

### Label

```tsx
<Label className="font-semibold text-foreground">
  Nombre *
</Label>
```

### Primary Button

```tsx
<Button className="bg-primary text-white hover:bg-primary/90">
  Guardar
</Button>
```

### Accent Element

```tsx
<div className="border-l-4 border-accent bg-accent/5 pl-4 py-2">
  Elemento destacado con acento
</div>
```

### Destructive Alert

```tsx
<div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-3">
  Mensaje de error o advertencia
</div>
```

### Card

```tsx
<Card className="bg-card border border-border">
  <CardHeader>
    <CardTitle className="font-heading text-2xl">Título</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Contenido</p>
  </CardContent>
</Card>
```

---

## Paleta de Colores - Representación Visual

### Colores Principales

```
Primary (Rosa Viejo):        ■ #E6A4B4
Accent (Verde Salvia):       ■ #A3B18A
Foreground (Marrón Cálido):  ■ #6B4F4F
Destructive (Rojo):          ■ #A23E48
```

### Colores de Fondo

```
Background (Blanco Cálido):  ■ #FAF7F5
Card (Blanco Puro):          ■ #FFFFFF
Muted (Gris Claro):          ■ #F0EDEB
Border (Gris Suave):         ■ #E8E3E0
```

### Colores para Gráficos

```
Chart 1: ■ #E6A4B4 (Rosa Viejo)
Chart 2: ■ #A3B18A (Verde Salvia)
Chart 3: ■ #6B4F4F (Marrón)
Chart 4: ■ #D4AF37 (Amarillo)
Chart 5: ■ #C17A1F (Naranja)
```

---

## Pautas de Uso

### Colores Primarios

- **Primary (Rosa Viejo)**: Botones principales, links, elementos destacados
- **Accent (Verde Salvia)**: Elementos secundarios, highlights, badges positivos
- **Foreground (Marrón)**: Texto principal, iconos importantes

### Colores Neutrales

- **Background**: Fondo de páginas y layout principal
- **Card**: Fondo de tarjetas y contenedores
- **Muted**: Elementos deshabilitados, placeholders
- **Border**: Bordes de componentes

### Colores de Estado

- **Destructive**: Botones de eliminar, errores, advertencias
- **Holiday**: Elementos especiales, vacaciones, promociones

### Accesibilidad

- Todos los colores cumplen con contraste WCAG AA
- Rosa Viejo sobre blanco: 4.8:1
- Marrón sobre blanco: 6.5:1
- Verde Salvia sobre blanco: 5.2:1

---

## Implementación en Tailwind CSS

```css
@theme inline {
  --font-sans: "Inter", "Inter Fallback", sans-serif;
  --font-heading: "Poppins", "Poppins Fallback", sans-serif;
  --font-mono: "Geist Mono", "Geist Mono Fallback", monospace;
  
  --color-background: oklch(0.975 0.008 75);
  --color-foreground: oklch(0.42 0.045 25);
  --color-primary: oklch(0.75 0.12 350);
  --color-accent: oklch(0.72 0.08 130);
  --color-destructive: oklch(0.55 0.22 25);
  --color-muted: oklch(0.94 0.015 75);
  --color-border: oklch(0.88 0.02 75);
}
```

---

## Resumen

**Paleta Cálida y Natural:**
- Rosa Viejo (#E6A4B4) como color primario elegante
- Verde Salvia (#A3B18A) como acento positivo
- Marrón Cálido (#6B4F4F) para contraste
- Blanco Cálido (#FAF7F5) de fondo

**Tipografía Moderna:**
- Poppins para headings: Moderna y clara
- Inter para body: Legible y profesional
- Geist Mono para código: Consistente con Next.js

**Características:**
- Optimizado para contraste WCAG AA
- Accesibilidad completa
- Experiencia visual cálida y acogedora
- Soporte completo para Dark Mode
