import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, CircleDollarSign, Clock3, Eye, FileText, MoreHorizontal, Pencil, Plus, Search, Send, Trash2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { EstadoCotizacionBadge } from "@/components/comunes/Indicadores"
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
import { formatearFecha, formatearMoneda, formatearNumero, textoVencimiento } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_COTIZACION, type Cotizacion, type EstadoCotizacion } from "@/lib/types"

export default function Cotizaciones() {
  const { cotizaciones, clientes, vehiculos, eliminarCotizacion } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoCotizacion | "todos">("todos")
  const [cotizacionEliminar, setCotizacionEliminar] = useState<Cotizacion | null>(null)

  const nombreCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nombre ?? "—"
  const patente = (id: string) => vehiculos.find((vehiculo) => vehiculo.id === id)?.patente ?? "—"

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return cotizaciones.filter((cotizacion) => {
      const coincideTexto =
        !texto ||
        cotizacion.numero.toLocaleLowerCase("es-AR").includes(texto) ||
        cotizacion.titulo.toLocaleLowerCase("es-AR").includes(texto) ||
        nombreCliente(cotizacion.clienteId).toLocaleLowerCase("es-AR").includes(texto) ||
        patente(cotizacion.vehiculoId).toLocaleLowerCase("es-AR").includes(texto)
      return coincideTexto && (estado === "todos" || cotizacion.estado === estado)
    })
  }, [cotizaciones, clientes, vehiculos, busqueda, estado])

  const totalCotizado = cotizaciones.reduce(
    (total, cotizacion) => total + totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento), 0,
  )
  const aceptadas = cotizaciones.filter((cotizacion) => cotizacion.estado === "Aceptada")
  const pendientes = cotizaciones.filter((cotizacion) => cotizacion.estado === "Enviada" || cotizacion.estado === "Borrador")
  const vencidas = cotizaciones.filter((cotizacion) => cotizacion.estado === "Vencida")

  function eliminar() {
    if (!cotizacionEliminar) return
    if (!eliminarCotizacion(cotizacionEliminar.id)) {
      toast.error("No se puede eliminar: tiene un servicio o comisiones asociadas")
    } else {
      toast.success("Cotización eliminada")
    }
    setCotizacionEliminar(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Cotizaciones"
        descripcion="Presupuestos de servicios para clientes y vehículos"
        acciones={
          <Button onClick={() => navegar("/cotizaciones/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Nueva cotización
          </Button>
        }
      />

      <section aria-label="Resumen de cotizaciones" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Total cotizado", valor: formatearMoneda(totalCotizado), detalle: `${formatearNumero(cotizaciones.length)} presupuestos`, icono: <CircleDollarSign className="size-[18px]" /> },
          { titulo: "Aceptadas", valor: formatearNumero(aceptadas.length), detalle: "Listas para ejecutar", icono: <CheckCircle2 className="size-[18px]" /> },
          { titulo: "Pendientes", valor: formatearNumero(pendientes.length), detalle: "Enviadas o en borrador", icono: <Send className="size-[18px]" /> },
          { titulo: "Vencidas", valor: formatearNumero(vencidas.length), detalle: "Requieren seguimiento", icono: <TriangleAlert className="size-[18px]" /> },
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
            <Label htmlFor="buscar-cotizacion">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-cotizacion" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Número, título, cliente o patente…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label htmlFor="filtro-estado-cotizacion">Estado</Label>
            <Select value={estado} onValueChange={(valor) => setEstado(valor as EstadoCotizacion | "todos")}>
              <SelectTrigger id="filtro-estado-cotizacion" name="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS_COTIZACION.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
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
                <TableHead>Fecha</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron cotizaciones con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((cotizacion) => (
                  <TableRow
                    key={cotizacion.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Ver detalle de la cotización ${cotizacion.numero}`}
                    onClick={() => navegar(`/cotizaciones/${cotizacion.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/cotizaciones/${cotizacion.id}`)
                      }
                    }}
                  >
                    <TableCell className="tabular whitespace-nowrap text-xs font-medium text-muted-foreground">{cotizacion.numero}</TableCell>
                    <TableCell className="max-w-[190px]">
                      <p className="truncate text-sm font-semibold">{nombreCliente(cotizacion.clienteId)}</p>
                      <p className="tabular truncate text-[11px] text-muted-foreground">{patente(cotizacion.vehiculoId)}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{cotizacion.titulo}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatearFecha(cotizacion.fecha)}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{textoVencimiento(cotizacion.vigenteHasta)}</TableCell>
                    <TableCell><EstadoCotizacionBadge estado={cotizacion.estado} /></TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">
                      {formatearMoneda(totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de ${cotizacion.numero}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/cotizaciones/${cotizacion.id}`)}>
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navegar(`/cotizaciones/${cotizacion.id}/editar`)}>
                            <Pencil className="size-4" aria-hidden="true" /> Editar cotización
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setCotizacionEliminar(cotizacion)}>
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
          Mostrando {filtrados.length} de {cotizaciones.length} cotizaciones
        </div>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <FileText className="size-3.5" aria-hidden="true" />
        <Clock3 className="size-3.5" aria-hidden="true" />
        Los cambios se guardan automáticamente en el almacenamiento local del navegador.
      </p>

      <Dialog open={cotizacionEliminar !== null} onOpenChange={(valor) => { if (!valor) setCotizacionEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar cotización</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="tabular font-medium text-foreground">{cotizacionEliminar?.numero}</span>. No se permite si ya generó un servicio o tiene comisiones asignadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCotizacionEliminar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
