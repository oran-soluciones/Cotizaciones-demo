import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, CircleDollarSign, Clock3, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { EstadoComisionBadge } from "@/components/comunes/Indicadores"
import { EncabezadoPagina } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { EstadoComision, OrigenComision } from "@/lib/types"

export default function Comisiones() {
  const {
    comisiones, personal, cotizaciones, servicios,
    cambiarEstadoComision, eliminarComision,
  } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [personaId, setPersonaId] = useState("todos")
  const [estado, setEstado] = useState<EstadoComision | "todos">("todos")
  const [origenTipo, setOrigenTipo] = useState<OrigenComision | "todos">("todos")

  const etiquetaOrigen = (tipo: OrigenComision, origenId: string, numero: string) => {
    if (tipo === "cotizacion") {
      return cotizaciones.find((item) => item.id === origenId)?.titulo ?? numero
    }
    return servicios.find((item) => item.id === origenId)?.titulo ?? numero
  }

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return comisiones.filter((comision) => {
      const nombre = `${comision.personalNombre} ${comision.origenNumero} ${etiquetaOrigen(comision.origenTipo, comision.origenId, comision.origenNumero)}`.toLocaleLowerCase("es-AR")
      const coincideTexto = !texto || nombre.includes(texto)
      return (
        coincideTexto &&
        (personaId === "todos" || comision.personalId === personaId) &&
        (estado === "todos" || comision.estado === estado) &&
        (origenTipo === "todos" || comision.origenTipo === origenTipo)
      )
    })
  }, [comisiones, personal, cotizaciones, servicios, busqueda, personaId, estado, origenTipo])

  const total = comisiones.reduce((suma, comision) => suma + comision.monto, 0)
  const pagado = comisiones.filter((comision) => comision.estado === "Pagada").reduce((suma, comision) => suma + comision.monto, 0)
  const pendiente = total - pagado

  function alternarPago(id: string, estadoActual: EstadoComision) {
    const nuevoEstado: EstadoComision = estadoActual === "Pagada" ? "Pendiente" : "Pagada"
    cambiarEstadoComision(id, nuevoEstado)
    toast.success(nuevoEstado === "Pagada" ? "Comisión marcada como pagada" : "Comisión marcada como pendiente")
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Comisiones"
        descripcion="Asignaciones de personal sobre cotizaciones y servicios"
        acciones={
          <Button onClick={() => navegar("/comisiones/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Asignar comisión
          </Button>
        }
      />

      <section aria-label="Resumen de comisiones" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Total asignado", valor: formatearMoneda(total), detalle: `${formatearNumero(comisiones.length)} asignaciones`, icono: <CircleDollarSign className="size-[18px]" /> },
          { titulo: "Pendiente de pago", valor: formatearMoneda(pendiente), detalle: "Comisiones a pagar", icono: <Clock3 className="size-[18px]" /> },
          { titulo: "Pagado", valor: formatearMoneda(pagado), detalle: "Ya abonadas", icono: <Check className="size-[18px]" /> },
          { titulo: "Personal", valor: formatearNumero(personal.length), detalle: "Integrantes del taller", icono: <CircleDollarSign className="size-[18px]" /> },
        ].map((metrica) => (
          <Card key={metrica.titulo} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <p className="text-xs font-medium text-muted-foreground">{metrica.titulo}</p>
            <p className="tabular mt-1.5 text-xl font-semibold tracking-tight">{metrica.valor}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metrica.detalle}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-comision">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-comision" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Persona, número u origen…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 lg:w-48">
            <Label htmlFor="filtro-persona-comision">Persona</Label>
            <Select value={personaId} onValueChange={setPersonaId}>
              <SelectTrigger id="filtro-persona-comision" name="persona"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {personal.map((persona) => <SelectItem key={persona.id} value={persona.id}>{persona.nombre} {persona.apellido}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1.5 lg:w-40">
            <Label htmlFor="filtro-estado-comision">Estado</Label>
            <Select value={estado} onValueChange={(valor) => setEstado(valor as EstadoComision | "todos")}>
              <SelectTrigger id="filtro-estado-comision" name="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1.5 lg:w-40">
            <Label htmlFor="filtro-origen-comision">Origen</Label>
            <Select value={origenTipo} onValueChange={(valor) => setOrigenTipo(valor as OrigenComision | "todos")}>
              <SelectTrigger id="filtro-origen-comision" name="origen"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="servicio">Servicio</SelectItem>
                <SelectItem value="cotizacion">Cotización</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personal</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                    No hay comisiones con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((comision) => (
                  <TableRow
                    key={comision.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Ver detalle de la comisión de ${comision.personalNombre}`}
                    onClick={() => navegar(`/comisiones/${comision.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/comisiones/${comision.id}`)
                      }
                    }}
                  >
                    <TableCell className="whitespace-nowrap text-sm font-semibold">{comision.personalNombre}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="tabular truncate text-[11px] text-muted-foreground">{comision.origenNumero}</p>
                      <p className="truncate text-sm">{etiquetaOrigen(comision.origenTipo, comision.origenId, comision.origenNumero)}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {comision.tipo === "porcentaje" ? `${comision.valor} % del total` : "Monto fijo"}
                    </TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-xs text-muted-foreground">{formatearMoneda(comision.base)}</TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">{formatearMoneda(comision.monto)}</TableCell>
                    <TableCell><EstadoComisionBadge estado={comision.estado} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatearFecha(comision.creadoEn)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de la comisión de ${comision.personalNombre}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/comisiones/${comision.id}`)}>
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => alternarPago(comision.id, comision.estado)}>
                            {comision.estado === "Pagada"
                              ? <Undo2 className="size-4" aria-hidden="true" />
                              : <Check className="size-4" aria-hidden="true" />}
                            {comision.estado === "Pagada" ? "Marcar pendiente" : "Marcar pagada"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navegar(`/comisiones/${comision.id}/editar`)}>
                            <Pencil className="size-4" aria-hidden="true" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              eliminarComision(comision.id)
                              toast.success("Comisión eliminada")
                            }}
                          >
                            <Trash2 className="size-4" aria-hidden="true" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Mostrando {filtrados.length} de {comisiones.length} comisiones
        </div>
      </Card>
    </div>
  )
}
