import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft, CarFront, Coins, FileText, Pencil, UserRound, Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoComisionBadge, EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { ItemsTrabajo } from "@/components/comunes/ItemsTrabajo"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { totalPresupuesto } from "@/lib/calculos"
import { formatearFechaHora, formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio } from "@/lib/types"

function tiempoEnGarage(ingreso: string, entrega?: string): string {
  const fin = entrega ? new Date(entrega).getTime() : Date.now()
  const minutos = Math.max(0, Math.floor((fin - new Date(ingreso).getTime()) / 60_000))
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  if (dias > 0) return `${dias} d ${horas} h`
  if (horas > 0) return `${horas} h ${minutos % 60} min`
  return `${minutos} min`
}

export default function ServicioDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const {
    servicios, cotizaciones, clientes, vehiculos, comisiones, cambiarEstadoServicio,
  } = useDatos()
  const servicio = servicios.find((item) => item.id === id)

  useEffect(() => {
    if (!servicio) {
      toast.error("No se encontró el servicio")
      navegar("/servicios", { replace: true })
    }
  }, [servicio, navegar])

  if (!servicio) return null

  const cliente = clientes.find((item) => item.id === servicio.clienteId)
  const vehiculo = vehiculos.find((item) => item.id === servicio.vehiculoId)
  const cotizacion = cotizaciones.find((item) => item.id === servicio.cotizacionId)
  const comisionesServicio = comisiones.filter(
    (comision) => comision.origenTipo === "servicio" && comision.origenId === servicio.id,
  )
  const total = totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento)

  function cambiarEstado(estado: EstadoServicio) {
    if (!servicio) return
    cambiarEstadoServicio(servicio.id, estado)
    toast.success(`Estado actualizado a ${estado}`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/servicios">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a servicios
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="tabular text-xs font-medium text-muted-foreground">{servicio.numero}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{servicio.titulo}</h2>
            <EstadoServicioBadge estado={servicio.estado} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {cliente?.nombre ?? "Cliente sin nombre"} · {vehiculo?.patente ?? "Vehículo sin patente"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={servicio.estado} onValueChange={(valor) => cambiarEstado(valor as EstadoServicio)}>
            <SelectTrigger aria-label="Cambiar estado del servicio" className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_SERVICIO.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to={`/servicios/${servicio.id}/editar`}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <Seccion titulo="Cliente y vehículo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to={cliente ? `/clientes/${cliente.id}` : "/clientes"} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cliente</p>
              <p className="truncate text-sm font-medium">{cliente?.nombre ?? "—"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{cliente?.telefono ?? ""}</p>
            </div>
          </Link>
          <Link to={vehiculo ? `/vehiculos/${vehiculo.id}` : "/vehiculos"} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <CarFront className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Vehículo</p>
              <p className="tabular truncate text-sm font-medium">
                {vehiculo ? `${vehiculo.patente} · ${vehiculo.marca} ${vehiculo.modelo}` : "—"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {vehiculo?.combustible ?? ""} {vehiculo?.anio ?? ""}
              </p>
            </div>
          </Link>
          <Campo etiqueta="Kilometraje" valor={`${formatearNumero(servicio.kilometraje)} km`} />
          <Campo etiqueta="Cotización de origen" valor={cotizacion ? (
            <Link className="tabular hover:underline" to={`/cotizaciones/${cotizacion.id}`}>{cotizacion.numero}</Link>
          ) : "Servicio directo"} />
        </div>
      </Seccion>

      <Seccion titulo="Estado y tiempos">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Estado</p>
            <div className="mt-1"><EstadoServicioBadge estado={servicio.estado} /></div>
          </div>
          <Campo etiqueta="Ingreso" valor={formatearFechaHora(servicio.ingresoEn)} />
          <Campo etiqueta="Entrega estimada" valor={formatearFechaHora(servicio.entregaEstimadaEn)} />
          <Campo etiqueta="Entrega real" valor={servicio.entregaRealEn ? formatearFechaHora(servicio.entregaRealEn) : "—"} />
          <Campo etiqueta="Tiempo en garage" valor={tiempoEnGarage(servicio.ingresoEn, servicio.entregaRealEn)} />
        </div>
      </Seccion>

      <Seccion titulo="Servicios y costos" descripcion="Detalle de los trabajos realizados">
        <ItemsTrabajo
          items={servicio.items}
          manoDeObra={servicio.manoDeObra}
          descuento={servicio.descuento}
        />
      </Seccion>

      {servicio.notas && (
        <Seccion titulo="Notas">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{servicio.notas}</p>
        </Seccion>
      )}

      <Seccion titulo="Comisiones del personal" descripcion={`${comisionesServicio.length} asignaciones sobre ${formatearMoneda(total)}`}>
        <div className="space-y-2">
          {comisionesServicio.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sin comisiones asignadas.</p>
          ) : (
            comisionesServicio.map((comision) => (
              <div key={comision.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Coins className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{comision.personalNombre}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {comision.tipo === "porcentaje" ? `${comision.valor} % del total` : "Monto fijo"}
                  </p>
                </div>
                <span className="tabular whitespace-nowrap text-sm font-semibold">{formatearMoneda(comision.monto)}</span>
                <EstadoComisionBadge estado={comision.estado} />
              </div>
            ))
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/comisiones/nuevo?origen=servicio&origenId=${servicio.id}`}>
              <Coins className="size-4" aria-hidden="true" />
              Asignar comisión
            </Link>
          </Button>
        </div>
      </Seccion>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Wrench className="size-3.5" aria-hidden="true" />
        <FileText className="size-3.5" aria-hidden="true" />
        Servicio {servicio.numero} · {formatearMoneda(total)}
      </p>
    </div>
  )
}
