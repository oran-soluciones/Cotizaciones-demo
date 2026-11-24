import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { ItemsTrabajo } from "@/components/comunes/ItemsTrabajo"
import { Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { aInputFecha, deInputFecha } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type ItemTrabajo } from "@/lib/types"

type Formulario = {
  titulo: string
  cotizacionId: string
  clienteId: string
  vehiculoId: string
  kilometraje: string
  estado: EstadoServicio
  ingresoEn: string
  entregaEstimadaEn: string
  entregaRealEn: string
  items: ItemTrabajo[]
  manoDeObra: string
  descuento: string
  notas: string
}

function formularioInicial(): Formulario {
  const ahora = new Date()
  const entrega = new Date(ahora.getTime() + 3 * 86_400_000)
  return {
    titulo: "",
    cotizacionId: "",
    clienteId: "",
    vehiculoId: "",
    kilometraje: "0",
    estado: "Pendiente",
    ingresoEn: aInputFecha(ahora.toISOString()),
    entregaEstimadaEn: aInputFecha(entrega.toISOString()),
    entregaRealEn: "",
    items: [],
    manoDeObra: "0",
    descuento: "0",
    notas: "",
  }
}

export default function ServicioForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const {
    servicios, cotizaciones, clientes, vehiculos, catalogo,
    agregarServicio, actualizarServicio,
  } = useDatos()
  const servicio = servicios.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    servicio
      ? {
          titulo: servicio.titulo,
          cotizacionId: servicio.cotizacionId ?? "",
          clienteId: servicio.clienteId,
          vehiculoId: servicio.vehiculoId,
          kilometraje: String(servicio.kilometraje),
          estado: servicio.estado,
          ingresoEn: aInputFecha(servicio.ingresoEn),
          entregaEstimadaEn: aInputFecha(servicio.entregaEstimadaEn),
          entregaRealEn: aInputFecha(servicio.entregaRealEn),
          items: servicio.items,
          manoDeObra: String(servicio.manoDeObra),
          descuento: String(servicio.descuento),
          notas: servicio.notas,
        }
      : formularioInicial(),
  )

  useEffect(() => {
    if (id && !servicio) {
      toast.error("No se encontró el servicio")
      navegar("/servicios", { replace: true })
    }
  }, [id, servicio, navegar])

  const vehiculosDelCliente = vehiculos.filter((vehiculo) => vehiculo.clienteId === formulario.clienteId)
  const catalogoActivo = catalogo.filter((item) => item.activo)
  const cotizacionesDisponibles = cotizaciones.filter(
    (cotizacion) => !servicios.some((item) => item.cotizacionId === cotizacion.id) || cotizacion.id === formulario.cotizacionId,
  )

  function actualizar(campo: keyof Formulario, valor: string | ItemTrabajo[]) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function cambiarCliente(clienteId: string) {
    setFormulario((anterior) => ({
      ...anterior,
      clienteId,
      vehiculoId: vehiculos.find((vehiculo) => vehiculo.id === anterior.vehiculoId && vehiculo.clienteId === clienteId)?.id ?? "",
    }))
  }

  function aplicarCotizacion(cotizacionId: string) {
    const cotizacion = cotizaciones.find((item) => item.id === cotizacionId)
    if (!cotizacion) {
      actualizar("cotizacionId", "")
      return
    }
    const vehiculo = vehiculos.find((item) => item.id === cotizacion.vehiculoId)
    setFormulario((anterior) => ({
      ...anterior,
      cotizacionId,
      titulo: cotizacion.titulo,
      clienteId: cotizacion.clienteId,
      vehiculoId: cotizacion.vehiculoId,
      kilometraje: String(vehiculo?.kilometraje ?? 0),
      items: cotizacion.items,
      manoDeObra: String(cotizacion.manoDeObra),
      descuento: String(cotizacion.descuento),
      notas: cotizacion.notas,
    }))
    toast.info("Datos de la cotización cargados")
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const ingreso = deInputFecha(formulario.ingresoEn)
    const estimada = deInputFecha(formulario.entregaEstimadaEn)
    const real = deInputFecha(formulario.entregaRealEn)
    if (!formulario.titulo.trim() || !formulario.clienteId || !formulario.vehiculoId || !ingreso || !estimada) {
      toast.error("Completá título, cliente, vehículo, ingreso y entrega estimada")
      return
    }

    const datos = {
      cotizacionId: formulario.cotizacionId || undefined,
      titulo: formulario.titulo.trim(),
      clienteId: formulario.clienteId,
      vehiculoId: formulario.vehiculoId,
      kilometraje: Number(formulario.kilometraje) || 0,
      estado: formulario.estado,
      ingresoEn: ingreso,
      entregaEstimadaEn: estimada,
      entregaRealEn: real,
      items: formulario.items.filter((item) => item.descripcion.trim() && item.cantidad > 0),
      manoDeObra: Number(formulario.manoDeObra) || 0,
      descuento: Math.min(100, Math.max(0, Number(formulario.descuento) || 0)),
      notas: formulario.notas.trim(),
    }

    if (servicio) {
      actualizarServicio(servicio.id, datos)
      toast.success("Servicio actualizado")
      navegar(`/servicios/${servicio.id}`)
    } else {
      const nuevoId = agregarServicio(datos)
      toast.success("Servicio creado")
      navegar(`/servicios/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={servicio ? `/servicios/${servicio.id}` : "/servicios"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {servicio ? `Editar ${servicio.numero}` : "Nuevo servicio"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos del vehículo, tiempos, servicios realizados y comisiones.
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-4" noValidate>
        <Seccion titulo="Datos generales">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="srv-titulo">Trabajo a realizar</Label>
              <Input id="srv-titulo" name="titulo" value={formulario.titulo} onChange={(e) => actualizar("titulo", e.target.value)} placeholder="Ej.: Tren delantero y lavado de auto" autoComplete="off" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="srv-cotizacion">Cotización de origen (opcional)</Label>
              <Select value={formulario.cotizacionId} onValueChange={aplicarCotizacion}>
                <SelectTrigger id="srv-cotizacion" name="cotizacionId"><SelectValue placeholder="Sin cotización (servicio directo)" /></SelectTrigger>
                <SelectContent>
                  {cotizacionesDisponibles.map((cotizacion) => (
                    <SelectItem key={cotizacion.id} value={cotizacion.id}>{cotizacion.numero} · {cotizacion.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-cliente">Cliente</Label>
              <Select value={formulario.clienteId} onValueChange={cambiarCliente}>
                <SelectTrigger id="srv-cliente" name="clienteId"><SelectValue placeholder="Elegir cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-vehiculo">Vehículo</Label>
              <Select value={formulario.vehiculoId} onValueChange={(valor) => actualizar("vehiculoId", valor)} disabled={!formulario.clienteId}>
                <SelectTrigger id="srv-vehiculo" name="vehiculoId"><SelectValue placeholder={formulario.clienteId ? "Elegir vehículo" : "Primero elegí un cliente"} /></SelectTrigger>
                <SelectContent>
                  {vehiculosDelCliente.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.patente} · {vehiculo.marca} {vehiculo.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-kilometraje">Kilometraje (km)</Label>
              <Input id="srv-kilometraje" name="kilometraje" type="number" min={0} inputMode="numeric" className="tabular" value={formulario.kilometraje} onChange={(e) => actualizar("kilometraje", e.target.value)} placeholder="84500" />
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Estado y tiempos">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="srv-estado">Estado</Label>
              <Select value={formulario.estado} onValueChange={(valor) => actualizar("estado", valor as EstadoServicio)}>
                <SelectTrigger id="srv-estado" name="estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ESTADOS_SERVICIO.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-ingreso">Ingreso</Label>
              <Input id="srv-ingreso" name="ingresoEn" type="datetime-local" className="tabular" value={formulario.ingresoEn} onChange={(e) => actualizar("ingresoEn", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-entrega-estimada">Entrega estimada</Label>
              <Input id="srv-entrega-estimada" name="entregaEstimadaEn" type="datetime-local" className="tabular" value={formulario.entregaEstimadaEn} onChange={(e) => actualizar("entregaEstimadaEn", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-entrega-real">Entrega real</Label>
              <Input id="srv-entrega-real" name="entregaRealEn" type="datetime-local" className="tabular" value={formulario.entregaRealEn} onChange={(e) => actualizar("entregaRealEn", e.target.value)} />
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Servicios y costos" descripcion="Elegí del catálogo o cargá ítems personalizados">
          <ItemsTrabajo
            items={formulario.items}
            editable
            alCambiar={(items) => actualizar("items", items)}
            catalogo={catalogoActivo}
            manoDeObra={Number(formulario.manoDeObra) || 0}
            descuento={Number(formulario.descuento) || 0}
            alCambiarManoDeObra={(valor) => actualizar("manoDeObra", valor)}
            alCambiarDescuento={(valor) => actualizar("descuento", valor)}
          />
        </Seccion>

        <Seccion titulo="Notas">
          <div className="space-y-1.5">
            <Label htmlFor="srv-notas">Notas del trabajo</Label>
            <Textarea id="srv-notas" name="notas" rows={3} value={formulario.notas} onChange={(e) => actualizar("notas", e.target.value)} placeholder="Observaciones, novedades, recomendaciones…" />
          </div>
        </Seccion>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to={servicio ? `/servicios/${servicio.id}` : "/servicios"}>Cancelar</Link>
          </Button>
          <Button type="submit">
            <Save className="size-4" aria-hidden="true" />
            {servicio ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      </form>
    </div>
  )
}
