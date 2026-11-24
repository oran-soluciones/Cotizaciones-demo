import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CarFront, FileText, Pencil, Plus, Wrench } from "lucide-react"
import { toast } from "sonner"
import { EstadoCotizacionBadge, EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/format"
import { totalPresupuesto } from "@/lib/calculos"
import { useDatos } from "@/lib/store"

export default function ClienteDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { clientes, vehiculos, cotizaciones, servicios } = useDatos()
  const cliente = clientes.find((item) => item.id === id)

  useEffect(() => {
    if (!cliente) {
      toast.error("No se encontró el cliente")
      navegar("/clientes", { replace: true })
    }
  }, [cliente, navegar])

  if (!cliente) return null

  const vehiculosCliente = vehiculos.filter((vehiculo) => vehiculo.clienteId === cliente.id)
  const cotizacionesCliente = cotizaciones.filter((cotizacion) => cotizacion.clienteId === cliente.id)
  const serviciosCliente = servicios.filter((servicio) => servicio.clienteId === cliente.id)
  const totalCotizado = cotizacionesCliente.reduce(
    (total, cotizacion) => total + totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento),
    0,
  )

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/clientes">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a clientes
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{cliente.documento || "Sin documento"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{cliente.nombre}</h2>
            <span className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-[11px]">{cliente.tipo}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatearNumero(vehiculosCliente.length)} vehículos · {formatearNumero(cotizacionesCliente.length)} cotizaciones · {formatearMoneda(totalCotizado)} cotizados
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/clientes/${cliente.id}/editar`}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar cliente
          </Link>
        </Button>
      </div>

      <Seccion titulo="Datos de contacto">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono" valor={cliente.telefono} />
          <Campo etiqueta="Email" valor={cliente.email} />
          <Campo etiqueta="Dirección" valor={cliente.direccion} />
          <Campo etiqueta="Alta" valor={formatearFecha(cliente.creadoEn)} />
        </div>
      </Seccion>

      <Seccion titulo="Vehículos" descripcion="Patentes y kilometraje registrados">
        <div className="space-y-2">
          {vehiculosCliente.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sin vehículos registrados.</p>
          ) : (
            vehiculosCliente.map((vehiculo) => (
              <Link
                key={vehiculo.id}
                to={`/vehiculos/${vehiculo.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <CarFront className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="tabular truncate text-sm font-semibold">{vehiculo.patente}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} · {formatearNumero(vehiculo.kilometraje)} km
                  </p>
                </div>
              </Link>
            ))
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to="/vehiculos/nuevo">
              <Plus className="size-4" aria-hidden="true" />
              Agregar vehículo
            </Link>
          </Button>
        </div>
      </Seccion>

      <Seccion titulo="Cotizaciones y servicios" descripcion="Historial del cliente">
        <div className="space-y-2">
          {cotizacionesCliente.length === 0 && serviciosCliente.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Todavía no hay presupuestos ni servicios.</p>
          ) : (
            <>
              {cotizacionesCliente.map((cotizacion) => (
                <Link
                  key={cotizacion.id}
                  to={`/cotizaciones/${cotizacion.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tabular truncate text-xs font-medium text-muted-foreground">{cotizacion.numero}</p>
                    <p className="truncate text-sm font-medium">{cotizacion.titulo}</p>
                  </div>
                  <span className="tabular whitespace-nowrap text-sm font-semibold">
                    {formatearMoneda(totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento))}
                  </span>
                  <EstadoCotizacionBadge estado={cotizacion.estado} />
                </Link>
              ))}
              {serviciosCliente.map((servicio) => (
                <Link
                  key={servicio.id}
                  to={`/servicios/${servicio.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tabular truncate text-xs font-medium text-muted-foreground">{servicio.numero}</p>
                    <p className="truncate text-sm font-medium">{servicio.titulo}</p>
                  </div>
                  <span className="tabular whitespace-nowrap text-sm font-semibold">
                    {formatearMoneda(totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento))}
                  </span>
                  <EstadoServicioBadge estado={servicio.estado} />
                </Link>
              ))}
            </>
          )}
        </div>
      </Seccion>

      {cliente.notas && (
        <Seccion titulo="Notas">
          <p className="text-sm leading-relaxed">{cliente.notas}</p>
        </Seccion>
      )}
    </div>
  )
}
