import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText, Pencil, UserRound, Wrench } from "lucide-react"
import { toast } from "sonner"
import { EstadoCotizacionBadge, EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { Campo, Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { totalPresupuesto } from "@/lib/calculos"
import { formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"

export default function VehiculoDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { vehiculos, clientes, cotizaciones, servicios } = useDatos()
  const vehiculo = vehiculos.find((item) => item.id === id)

  useEffect(() => {
    if (!vehiculo) {
      toast.error("No se encontró el vehículo")
      navegar("/vehiculos", { replace: true })
    }
  }, [vehiculo, navegar])

  if (!vehiculo) return null

  const cliente = clientes.find((item) => item.id === vehiculo.clienteId)
  const cotizacionesVehiculo = cotizaciones.filter((item) => item.vehiculoId === vehiculo.id)
  const serviciosVehiculo = servicios.filter((item) => item.vehiculoId === vehiculo.id)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/vehiculos">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a vehículos
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Vehículo</p>
          <h2 className="tabular mt-1 text-2xl font-semibold tracking-tight">{vehiculo.patente}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} · {formatearNumero(vehiculo.kilometraje)} km
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/vehiculos/${vehiculo.id}/editar`}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar vehículo
          </Link>
        </Button>
      </div>

      <Seccion titulo="Datos del vehículo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Patente" valor={<span className="tabular">{vehiculo.patente}</span>} />
          <Campo etiqueta="Marca" valor={vehiculo.marca} />
          <Campo etiqueta="Modelo" valor={vehiculo.modelo} />
          <Campo etiqueta="Año" valor={vehiculo.anio} />
          <Campo etiqueta="Kilometraje" valor={`${formatearNumero(vehiculo.kilometraje)} km`} />
          <Campo etiqueta="Combustible" valor={vehiculo.combustible} />
          <Campo etiqueta="Color" valor={vehiculo.color} />
        </div>
        {vehiculo.notas && <p className="border-t border-border pt-3 text-sm leading-relaxed">{vehiculo.notas}</p>}
      </Seccion>

      <Seccion titulo="Propietario">
        {cliente ? (
          <Link to={`/clientes/${cliente.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
            <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{cliente.nombre}</p>
              <p className="truncate text-[11px] text-muted-foreground">{cliente.documento} · {cliente.telefono}</p>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">Sin cliente asignado.</p>
        )}
      </Seccion>

      <Seccion titulo="Historial" descripcion="Cotizaciones y servicios de este vehículo">
        <div className="space-y-2">
          {cotizacionesVehiculo.length === 0 && serviciosVehiculo.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Todavía no hay presupuestos ni servicios.</p>
          ) : (
            <>
              {cotizacionesVehiculo.map((cotizacion) => (
                <Link key={cotizacion.id} to={`/cotizaciones/${cotizacion.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tabular truncate text-xs text-muted-foreground">{cotizacion.numero}</p>
                    <p className="truncate text-sm font-medium">{cotizacion.titulo}</p>
                  </div>
                  <span className="tabular whitespace-nowrap text-sm font-semibold">{formatearMoneda(totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento))}</span>
                  <EstadoCotizacionBadge estado={cotizacion.estado} />
                </Link>
              ))}
              {serviciosVehiculo.map((servicio) => (
                <Link key={servicio.id} to={`/servicios/${servicio.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="tabular truncate text-xs text-muted-foreground">{servicio.numero}</p>
                    <p className="truncate text-sm font-medium">{servicio.titulo}</p>
                    <p className="tabular truncate text-[11px] text-muted-foreground">{formatearNumero(servicio.kilometraje)} km al ingreso</p>
                  </div>
                  <span className="tabular whitespace-nowrap text-sm font-semibold">{formatearMoneda(totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento))}</span>
                  <EstadoServicioBadge estado={servicio.estado} />
                </Link>
              ))}
            </>
          )}
        </div>
      </Seccion>
    </div>
  )
}
