import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { Seccion } from "@/components/comunes/Seccion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { montoComision, totalPresupuesto } from "@/lib/calculos"
import { formatearMoneda } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { EstadoComision, OrigenComision, TipoComision } from "@/lib/types"

type Formulario = {
  personalId: string
  origenTipo: OrigenComision
  origenId: string
  tipo: TipoComision
  valor: string
  base: string
  estado: EstadoComision
}

export default function ComisionForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const {
    comisiones, personal, cotizaciones, servicios,
    agregarComision, actualizarComision,
  } = useDatos()
  const comision = comisiones.find((item) => item.id === id)

  const origenInicial = (parametros.get("origen") === "cotizacion" ? "cotizacion" : "servicio") as OrigenComision
  const origenIdInicial = parametros.get("origenId") ?? ""

  const [formulario, setFormulario] = useState<Formulario>(() =>
    comision
      ? {
          personalId: comision.personalId,
          origenTipo: comision.origenTipo,
          origenId: comision.origenId,
          tipo: comision.tipo,
          valor: String(comision.valor),
          base: String(comision.base),
          estado: comision.estado,
        }
      : {
          personalId: personal.find((persona) => persona.esTitular)?.id ?? personal[0]?.id ?? "",
          origenTipo: origenInicial,
          origenId: origenIdInicial,
          tipo: personal.find((persona) => persona.esTitular)?.tipoComision ?? "porcentaje",
          valor: String(personal.find((persona) => persona.esTitular)?.valorComision ?? 25),
          base: "0",
          estado: "Pendiente",
        },
  )

  useEffect(() => {
    if (id && !comision) {
      toast.error("No se encontró la comisión")
      navegar("/comisiones", { replace: true })
    }
  }, [id, comision, navegar])

  const origenes = useMemo(
    () => (formulario.origenTipo === "cotizacion" ? cotizaciones : servicios),
    [formulario.origenTipo, cotizaciones, servicios],
  )

  function totalOrigen(origenId: string): number {
    if (formulario.origenTipo === "cotizacion") {
      const cotizacion = cotizaciones.find((item) => item.id === origenId)
      return cotizacion ? totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento) : 0
    }
    const servicio = servicios.find((item) => item.id === origenId)
    return servicio ? totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento) : 0
  }

  useEffect(() => {
    if (!comision && formulario.origenId) {
      const total = totalOrigen(formulario.origenId)
      setFormulario((anterior) => (anterior.base === String(total) ? anterior : { ...anterior, base: String(total) }))
    }
  }, [formulario.origenId, formulario.origenTipo]) // eslint-disable-line react-hooks/exhaustive-deps

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function cambiarPersona(personaId: string) {
    const persona = personal.find((item) => item.id === personaId)
    if (!persona || comision) {
      actualizar("personalId", personaId)
      return
    }
    setFormulario((anterior) => ({
      ...anterior,
      personalId: personaId,
      tipo: persona.tipoComision,
      valor: String(persona.valorComision),
    }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!formulario.personalId || !formulario.origenId) {
      toast.error("Seleccioná el personal y el origen de la comisión")
      return
    }
    const origen = origenes.find((item) => item.id === formulario.origenId)
    if (!origen) {
      toast.error("El origen seleccionado ya no existe")
      return
    }

    const datos = {
      personalId: formulario.personalId,
      origenTipo: formulario.origenTipo,
      origenId: formulario.origenId,
      origenNumero: origen.numero,
      tipo: formulario.tipo,
      valor: Number(formulario.valor) || 0,
      base: Number(formulario.base) || 0,
      estado: formulario.estado,
    }

    if (comision) {
      actualizarComision(comision.id, datos)
      toast.success("Comisión actualizada")
      navegar(`/comisiones/${comision.id}`)
    } else {
      const nuevoId = agregarComision(datos)
      toast.success("Comisión asignada")
      navegar(`/comisiones/${nuevoId}`)
    }
  }

  const montoEstimado = montoComision({
    tipo: formulario.tipo,
    valor: Number(formulario.valor) || 0,
    base: Number(formulario.base) || 0,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={comision ? `/comisiones/${comision.id}` : "/comisiones"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {comision ? "Editar comisión" : "Asignar comisión"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Asigná a una persona un porcentaje o monto fijo sobre una cotización o servicio.
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-4" noValidate>
        <Seccion titulo="Personal y origen">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="com-persona">Persona</Label>
              <Select value={formulario.personalId} onValueChange={cambiarPersona}>
                <SelectTrigger id="com-persona" name="personalId"><SelectValue placeholder="Elegir personal" /></SelectTrigger>
                <SelectContent>
                  {personal.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.nombre} {persona.apellido} · {persona.rol}{!persona.activo ? " (inactivo)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="com-origen-tipo">Tipo de origen</Label>
              <Select
                value={formulario.origenTipo}
                disabled={Boolean(comision)}
                onValueChange={(valor) => {
                  setFormulario((anterior) => ({ ...anterior, origenTipo: valor as OrigenComision, origenId: "", base: "0" }))
                }}
              >
                <SelectTrigger id="com-origen-tipo" name="origenTipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicio">Servicio</SelectItem>
                  <SelectItem value="cotizacion">Cotización</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="com-origen">
                {formulario.origenTipo === "servicio" ? "Servicio" : "Cotización"}
              </Label>
              <Select value={formulario.origenId} onValueChange={(valor) => actualizar("origenId", valor)} disabled={Boolean(comision)}>
                <SelectTrigger id="com-origen" name="origenId"><SelectValue placeholder="Elegir origen" /></SelectTrigger>
                <SelectContent>
                  {origenes.map((origen) => (
                    <SelectItem key={origen.id} value={origen.id}>{origen.numero} · {origen.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="Cálculo de la comisión">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="com-tipo">Modalidad</Label>
              <Select value={formulario.tipo} onValueChange={(valor) => actualizar("tipo", valor as TipoComision)}>
                <SelectTrigger id="com-tipo" name="tipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentaje">Porcentaje del total</SelectItem>
                  <SelectItem value="fijo">Monto fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="com-valor">
                {formulario.tipo === "porcentaje" ? "Porcentaje (%)" : "Monto ($)"}
              </Label>
              <Input
                id="com-valor" name="valor" type="number" min={0} inputMode="numeric"
                className="tabular" value={formulario.valor}
                onChange={(e) => actualizar("valor", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="com-base">Base de cálculo ($)</Label>
              <Input
                id="com-base" name="base" type="number" min={0} inputMode="numeric"
                className="tabular" value={formulario.base}
                onChange={(e) => actualizar("base", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Se completa con el total del origen elegido al momento de asignar.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <span className="text-sm font-medium">Monto de la comisión</span>
            <span className="tabular text-lg font-semibold">{formatearMoneda(montoEstimado)}</span>
          </div>
        </Seccion>

        {comision && (
          <Seccion titulo="Estado de pago">
            <div className="space-y-1.5">
              <Label htmlFor="com-estado">Estado</Label>
              <Select value={formulario.estado} onValueChange={(valor) => actualizar("estado", valor as EstadoComision)}>
                <SelectTrigger id="com-estado" name="estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Pagada">Pagada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Seccion>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to={comision ? `/comisiones/${comision.id}` : "/comisiones"}>Cancelar</Link>
          </Button>
          <Button type="submit">
            <Save className="size-4" aria-hidden="true" />
            {comision ? "Guardar cambios" : "Asignar comisión"}
          </Button>
        </div>
      </form>
    </div>
  )
}
