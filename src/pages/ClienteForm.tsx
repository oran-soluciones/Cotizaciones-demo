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
import { TIPOS_CLIENTE, type TipoCliente } from "@/lib/types"

type Formulario = {
  nombre: string
  documento: string
  tipo: TipoCliente
  telefono: string
  email: string
  direccion: string
  notas: string
}

const formularioVacio: Formulario = {
  nombre: "",
  documento: "",
  tipo: "Particular",
  telefono: "",
  email: "",
  direccion: "",
  notas: "",
}

export default function ClienteForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { clientes, agregarCliente, actualizarCliente } = useDatos()
  const cliente = clientes.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    cliente
      ? {
          nombre: cliente.nombre,
          documento: cliente.documento,
          tipo: cliente.tipo,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
          notas: cliente.notas,
        }
      : formularioVacio,
  )

  useEffect(() => {
    if (id && !cliente) {
      toast.error("No se encontró el cliente")
      navegar("/clientes", { replace: true })
    }
  }, [id, cliente, navegar])

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!formulario.nombre.trim()) {
      toast.error("Ingresá el nombre del cliente")
      return
    }
    const datos = {
      nombre: formulario.nombre.trim(),
      documento: formulario.documento.trim(),
      tipo: formulario.tipo,
      telefono: formulario.telefono.trim(),
      email: formulario.email.trim(),
      direccion: formulario.direccion.trim(),
      notas: formulario.notas.trim(),
    }

    if (cliente) {
      actualizarCliente(cliente.id, datos)
      toast.success("Cliente actualizado")
      navegar(`/clientes/${cliente.id}`)
    } else {
      const nuevoId = agregarCliente(datos)
      toast.success("Cliente creado")
      navegar(`/clientes/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={cliente ? `/clientes/${cliente.id}` : "/clientes"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{cliente ? `Editar ${cliente.nombre}` : "Nuevo cliente"}</CardTitle>
          <CardDescription>Datos de contacto y documentación del cliente del taller.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-nombre">Nombre / Razón social</Label>
                <Input id="cli-nombre" name="nombre" value={formulario.nombre} onChange={(e) => actualizar("nombre", e.target.value)} placeholder="Martín Pereyra o Empresa SRL" autoComplete="off" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cli-documento">DNI / CUIT</Label>
                <Input id="cli-documento" name="documento" value={formulario.documento} onChange={(e) => actualizar("documento", e.target.value)} placeholder="34.567.890" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cli-tipo">Tipo de cliente</Label>
                <Select value={formulario.tipo} onValueChange={(valor) => actualizar("tipo", valor as TipoCliente)}>
                  <SelectTrigger id="cli-tipo" name="tipo"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_CLIENTE.map((tipo) => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cli-telefono">Teléfono</Label>
                <Input id="cli-telefono" name="telefono" type="tel" inputMode="tel" value={formulario.telefono} onChange={(e) => actualizar("telefono", e.target.value)} placeholder="11 1234 5678" autoComplete="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cli-email">Email</Label>
                <Input id="cli-email" name="email" type="email" value={formulario.email} onChange={(e) => actualizar("email", e.target.value)} placeholder="cliente@email.com" autoComplete="email" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-direccion">Dirección</Label>
                <Input id="cli-direccion" name="direccion" value={formulario.direccion} onChange={(e) => actualizar("direccion", e.target.value)} placeholder="Calle, número, localidad" autoComplete="off" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-notas">Notas</Label>
                <Textarea id="cli-notas" name="notas" rows={3} value={formulario.notas} onChange={(e) => actualizar("notas", e.target.value)} placeholder="Preferencias de contacto, datos relevantes…" />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to={cliente ? `/clientes/${cliente.id}` : "/clientes"}>Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {cliente ? "Guardar cambios" : "Crear cliente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
