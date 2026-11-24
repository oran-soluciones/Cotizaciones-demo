import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Check, FileText, Pencil, Trash2, Undo2, UserRound, Wrench } from "lucide-react"
import { toast } from "sonner"
import { EstadoComisionBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { montoComision } from "@/lib/calculos"
import { formatearFecha, formatearMoneda } from "@/lib/format"
import { useDatos } from "@/lib/store"

export default function ComisionDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const {
    comisiones, personal, cotizaciones, servicios, cambiarEstadoComision, eliminarComision,
  } = useDatos()
  const comision = comisiones.find((item) => item.id === id)

  useEffect(() => {
    if (!comision) {
      toast.error("No se encontró la comisión")
      navegar("/comisiones", { replace: true })
    }
  }, [comision, navegar])

  if (!comision) return null

  const persona = personal.find((item) => item.id === comision.personalId)
  const cotizacion = comision.origenTipo === "cotizacion"
    ? cotizaciones.find((item) => item.id === comision.origenId)
    : undefined
  const servicio = comision.origenTipo === "servicio"
    ? servicios.find((item) => item.id === comision.origenId)
    : undefined
  const monto = montoComision(comision)

  function alternarPago() {
    const nuevoEstado = comision!.estado === "Pagada" ? "Pendiente" : "Pagada"
    cambiarEstadoComision(comision!.id, nuevoEstado)
    toast.success(nuevoEstado === "Pagada" ? "Comisión marcada como pagada" : "Comisión marcada como pendiente")
  }

  function eliminar() {
    eliminarComision(comision!.id)
    toast.success("Comisión eliminada")
    navegar("/comisiones")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/comisiones">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a comisiones
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Comisión</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{comision.personalNombre}</h2>
            <EstadoComisionBadge estado={comision.estado} />
          </div>
          <p className="tabular mt-1 text-sm text-muted-foreground">{comision.origenNumero}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={alternarPago}>
            {comision.estado === "Pagada"
              ? <Undo2 className="size-4" aria-hidden="true" />
              : <Check className="size-4" aria-hidden="true" />}
            {comision.estado === "Pagada" ? "Marcar pendiente" : "Marcar pagada"}
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/comisiones/${comision.id}/editar`}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={eliminar}>
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar
          </Button>
        </div>
      </div>

      <Seccion titulo="Detalle de la asignación">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Personal" valor={persona ? (
            <Link className="hover:underline" to={`/personal/${persona.id}`}>{persona.nombre} {persona.apellido}</Link>
          ) : comision.personalNombre} />
          <Campo etiqueta="Origen" valor={comision.origenTipo === "cotizacion" ? "Cotización" : "Servicio"} />
          <Campo
            etiqueta="Trabajo"
            valor={cotizacion ? (
              <Link className="hover:underline" to={`/cotizaciones/${cotizacion.id}`}>{cotizacion.titulo}</Link>
            ) : servicio ? (
              <Link className="hover:underline" to={`/servicios/${servicio.id}`}>{servicio.titulo}</Link>
            ) : comision.origenNumero}
          />
          <Campo etiqueta="Fecha de asignación" valor={formatearFecha(comision.creadoEn)} />
          {comision.pagadaEn && <Campo etiqueta="Fecha de pago" valor={formatearFecha(comision.pagadaEn)} />}
        </div>
      </Seccion>

      <Seccion titulo="Cálculo">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo
            etiqueta="Modalidad"
            valor={comision.tipo === "porcentaje" ? "Porcentaje del total" : "Monto fijo"}
          />
          <Campo
            etiqueta="Valor aplicado"
            valor={comision.tipo === "porcentaje" ? `${comision.valor} %` : formatearMoneda(comision.valor)}
          />
          <Campo etiqueta="Base" valor={formatearMoneda(comision.base)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <span className="text-sm font-medium">Monto de la comisión</span>
          <span className="tabular text-xl font-semibold">{formatearMoneda(monto)}</span>
        </div>
      </Seccion>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <UserRound className="size-3.5" aria-hidden="true" />
        <FileText className="size-3.5" aria-hidden="true" />
        <Wrench className="size-3.5" aria-hidden="true" />
        El monto se calculó sobre el total del origen al momento de la asignación.
      </p>
    </div>
  )
}
