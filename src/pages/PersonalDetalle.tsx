import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Coins, Pencil } from "lucide-react"
import { toast } from "sonner"
import { ActivoBadge, EstadoComisionBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { formatearFecha, formatearMoneda, formatearNumero, formatearPorcentaje, iniciales } from "@/lib/format"
import { useDatos } from "@/lib/store"

export default function PersonalDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { personal, comisiones, cotizaciones, servicios } = useDatos()
  const persona = personal.find((item) => item.id === id)

  useEffect(() => {
    if (!persona) {
      toast.error("No se encontró el integrante")
      navegar("/personal", { replace: true })
    }
  }, [persona, navegar])

  if (!persona) return null

  const comisionesPersona = comisiones.filter((comision) => comision.personalId === persona.id)
  const total = comisionesPersona.reduce((suma, comision) => suma + comision.monto, 0)
  const pagado = comisionesPersona.filter((comision) => comision.estado === "Pagada").reduce((suma, comision) => suma + comision.monto, 0)
  const pendiente = total - pagado

  function etiquetaOrigen(comision: (typeof comisionesPersona)[number]): string {
    if (comision.origenTipo === "cotizacion") {
      return cotizaciones.find((item) => item.id === comision.origenId)?.titulo ?? comision.origenNumero
    }
    return servicios.find((item) => item.id === comision.origenId)?.titulo ?? comision.origenNumero
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/personal">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a personal
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/25" aria-hidden="true">
            {iniciales(persona.nombre, persona.apellido)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">{persona.nombre} {persona.apellido}</h2>
              <ActivoBadge activo={persona.activo} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {persona.rol || "Sin rol"} {persona.esTitular ? "· Titular del taller" : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/personal/${persona.id}/editar`}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
        </Button>
      </div>

      <Seccion titulo="Datos de contacto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono" valor={persona.telefono} />
          <Campo etiqueta="Email" valor={persona.email} />
        </div>
        {persona.notas && <p className="border-t border-border pt-3 text-sm leading-relaxed">{persona.notas}</p>}
      </Seccion>

      <Seccion titulo="Comisión por defecto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Modalidad"
            valor={persona.tipoComision === "porcentaje" ? "Porcentaje del total" : "Monto fijo por trabajo"}
          />
          <Campo
            etiqueta="Valor"
            valor={persona.tipoComision === "porcentaje"
              ? formatearPorcentaje(persona.valorComision)
              : formatearMoneda(persona.valorComision)}
          />
        </div>
      </Seccion>

      <Seccion titulo="Resumen de comisiones">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { titulo: "Total asignado", valor: total },
            { titulo: "Pagado", valor: pagado },
            { titulo: "Pendiente", valor: pendiente },
          ].map((metrica) => (
            <div key={metrica.titulo} className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{metrica.titulo}</p>
              <p className="tabular mt-1 text-lg font-semibold">{formatearMoneda(metrica.valor)}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Comisiones asignadas" descripcion={`${formatearNumero(comisionesPersona.length)} asignaciones`}>
        <div className="space-y-2">
          {comisionesPersona.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Todavía no tiene comisiones asignadas.</p>
          ) : (
            comisionesPersona.map((comision) => (
              <div key={comision.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Coins className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{etiquetaOrigen(comision)}</p>
                  <p className="tabular text-[11px] text-muted-foreground">
                    {comision.origenNumero} · {comision.tipo === "porcentaje" ? `${comision.valor} % de ${formatearMoneda(comision.base)}` : "Monto fijo"} · {formatearFecha(comision.creadoEn)}
                  </p>
                </div>
                <span className="tabular whitespace-nowrap text-sm font-semibold">{formatearMoneda(comision.monto)}</span>
                <EstadoComisionBadge estado={comision.estado} />
              </div>
            ))
          )}
        </div>
      </Seccion>
    </div>
  )
}
