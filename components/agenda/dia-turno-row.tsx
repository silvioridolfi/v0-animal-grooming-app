import { Dog, Cat, User, Scissors, Droplet } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { ESTADO_CARD, ESTADO_BADGE } from "@/lib/config/estado-turno"
import type { Turno } from "@/lib/types"

interface DiaTurnoRowProps {
  turno: Turno
  onClick?: () => void
}

function ServiceIcon({ tipo }: { tipo: Turno["tipo_servicio"] }) {
  if (tipo === "Baño") return <Droplet className="h-3.5 w-3.5 text-muted-foreground" />
  return <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
}

export function DiaTurnoRow({ turno, onClick }: DiaTurnoRowProps) {
  const mascota = turno.mascota
  const cliente = mascota?.cliente
  const estaReembolsado = Number(turno.monto_reembolsado) > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap-scale w-full rounded-lg border-l-4 p-3 text-left transition-colors hover:brightness-95",
        ESTADO_CARD[turno.estado],
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          {mascota?.tipo_animal === "Gato" ? (
            <Cat className="h-4 w-4 text-primary" />
          ) : (
            <Dog className="h-4 w-4 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{turno.hora.slice(0, 5)}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", ESTADO_BADGE[turno.estado])}>
              {turno.estado}
            </span>
          </div>

          <p className="truncate text-sm font-medium text-foreground">{mascota?.nombre}</p>

          {cliente && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              {cliente.nombre}
            </p>
          )}

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ServiceIcon tipo={turno.tipo_servicio} />
            {turno.tipo_servicio}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold font-heading text-foreground">{formatCurrency(turno.precio_final)}</p>
          {estaReembolsado && <p className="text-[11px] text-destructive">reembolsado</p>}
        </div>
      </div>
    </button>
  )
}
