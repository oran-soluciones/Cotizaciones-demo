import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft, CarFront, Coins, FileText, Pencil, UserRound, Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoComisionBadge, EstadoCotizacionBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { ItemsTrabajo } from "@/components/comunes/ItemsTrabajo"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { totalPresupuesto } from "@/lib/calculos"
import { formatearFechaHora, formatearMoneda, textoVencimiento } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_COTIZACION, type EstadoCotizacion } from "@/lib/types"

export default function CotizacionDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const {
    cotizaciones, clientes, vehiculos, servicios, comisiones,
    cambiarEstadoCotizacion, generarServicioDesdeCotizacion,
  } = useDatos()
  const cotizacion = cotizaciones.find((item) => item.id === id)

  useEffect(() => {
    if (!cotizacion) {
      toast.error("No se encontró la cotización")
      navegar("/cotizaciones", { replace: true })
    }
  }, [cotizacion, navegar])

  if (!cotizacion) return null

  const cliente = clientes.find((item) => item.id === cotizacion.clienteId)
  const vehiculo = vehiculos.find((item) => item.id === cotizacion.vehiculoId)
  const comisionesCotizacion = comisiones.filter(
    (comision) => comision.origenTipo === "cotizacion" && comision.origenId === cotizacion.id,
  )
  const servicioGenerado = servicios.find((servicio) => servicio.cotizacionId === cotizacion.id)
  const total = totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento)

  function cambiarEstado(estado: EstadoCotizacion) {
    if (!cotizacion) return
    cambiarEstadoCotizacion(cotizacion.id, estado)
    toast.success(`Estado actualizado a ${estado}`)
  }

  function generarServicio() {
    if (!cotizacion) return
    const servicioId = generarServicioDesdeCotizacion(cotizacion.id)
    if (servicioId) {
      toast.success("Servicio generado a partir de la cotización")
      navegar(`/servicios/${servicioId}`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/cotizaciones">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a cotizaciones
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="tabular text-xs font-medium text-muted-foreground">{cotizacion.numero}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{cotizacion.titulo}</h2>
            <EstadoCotizacionBadge estado={cotizacion.estado} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {cliente?.nombre ?? "Cliente sin nombre"} · {vehiculo?.patente ?? "Vehículo sin patente"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={cotizacion.estado} onValueChange={(valor) => cambiarEstado(valor as EstadoCotizacion)}>
            <SelectTrigger aria-label="Cambiar estado de la cotización" className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_COTIZACION.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to={`/cotizaciones/${cotizacion.id}/editar`}>
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
            </div>
          </Link>
          <Link to={vehiculo ? `/vehiculos/${vehiculo.id}` : "/vehiculos"} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <CarFront className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Vehículo</p>
              <p className="tabular truncate text-sm font-medium">
                {vehiculo ? `${vehiculo.patente} · ${vehiculo.marca} ${vehiculo.modelo}` : "—"}
              </p>
            </div>
          </Link>
        </div>
      </Seccion>

      <Seccion titulo="Fechas y estado" descripcion={textoVencimiento(cotizacion.vigenteHasta)}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Fecha" valor={formatearFechaHora(cotizacion.fecha)} />
          <Campo etiqueta="Vigente hasta" valor={formatearFechaHora(cotizacion.vigenteHasta)} />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Estado</p>
            <div className="mt-1"><EstadoCotizacionBadge estado={cotizacion.estado} /></div>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Servicios y costos" descripcion="Detalle del presupuesto">
        <ItemsTrabajo
          items={cotizacion.items}
          manoDeObra={cotizacion.manoDeObra}
          descuento={cotizacion.descuento}
        />
      </Seccion>

      {(cotizacion.condiciones || cotizacion.notas) && (
        <Seccion titulo="Condiciones y notas">
          {cotizacion.condiciones && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Condiciones</p>
              <p className="mt-1 text-sm leading-relaxed">{cotizacion.condiciones}</p>
            </div>
          )}
          {cotizacion.notas && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Notas internas</p>
              <p className="mt-1 text-sm leading-relaxed">{cotizacion.notas}</p>
            </div>
          )}
        </Seccion>
      )}

      <Seccion titulo="Servicio generado" descripcion="Cotización convertida en trabajo del taller">
        {servicioGenerado ? (
          <Link to={`/servicios/${servicioGenerado.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="tabular text-xs text-muted-foreground">{servicioGenerado.numero}</p>
              <p className="truncate text-sm font-medium">{servicioGenerado.titulo}</p>
            </div>
            <span className="tabular whitespace-nowrap text-sm font-semibold">
              {formatearMoneda(totalPresupuesto(servicioGenerado.items, servicioGenerado.manoDeObra, servicioGenerado.descuento))}
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Todavía no se generó el servicio correspondiente a esta cotización.</p>
            <Button onClick={generarServicio}>
              <Wrench className="size-4" aria-hidden="true" />
              Generar servicio
            </Button>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Comisiones asignadas" descripcion={`${comisionesCotizacion.length} asignaciones sobre ${formatearMoneda(total)}`}>
        <div className="space-y-2">
          {comisionesCotizacion.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sin comisiones asignadas.</p>
          ) : (
            comisionesCotizacion.map((comision) => (
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
            <Link
              to={`/comisiones/nuevo?origen=cotizacion&origenId=${cotizacion.id}`}
              onClick={() => { if (cotizacion.estado !== "Aceptada") toast.info("La cotización todavía no está aceptada") }}
            >
              <Coins className="size-4" aria-hidden="true" />
              Asignar comisión
            </Link>
          </Button>
        </div>
      </Seccion>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <FileText className="size-3.5" aria-hidden="true" />
        Presupuesto {cotizacion.numero} · {formatearMoneda(total)}
      </p>
    </div>
  )
}
