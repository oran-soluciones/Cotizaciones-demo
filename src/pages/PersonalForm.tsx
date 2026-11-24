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
import type { TipoComision } from "@/lib/types"

type Formulario = {
  nombre: string
  apellido: string
  rol: string
  telefono: string
  email: string
  tipoComision: TipoComision
  valorComision: string
  activo: boolean
  esTitular: boolean
  notas: string
}

const formularioVacio: Formulario = {
  nombre: "",
  apellido: "",
  rol: "Mecánico",
  telefono: "",
  email: "",
  tipoComision: "porcentaje",
  valorComision: "25",
  activo: true,
  esTitular: false,
  notas: "",
}

export default function PersonalForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { personal, agregarPersonal, actualizarPersonal } = useDatos()
  const persona = personal.find((item) => item.id === id)
  const [formulario, setFormulario] = useState<Formulario>(() =>
    persona
      ? {
          nombre: persona.nombre,
          apellido: persona.apellido,
          rol: persona.rol,
          telefono: persona.telefono,
          email: persona.email,
          tipoComision: persona.tipoComision,
          valorComision: String(persona.valorComision),
          activo: persona.activo,
          esTitular: persona.esTitular,
          notas: persona.notas,
        }
      : formularioVacio,
  )

  useEffect(() => {
    if (id && !persona) {
      toast.error("No se encontró el integrante")
      navegar("/personal", { replace: true })
    }
  }, [id, persona, navegar])

  function actualizar(campo: keyof Formulario, valor: string | boolean) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!formulario.nombre.trim()) {
      toast.error("Ingresá al menos el nombre")
      return
    }
    const datos = {
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      rol: formulario.rol.trim(),
      telefono: formulario.telefono.trim(),
      email: formulario.email.trim(),
      tipoComision: formulario.tipoComision,
      valorComision: Number(formulario.valorComision) || 0,
      activo: formulario.activo,
      esTitular: formulario.esTitular,
      notas: formulario.notas.trim(),
    }

    if (persona) {
      actualizarPersonal(persona.id, datos)
      toast.success("Personal actualizado")
      navegar(`/personal/${persona.id}`)
    } else {
      const nuevoId = agregarPersonal(datos)
      toast.success("Integrante agregado")
      navegar(`/personal/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={persona ? `/personal/${persona.id}` : "/personal"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{persona ? "Editar integrante" : "Agregar personal"}</CardTitle>
          <CardDescription>
            Configurá cómo se calcula su comisión por defecto al asignarlo a cotizaciones o servicios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="per-nombre">Nombre</Label>
                <Input id="per-nombre" name="nombre" value={formulario.nombre} onChange={(e) => actualizar("nombre", e.target.value)} placeholder="Ricardo" autoComplete="off" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="per-apellido">Apellido</Label>
                <Input id="per-apellido" name="apellido" value={formulario.apellido} onChange={(e) => actualizar("apellido", e.target.value)} placeholder="Álvarez" autoComplete="off" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="per-rol">Rol</Label>
                <Input id="per-rol" name="rol" value={formulario.rol} onChange={(e) => actualizar("rol", e.target.value)} placeholder="Mecánico, Titular, Administración…" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="per-telefono">Teléfono</Label>
                <Input id="per-telefono" name="telefono" type="tel" inputMode="tel" value={formulario.telefono} onChange={(e) => actualizar("telefono", e.target.value)} placeholder="11 1234 5678" autoComplete="tel" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="per-email">Email</Label>
                <Input id="per-email" name="email" type="email" value={formulario.email} onChange={(e) => actualizar("email", e.target.value)} placeholder="nombre@taller.com.ar" autoComplete="email" />
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-medium">Comisión por defecto</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="per-tipo-comision">Tipo</Label>
                  <Select value={formulario.tipoComision} onValueChange={(valor) => actualizar("tipoComision", valor as TipoComision)}>
                    <SelectTrigger id="per-tipo-comision" name="tipoComision"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">Porcentaje del total</SelectItem>
                      <SelectItem value="fijo">Monto fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="per-valor-comision">
                    {formulario.tipoComision === "porcentaje" ? "Porcentaje (%)" : "Monto ($)"}
                  </Label>
                  <Input
                    id="per-valor-comision" name="valorComision" type="number" min={0} inputMode="numeric"
                    className="tabular" value={formulario.valorComision}
                    onChange={(e) => actualizar("valorComision", e.target.value)}
                  />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Al asignar una comisión se puede usar este valor o cambiarlo para ese trabajo puntual.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Checkbox id="per-activo" checked={formulario.activo} onCheckedChange={(valor) => actualizar("activo", valor === true)} />
                <Label htmlFor="per-activo" className="cursor-pointer">Integrante activo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="per-titular" checked={formulario.esTitular} onCheckedChange={(valor) => actualizar("esTitular", valor === true)} />
                <Label htmlFor="per-titular" className="cursor-pointer">Es el titular del taller (yo)</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="per-notas">Notas</Label>
              <Textarea id="per-notas" name="notas" rows={3} value={formulario.notas} onChange={(e) => actualizar("notas", e.target.value)} placeholder="Especialidades, horarios, observaciones…" />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to={persona ? `/personal/${persona.id}` : "/personal"}>Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {persona ? "Guardar cambios" : "Agregar integrante"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
