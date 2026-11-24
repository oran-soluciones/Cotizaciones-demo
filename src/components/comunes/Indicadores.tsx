import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { EstadoComision, EstadoCotizacion, EstadoServicio } from "@/lib/types"

export function TarjetaMetrica({
  titulo,
  valor,
  detalle,
  icono,
  tono = "primario",
}: {
  titulo: string
  valor: string
  detalle: string
  icono: ReactNode
  tono?: "primario" | "alerta" | "info" | "neutro" | "violeta"
}) {
  const tonos = {
    primario: "bg-emerald-600 text-white ring-emerald-700/30",
    alerta: "bg-amber-600 text-white ring-amber-700/30",
    info: "bg-sky-600 text-white ring-sky-700/30",
    neutro: "bg-slate-700 text-white ring-slate-800/30",
    violeta: "bg-violet-600 text-white ring-violet-700/30",
  }

  return (
    <Card className="gap-0 rounded-xl border-border/70 bg-card p-4 shadow-none transition-colors duration-150 hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{titulo}</p>
          <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{valor}</p>
        </div>
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${tonos[tono]}`}
          aria-hidden="true"
        >
          {icono}
        </div>
      </div>
      <p className="mt-2 truncate text-[11px] text-muted-foreground">{detalle}</p>
    </Card>
  )
}

const estilosCotizacion: Record<EstadoCotizacion, string> = {
  Borrador: "border-slate-700 bg-slate-600 text-white",
  Enviada: "border-sky-700 bg-sky-600 text-white",
  Aceptada: "border-emerald-700 bg-emerald-600 text-white",
  Rechazada: "border-red-700 bg-red-600 text-white",
  Vencida: "border-amber-700 bg-amber-600 text-white",
}

export function EstadoCotizacionBadge({ estado }: { estado: EstadoCotizacion }) {
  return (
    <Badge variant="outline" className={`whitespace-nowrap font-medium ${estilosCotizacion[estado]}`}>
      {estado}
    </Badge>
  )
}

const estilosServicio: Record<EstadoServicio, string> = {
  Pendiente: "border-slate-700 bg-slate-600 text-white",
  "En curso": "border-sky-700 bg-sky-600 text-white",
  Completado: "border-violet-700 bg-violet-600 text-white",
  Entregado: "border-emerald-700 bg-emerald-600 text-white",
  Cancelado: "border-red-700 bg-red-600 text-white",
}

export function EstadoServicioBadge({ estado }: { estado: EstadoServicio }) {
  return (
    <Badge variant="outline" className={`whitespace-nowrap font-medium ${estilosServicio[estado]}`}>
      {estado}
    </Badge>
  )
}

export function EstadoComisionBadge({ estado }: { estado: EstadoComision }) {
  return (
    <Badge
      variant="outline"
      className={`whitespace-nowrap font-medium ${
        estado === "Pagada"
          ? "border-emerald-700 bg-emerald-600 text-white"
          : "border-amber-700 bg-amber-600 text-white"
      }`}
    >
      {estado}
    </Badge>
  )
}

export function ActivoBadge({ activo }: { activo: boolean }) {
  return (
    <Badge
      variant="outline"
      className={`whitespace-nowrap font-medium ${
        activo ? "border-emerald-700 bg-emerald-600 text-white" : "border-slate-700 bg-slate-600 text-white"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </Badge>
  )
}
