import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDatos } from "@/lib/store"
import { COMBUSTIBLES } from "@/lib/types"

type Formulario = {
  clienteId: string
  patente: string
  marca: string
  modelo: string
  anio: string
  kilometraje: string
  combustible: string
  color: string
  notas: string
}

const formularioVacio: Formulario = {
  clienteId: "",
  patente: "",
  marca: "",
  modelo: "",
  anio: String(new Date().getFullYear()),
  kilometraje: "0",
  combustible: "Nafta",
  color: "",
  notas: "",
}

export default function VehiculoForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { vehiculos, clientes, agregarVehiculo, actualizarVehiculo } = useDatos()
  const vehiculo = vehiculos.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    vehiculo
      ? {
          clienteId: vehiculo.clienteId,
          patente: vehiculo.patente,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: String(vehiculo.anio),
          kilometraje: String(vehiculo.kilometraje),
          combustible: vehiculo.combustible,
          color: vehiculo.color,
          notas: vehiculo.notas,
        }
      : formularioVacio,
  )

  useEffect(() => {
    if (id && !vehiculo) {
      toast.error("No se encontró el vehículo")
      navegar("/vehiculos", { replace: true })
    }
  }, [id, vehiculo, navegar])

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!formulario.patente.trim() || !formulario.clienteId) {
      toast.error("Ingresá la patente y seleccioná el cliente")
      return
    }
    const datos = {
      clienteId: formulario.clienteId,
      patente: formulario.patente.trim().toUpperCase(),
      marca: formulario.marca.trim(),
      modelo: formulario.modelo.trim(),
      anio: Number(formulario.anio) || new Date().getFullYear(),
      kilometraje: Number(formulario.kilometraje) || 0,
      combustible: formulario.combustible,
      color: formulario.color.trim(),
      notas: formulario.notas.trim(),
    }

    if (vehiculo) {
      actualizarVehiculo(vehiculo.id, datos)
      toast.success("Vehículo actualizado")
      navegar(`/vehiculos/${vehiculo.id}`)
    } else {
      const nuevoId = agregarVehiculo(datos)
      toast.success("Vehículo creado")
      navegar(`/vehiculos/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={vehiculo ? `/vehiculos/${vehiculo.id}` : "/vehiculos"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{vehiculo ? `Editar ${vehiculo.patente}` : "Nuevo vehículo"}</CardTitle>
          <CardDescription>Patente, datos del vehículo y kilometraje actual.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="veh-cliente">Cliente</Label>
                <Select value={formulario.clienteId} onValueChange={(valor) => actualizar("clienteId", valor)}>
                  <SelectTrigger id="veh-cliente" name="clienteId"><SelectValue placeholder="Elegir cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre} · {cliente.documento}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-patente">Patente</Label>
                <Input id="veh-patente" name="patente" value={formulario.patente} onChange={(e) => actualizar("patente", e.target.value.toUpperCase())} placeholder="AB 123 CD" autoComplete="off" spellCheck={false} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-kilometraje">Kilometraje (km)</Label>
                <Input id="veh-kilometraje" name="kilometraje" type="number" min={0} inputMode="numeric" className="tabular" value={formulario.kilometraje} onChange={(e) => actualizar("kilometraje", e.target.value)} placeholder="84500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-marca">Marca</Label>
                <Input id="veh-marca" name="marca" value={formulario.marca} onChange={(e) => actualizar("marca", e.target.value)} placeholder="Toyota" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-modelo">Modelo</Label>
                <Input id="veh-modelo" name="modelo" value={formulario.modelo} onChange={(e) => actualizar("modelo", e.target.value)} placeholder="Corolla" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-anio">Año</Label>
                <Input id="veh-anio" name="anio" type="number" min={1950} max={2100} inputMode="numeric" className="tabular" value={formulario.anio} onChange={(e) => actualizar("anio", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-combustible">Combustible</Label>
                <Select value={formulario.combustible} onValueChange={(valor) => actualizar("combustible", valor)}>
                  <SelectTrigger id="veh-combustible" name="combustible"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMBUSTIBLES.map((combustible) => <SelectItem key={combustible} value={combustible}>{combustible}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="veh-color">Color</Label>
                <Input id="veh-color" name="color" value={formulario.color} onChange={(e) => actualizar("color", e.target.value)} placeholder="Gris" autoComplete="off" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="veh-notas">Notas</Label>
                <Textarea id="veh-notas" name="notas" rows={3} value={formulario.notas} onChange={(e) => actualizar("notas", e.target.value)} placeholder="Observaciones del vehículo…" />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to={vehiculo ? `/vehiculos/${vehiculo.id}` : "/vehiculos"}>Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {vehiculo ? "Guardar cambios" : "Crear vehículo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
