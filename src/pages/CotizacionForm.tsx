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
import { ESTADOS_COTIZACION, type EstadoCotizacion, type ItemTrabajo } from "@/lib/types"

type Formulario = {
  titulo: string
  clienteId: string
  vehiculoId: string
  fecha: string
  vigenteHasta: string
  estado: EstadoCotizacion
  items: ItemTrabajo[]
  manoDeObra: string
  descuento: string
  condiciones: string
  notas: string
}

function formularioInicial(): Formulario {
  const ahora = new Date()
  const vigencia = new Date(ahora.getTime() + 30 * 86_400_000)
  return {
    titulo: "",
    clienteId: "",
    vehiculoId: "",
    fecha: aInputFecha(ahora.toISOString()),
    vigenteHasta: aInputFecha(vigencia.toISOString()),
    estado: "Borrador",
    items: [],
    manoDeObra: "0",
    descuento: "0",
    condiciones: "",
    notas: "",
  }
}

export default function CotizacionForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const {
    cotizaciones, clientes, vehiculos, catalogo, agregarCotizacion, actualizarCotizacion,
  } = useDatos()
  const cotizacion = cotizaciones.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    cotizacion
      ? {
          titulo: cotizacion.titulo,
          clienteId: cotizacion.clienteId,
          vehiculoId: cotizacion.vehiculoId,
          fecha: aInputFecha(cotizacion.fecha),
          vigenteHasta: aInputFecha(cotizacion.vigenteHasta),
          estado: cotizacion.estado,
          items: cotizacion.items,
          manoDeObra: String(cotizacion.manoDeObra),
          descuento: String(cotizacion.descuento),
          condiciones: cotizacion.condiciones,
          notas: cotizacion.notas,
        }
      : formularioInicial(),
  )

  useEffect(() => {
    if (id && !cotizacion) {
      toast.error("No se encontró la cotización")
      navegar("/cotizaciones", { replace: true })
    }
  }, [id, cotizacion, navegar])

  const vehiculosDelCliente = vehiculos.filter((vehiculo) => vehiculo.clienteId === formulario.clienteId)
  const catalogoActivo = catalogo.filter((servicio) => servicio.activo)

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

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const fecha = deInputFecha(formulario.fecha)
    const vigenteHasta = deInputFecha(formulario.vigenteHasta)
    if (!formulario.titulo.trim() || !formulario.clienteId || !formulario.vehiculoId || !fecha || !vigenteHasta) {
      toast.error("Completá título, cliente, vehículo, fecha y vigencia")
      return
    }
    if (new Date(vigenteHasta).getTime() < new Date(fecha).getTime()) {
      toast.error("La vigencia no puede ser anterior a la fecha de la cotización")
      return
    }

    const datos = {
      titulo: formulario.titulo.trim(),
      clienteId: formulario.clienteId,
      vehiculoId: formulario.vehiculoId,
      fecha,
      vigenteHasta,
      estado: formulario.estado,
      items: formulario.items.filter((item) => item.descripcion.trim() && item.cantidad > 0),
      manoDeObra: Number(formulario.manoDeObra) || 0,
      descuento: Math.min(100, Math.max(0, Number(formulario.descuento) || 0)),
      condiciones: formulario.condiciones.trim(),
      notas: formulario.notas.trim(),
    }

    if (cotizacion) {
      actualizarCotizacion(cotizacion.id, datos)
      toast.success("Cotización actualizada")
      navegar(`/cotizaciones/${cotizacion.id}`)
    } else {
      const nuevoId = agregarCotizacion(datos)
      toast.success("Cotización creada")
      navegar(`/cotizaciones/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={cotizacion ? `/cotizaciones/${cotizacion.id}` : "/cotizaciones"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {cotizacion ? `Editar ${cotizacion.numero}` : "Nueva cotización"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cliente, vehículo, servicios a realizar y costo total del presupuesto.
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-4" noValidate>
        <Seccion titulo="Datos generales">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cot-titulo">Título del presupuesto</Label>
              <Input id="cot-titulo" name="titulo" value={formulario.titulo} onChange={(e) => actualizar("titulo", e.target.value)} placeholder="Ej.: Revisión general y tren delantero" autoComplete="off" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cot-cliente">Cliente</Label>
              <Select value={formulario.clienteId} onValueChange={cambiarCliente}>
                <SelectTrigger id="cot-cliente" name="clienteId"><SelectValue placeholder="Elegir cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cot-vehiculo">Vehículo</Label>
              <Select value={formulario.vehiculoId} onValueChange={(valor) => actualizar("vehiculoId", valor)} disabled={!formulario.clienteId}>
                <SelectTrigger id="cot-vehiculo" name="vehiculoId"><SelectValue placeholder={formulario.clienteId ? "Elegir vehículo" : "Primero elegí un cliente"} /></SelectTrigger>
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
              <Label htmlFor="cot-fecha">Fecha</Label>
              <Input id="cot-fecha" name="fecha" type="datetime-local" className="tabular" value={formulario.fecha} onChange={(e) => actualizar("fecha", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cot-vigencia">Vigente hasta</Label>
              <Input id="cot-vigencia" name="vigenteHasta" type="datetime-local" className="tabular" value={formulario.vigenteHasta} onChange={(e) => actualizar("vigenteHasta", e.target.value)} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cot-estado">Estado</Label>
              <Select value={formulario.estado} onValueChange={(valor) => actualizar("estado", valor as EstadoCotizacion)}>
                <SelectTrigger id="cot-estado" name="estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ESTADOS_COTIZACION.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Servicios y repuestos" descripcion="Elegí del catálogo o cargá ítems personalizados">
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

        <Seccion titulo="Condiciones y notas">
          <div className="space-y-1.5">
            <Label htmlFor="cot-condiciones">Condiciones</Label>
            <Textarea id="cot-condiciones" name="condiciones" rows={2} value={formulario.condiciones} onChange={(e) => actualizar("condiciones", e.target.value)} placeholder="Validez, forma de pago, seña…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cot-notas">Notas internas</Label>
            <Textarea id="cot-notas" name="notas" rows={2} value={formulario.notas} onChange={(e) => actualizar("notas", e.target.value)} placeholder="Observaciones para el taller…" />
          </div>
        </Seccion>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to={cotizacion ? `/cotizaciones/${cotizacion.id}` : "/cotizaciones"}>Cancelar</Link>
          </Button>
          <Button type="submit">
            <Save className="size-4" aria-hidden="true" />
            {cotizacion ? "Guardar cambios" : "Crear cotización"}
          </Button>
        </div>
      </form>
    </div>
  )
}
