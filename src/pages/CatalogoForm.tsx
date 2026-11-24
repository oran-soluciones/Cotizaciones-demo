import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDatos } from "@/lib/store"
import { CATEGORIAS_CATALOGO } from "@/lib/types"

type Formulario = {
  nombre: string
  descripcion: string
  categoria: string
  precio: string
  activo: boolean
}

const formularioVacio: Formulario = {
  nombre: "",
  descripcion: "",
  categoria: "Mantenimiento",
  precio: "0",
  activo: true,
}

export default function CatalogoForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { catalogo, agregarServicioCatalogo, actualizarServicioCatalogo } = useDatos()
  const servicio = catalogo.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    servicio
      ? {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          categoria: servicio.categoria,
          precio: String(servicio.precio),
          activo: servicio.activo,
        }
      : formularioVacio,
  )

  useEffect(() => {
    if (id && !servicio) {
      toast.error("No se encontró el servicio del catálogo")
      navegar("/catalogo", { replace: true })
    }
  }, [id, servicio, navegar])

  function actualizar(campo: keyof Formulario, valor: string | boolean) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!formulario.nombre.trim()) {
      toast.error("Ingresá el nombre del servicio")
      return
    }
    const datos = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      categoria: formulario.categoria,
      precio: Number(formulario.precio) || 0,
      activo: formulario.activo,
    }

    if (servicio) {
      actualizarServicioCatalogo(servicio.id, datos)
      toast.success("Servicio actualizado")
      navegar("/catalogo")
    } else {
      agregarServicioCatalogo(datos)
      toast.success("Servicio agregado al catálogo")
      navegar("/catalogo")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/catalogo">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al catálogo
        </Link>
      </Button>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{servicio ? "Editar servicio" : "Nuevo servicio del catálogo"}</CardTitle>
          <CardDescription>
            Definí nombre, categoría y precio sugerido. Después podés usarlo al armar cotizaciones y servicios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="cat-nombre">Nombre</Label>
              <Input
                id="cat-nombre" name="nombre" value={formulario.nombre}
                onChange={(evento) => actualizar("nombre", evento.target.value)}
                placeholder="Ej.: Tren delantero: alineación y balanceo" autoComplete="off" required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-descripcion">Descripción</Label>
              <Textarea
                id="cat-descripcion" name="descripcion" rows={3} value={formulario.descripcion}
                onChange={(evento) => actualizar("descripcion", evento.target.value)}
                placeholder="Qué incluye el servicio, duración, observaciones…"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-categoria">Categoría</Label>
                <Select value={formulario.categoria} onValueChange={(valor) => actualizar("categoria", valor)}>
                  <SelectTrigger id="cat-categoria" name="categoria"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_CATALOGO.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-precio">Precio sugerido ($)</Label>
                <Input
                  id="cat-precio" name="precio" type="number" min={0} inputMode="numeric"
                  className="tabular" value={formulario.precio}
                  onChange={(evento) => actualizar("precio", evento.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border p-4">
              <Checkbox
                id="cat-activo" checked={formulario.activo}
                onCheckedChange={(valor) => actualizar("activo", valor === true)}
              />
              <Label htmlFor="cat-activo" className="cursor-pointer">Servicio activo</Label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to="/catalogo">Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {servicio ? "Guardar cambios" : "Agregar al catálogo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
