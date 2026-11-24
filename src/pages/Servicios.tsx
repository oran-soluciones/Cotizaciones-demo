import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2, CircleDollarSign, Clock3, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { EncabezadoPagina } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
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
import { totalPresupuesto } from "@/lib/calculos"
import { formatearFecha, formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type Servicio } from "@/lib/types"

export default function Servicios() {
  const { servicios, clientes, vehiculos, eliminarServicio } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoServicio | "todos">("todos")
  const [servicioEliminar, setServicioEliminar] = useState<Servicio | null>(null)

  const nombreCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nombre ?? "—"
  const patente = (id: string) => vehiculos.find((vehiculo) => vehiculo.id === id)?.patente ?? "—"

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return servicios.filter((servicio) => {
      const coincideTexto =
        !texto ||
        servicio.numero.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.titulo.toLocaleLowerCase("es-AR").includes(texto) ||
        nombreCliente(servicio.clienteId).toLocaleLowerCase("es-AR").includes(texto) ||
        patente(servicio.vehiculoId).toLocaleLowerCase("es-AR").includes(texto)
      return coincideTexto && (estado === "todos" || servicio.estado === estado)
    })
  }, [servicios, clientes, vehiculos, busqueda, estado])

  const activos = servicios.filter((servicio) => servicio.estado === "Pendiente" || servicio.estado === "En curso")
  const enCurso = servicios.filter((servicio) => servicio.estado === "En curso")
  const entregados = servicios.filter((servicio) => servicio.estado === "Entregado")
  const facturado = entregados.reduce(
    (total, servicio) => total + totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento), 0,
  )

  function eliminar() {
    if (!servicioEliminar) return
    if (!eliminarServicio(servicioEliminar.id)) {
      toast.error("No se puede eliminar: el servicio tiene comisiones asignadas")
    } else {
      toast.success("Servicio eliminado")
    }
    setServicioEliminar(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Servicios"
        descripcion="Trabajos en el taller con vehículo, kilometraje y comisiones"
        acciones={
          <Button onClick={() => navegar("/servicios/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo servicio
          </Button>
        }
      />

      <section aria-label="Resumen de servicios" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Servicios activos", valor: formatearNumero(activos.length), detalle: "Pendientes o en curso", icono: <Wrench className="size-[18px]" /> },
          { titulo: "En curso", valor: formatearNumero(enCurso.length), detalle: "Trabajándose ahora", icono: <Clock3 className="size-[18px]" /> },
          { titulo: "Entregados", valor: formatearNumero(entregados.length), detalle: "Trabajos finalizados", icono: <CheckCircle2 className="size-[18px]" /> },
          { titulo: "Facturado", valor: formatearMoneda(facturado), detalle: "Total de servicios entregados", icono: <CircleDollarSign className="size-[18px]" /> },
        ].map((metrica) => (
          <Card key={metrica.titulo} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <p className="text-xs font-medium text-muted-foreground">{metrica.titulo}</p>
            <p className="tabular mt-1.5 text-xl font-semibold tracking-tight">{metrica.valor}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metrica.detalle}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-servicio">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-servicio" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Número, trabajo, cliente o patente…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label htmlFor="filtro-estado-servicio">Estado</Label>
            <Select value={estado} onValueChange={(valor) => setEstado(valor as EstadoServicio | "todos")}>
              <SelectTrigger id="filtro-estado-servicio" name="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS_SERVICIO.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente / Vehículo</TableHead>
                <TableHead>Trabajo</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Entrega estimada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron servicios con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((servicio) => (
                  <TableRow
                    key={servicio.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Ver detalle del servicio ${servicio.numero}`}
                    onClick={() => navegar(`/servicios/${servicio.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/servicios/${servicio.id}`)
                      }
                    }}
                  >
                    <TableCell className="tabular whitespace-nowrap text-xs font-medium text-muted-foreground">{servicio.numero}</TableCell>
                    <TableCell className="max-w-[190px]">
                      <p className="truncate text-sm font-semibold">{nombreCliente(servicio.clienteId)}</p>
                      <p className="tabular truncate text-[11px] text-muted-foreground">{patente(servicio.vehiculoId)} · {formatearNumero(servicio.kilometraje)} km</p>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{servicio.titulo}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatearFecha(servicio.ingresoEn)}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatearFecha(servicio.entregaEstimadaEn)}</TableCell>
                    <TableCell><EstadoServicioBadge estado={servicio.estado} /></TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">
                      {formatearMoneda(totalPresupuesto(servicio.items, servicio.manoDeObra, servicio.descuento))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de ${servicio.numero}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/servicios/${servicio.id}`)}>
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navegar(`/servicios/${servicio.id}/editar`)}>
                            <Pencil className="size-4" aria-hidden="true" /> Editar servicio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setServicioEliminar(servicio)}>
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
          Mostrando {filtrados.length} de {servicios.length} servicios
        </div>
      </Card>

      <Dialog open={servicioEliminar !== null} onOpenChange={(valor) => { if (!valor) setServicioEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar servicio</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="tabular font-medium text-foreground">{servicioEliminar?.numero}</span>. No se permite si tiene comisiones asignadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServicioEliminar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
