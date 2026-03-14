"use client"

import type React from "react"
import { useState } from "react"
import type { ConfiguracionNegocio } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateConfiguracion, agregarDiaNoLaborable, quitarDiaNoLaborable } from "@/lib/actions/configuracion"
import { cn } from "@/lib/utils"
import { X, Plus, Check, Clock, Calendar, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface ConfiguracionFormProps {
  config: ConfiguracionNegocio | null
}

const DIAS_SEMANA = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
]

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

  const toggleDia = (dia: number) => {
    setDiasLaborales((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]))
    setSaved(false)
  }

  const handleSaveHorarios = async () => {
    setIsLoading(true)
    await updateConfiguracion({
      dias_laborales: diasLaborales,
      hora_inicio_manana: horaInicioManana,
      hora_fin_manana: horaFinManana,
      hora_inicio_tarde: horaInicioTarde,
      hora_fin_tarde: horaFinTarde,
    })
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAgregarDiaNoLaborable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoDiaNoLaborable) return
    setIsLoading(true)
    await agregarDiaNoLaborable(nuevoDiaNoLaborable)
    setDiasNoLaborables((prev) => [...prev, nuevoDiaNoLaborable])
    setNuevoDiaNoLaborable("")
    setIsLoading(false)
  }

  const handleQuitarDiaNoLaborable = async (fecha: string) => {
    setIsLoading(true)
    await quitarDiaNoLaborable(fecha)
    setDiasNoLaborables((prev) => prev.filter((d) => d !== fecha))
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Dias laborales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dias laborales
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
            Toca los dias para activar/desactivar. Los dias no seleccionados no apareceran disponibles en el calendario.
          </p>
        </CardContent>
      </Card>

      {/* Horarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios de atencion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Turno manana</Label>
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
              "Guardar configuracion"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dias no laborables */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dias no laborables adicionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Agrega dias especificos donde no trabajas (vacaciones, eventos, etc.). Los feriados nacionales ya estan
            incluidos automaticamente.
          </p>
          <form onSubmit={handleAgregarDiaNoLaborable} className="flex gap-2">
            <Input
              type="date"
              value={nuevoDiaNoLaborable}
              onChange={(e) => setNuevoDiaNoLaborable(e.target.value)}
              className="flex-1 h-12"
            />
            <Button type="submit" size="icon" className="h-12 w-12" disabled={isLoading || !nuevoDiaNoLaborable}>
              <Plus className="h-5 w-5" />
            </Button>
          </form>
          {diasNoLaborables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {diasNoLaborables.sort().map((fecha) => (
                <div
                  key={fecha}
                  className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium"
                >
                  {new Date(fecha + "T12:00:00").toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                  })}
                  <button
                    type="button"
                    onClick={() => handleQuitarDiaNoLaborable(fecha)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
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
    </div>
  )
}