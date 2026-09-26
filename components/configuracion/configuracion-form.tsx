"use client"

import type React from "react"
import { useState } from "react"
import type { ConfiguracionNegocio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateConfiguracion, agregarDiaNoLaborable, quitarDiaNoLaborable } from "@/lib/actions/configuracion"
import { exportarBackupCompleto } from "@/lib/actions/backup"
import { cn } from "@/lib/utils"
import { X, Plus, Check, Clock, Calendar, Moon, Sun, Download, DatabaseBackup } from "lucide-react"
import { useTheme } from "next-themes"

interface ConfiguracionFormProps {
  config: ConfiguracionNegocio | null
}

const DIAS_SEMANA = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
]

function exportarBackupExcel(datos: Awaited<ReturnType<typeof exportarBackupCompleto>>) {
  import("xlsx").then((XLSX) => {
    const workbook = XLSX.utils.book_new()

    const hojas: { nombre: string; data: any[] }[] = [
      { nombre: "Mascotas", data: datos.mascotas },
      { nombre: "Clientes", data: datos.clientes },
      { nombre: "Turnos", data: datos.turnos },
      { nombre: "Egresos", data: datos.egresos },
      { nombre: "Accesorios", data: datos.accesorios },
      { nombre: "Ventas Accesorios", data: datos.ventas_accesorios },
    ]

    hojas.forEach(({ nombre, data }) => {
      const worksheet = data.length > 0 ? XLSX.utils.json_to_sheet(data) : XLSX.utils.aoa_to_sheet([["Sin datos"]])
      XLSX.utils.book_append_sheet(workbook, worksheet, nombre)
    })

    const fecha = datos.generado_en.slice(0, 10)
    XLSX.writeFile(workbook, `backup-peluqueria-${fecha}.xlsx`)
  })
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={theme === "light" ? "default" : "outline"}
        className="flex-1 gap-2"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        Claro
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "outline"}
        className="flex-1 gap-2"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        Oscuro
      </Button>
      <Button
        type="button"
        variant={theme === "system" ? "default" : "outline"}
        className="flex-1 gap-2"
        onClick={() => setTheme("system")}
      >
        Auto
      </Button>
    </div>
  )
}

export function ConfiguracionForm({ config }: ConfiguracionFormProps) {
  const [diasLaborales, setDiasLaborales] = useState<number[]>(config?.dias_laborales || [1, 2, 3, 4, 5])
  const [horaInicioManana, setHoraInicioManana] = useState(config?.hora_inicio_manana?.slice(0, 5) || "09:00")
  const [horaFinManana, setHoraFinManana] = useState(config?.hora_fin_manana?.slice(0, 5) || "13:00")
  const [horaInicioTarde, setHoraInicioTarde] = useState(config?.hora_inicio_tarde?.slice(0, 5) || "15:00")
  const [horaFinTarde, setHoraFinTarde] = useState(config?.hora_fin_tarde?.slice(0, 5) || "18:00")
  const [diasNoLaborables, setDiasNoLaborables] = useState<string[]>(config?.dias_no_laborables || [])
  const [nuevoDiaNoLaborable, setNuevoDiaNoLaborable] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [horariosError, setHorariosError] = useState<string | null>(null)
  const [diasNoLaborablesError, setDiasNoLaborablesError] = useState<string | null>(null)
  const [exportandoBackup, setExportandoBackup] = useState(false)

  const toggleDia = (dia: number) => {
    setDiasLaborales((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]))
    setSaved(false)
  }

  const handleSaveHorarios = async () => {
    setIsLoading(true)
    setHorariosError(null)
    const resultado = await updateConfiguracion({
      dias_laborales: diasLaborales,
      hora_inicio_manana: horaInicioManana,
      hora_fin_manana: horaFinManana,
      hora_inicio_tarde: horaInicioTarde,
      hora_fin_tarde: horaFinTarde,
    })
    setIsLoading(false)
    if (!resultado.success) {
      setHorariosError(resultado.error || "No se pudo guardar la configuración")
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAgregarDiaNoLaborable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoDiaNoLaborable) return
    setIsLoading(true)
    setDiasNoLaborablesError(null)
    const resultado = await agregarDiaNoLaborable(nuevoDiaNoLaborable)
    setIsLoading(false)
    if (!resultado.success) {
      setDiasNoLaborablesError(resultado.error || "No se pudo agregar el día")
      return
    }
    setDiasNoLaborables((prev) => [...prev, nuevoDiaNoLaborable])
    setNuevoDiaNoLaborable("")
  }

  const handleQuitarDiaNoLaborable = async (fecha: string) => {
    setIsLoading(true)
    setDiasNoLaborablesError(null)
    const resultado = await quitarDiaNoLaborable(fecha)
    setIsLoading(false)
    if (!resultado.success) {
      setDiasNoLaborablesError(resultado.error || "No se pudo quitar el día")
      return
    }
    setDiasNoLaborables((prev) => prev.filter((d) => d !== fecha))
  }

  const handleExportarBackup = async () => {
    setExportandoBackup(true)
    try {
      const datos = await exportarBackupCompleto()
      exportarBackupExcel(datos)
    } finally {
      setExportandoBackup(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Días laborales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {DIAS_SEMANA.map((dia) => (
              <Button
                key={dia.value}
                type="button"
                variant={diasLaborales.includes(dia.value) ? "default" : "outline"}
                className={cn(
                  "h-12 px-0 text-xs font-medium",
                  diasLaborales.includes(dia.value) && "bg-primary shadow-sm",
                  !diasLaborales.includes(dia.value) && "text-muted-foreground",
                )}
                onClick={() => toggleDia(dia.value)}
              >
                {dia.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Toca los días para activar/desactivar. Los días no seleccionados no aparecerán disponibles en el calendario.
          </p>
        </CardContent>
      </Card>

      {/* Horarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios de atención
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Turno mañana</Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={horaInicioManana}
                onChange={(e) => { setHoraInicioManana(e.target.value); setSaved(false) }}
                className="flex-1 h-12 text-center"
              />
              <span className="text-muted-foreground font-medium">a</span>
              <Input
                type="time"
                value={horaFinManana}
                onChange={(e) => { setHoraFinManana(e.target.value); setSaved(false) }}
                className="flex-1 h-12 text-center"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Turno tarde</Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={horaInicioTarde}
                onChange={(e) => { setHoraInicioTarde(e.target.value); setSaved(false) }}
                className="flex-1 h-12 text-center"
              />
              <span className="text-muted-foreground font-medium">a</span>
              <Input
                type="time"
                value={horaFinTarde}
                onChange={(e) => { setHoraFinTarde(e.target.value); setSaved(false) }}
                className="flex-1 h-12 text-center"
              />
            </div>
          </div>
          <Button onClick={handleSaveHorarios} disabled={isLoading} className="w-full h-12 gap-2">
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Guardado
              </>
            ) : isLoading ? (
              "Guardando..."
            ) : (
              "Guardar configuración"
            )}
          </Button>
          {horariosError && <p className="text-sm text-destructive">{horariosError}</p>}
        </CardContent>
      </Card>

      {/* Dias no laborables */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Días no laborables adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Agrega días específicos donde no trabajas (vacaciones, eventos, etc.). Los feriados nacionales ya están
            incluidos automáticamente.
          </p>
          <form onSubmit={handleAgregarDiaNoLaborable} className="flex gap-2">
            <Input
              type="date"
              value={nuevoDiaNoLaborable}
              onChange={(e) => setNuevoDiaNoLaborable(e.target.value)}
              className="flex-1 h-12"
              aria-label="Fecha del día no laborable"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12"
              disabled={isLoading || !nuevoDiaNoLaborable}
              aria-label="Agregar día no laborable"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </form>
          {diasNoLaborablesError && <p className="text-sm text-destructive">{diasNoLaborablesError}</p>}
          {diasNoLaborables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {diasNoLaborables.sort().map((fecha) => {
                const fechaFormateada = new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                })
                return (
                  <div
                    key={fecha}
                    className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium"
                  >
                    {fechaFormateada}
                    <button
                      type="button"
                      onClick={() => handleQuitarDiaNoLaborable(fecha)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Quitar ${fechaFormateada} de los días no laborables`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apariencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Respaldo de datos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DatabaseBackup className="h-4 w-4" />
            Respaldo de datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Descarga un Excel con todo lo cargado en la app (mascotas, clientes, turnos, egresos y accesorios),
            una hoja por cada uno. Sirve como copia de seguridad propia, además de los respaldos automáticos de
            la base de datos.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-2 bg-transparent"
            onClick={handleExportarBackup}
            disabled={exportandoBackup}
          >
            <Download className="h-4 w-4" />
            {exportandoBackup ? "Generando backup..." : "Descargar backup completo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}