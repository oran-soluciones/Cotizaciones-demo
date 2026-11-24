import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import { formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { Vehiculo } from "@/lib/types"

export default function Vehiculos() {
  const { vehiculos, clientes, eliminarVehiculo } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [clienteId, setClienteId] = useState("todos")
  const [vehiculoEliminar, setVehiculoEliminar] = useState<Vehiculo | null>(null)

  const nombreCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nombre ?? "—"

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return vehiculos.filter((vehiculo) => {
      const coincideTexto =
        !texto ||
        vehiculo.patente.toLocaleLowerCase("es-AR").includes(texto) ||
        vehiculo.marca.toLocaleLowerCase("es-AR").includes(texto) ||
        vehiculo.modelo.toLocaleLowerCase("es-AR").includes(texto) ||
        nombreCliente(vehiculo.clienteId).toLocaleLowerCase("es-AR").includes(texto)
      return coincideTexto && (clienteId === "todos" || vehiculo.clienteId === clienteId)
    })
  }, [vehiculos, clientes, busqueda, clienteId])

  function eliminar() {
    if (!vehiculoEliminar) return
    if (!eliminarVehiculo(vehiculoEliminar.id)) {
      toast.error("No se puede eliminar: el vehículo tiene cotizaciones o servicios asociados")
    } else {
      toast.success("Vehículo eliminado")
    }
    setVehiculoEliminar(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Vehículos"
        descripcion="Patentes, modelos, kilometraje y combustible de cada vehículo"
        acciones={
          <Button onClick={() => navegar("/vehiculos/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo vehículo
          </Button>
        }
      />

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-vehiculo">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-vehiculo" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Patente, marca, modelo o cliente…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-64">
            <Label htmlFor="filtro-cliente-vehiculo">Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="filtro-cliente-vehiculo" name="cliente"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Kilometraje</TableHead>
                <TableHead>Combustible</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron vehículos con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((vehiculo) => (
                  <TableRow
                    key={vehiculo.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Ver detalle del vehículo ${vehiculo.patente}`}
                    onClick={() => navegar(`/vehiculos/${vehiculo.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/vehiculos/${vehiculo.id}`)
                      }
                    }}
                  >
                    <TableCell className="tabular whitespace-nowrap text-sm font-semibold">{vehiculo.patente}</TableCell>
                    <TableCell>
                      <p className="truncate text-sm">{vehiculo.marca} {vehiculo.modelo}</p>
                      <p className="tabular truncate text-[11px] text-muted-foreground">{vehiculo.anio} · {vehiculo.color || "Sin color"}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{nombreCliente(vehiculo.clienteId)}</TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm">{formatearNumero(vehiculo.kilometraje)} km</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{vehiculo.combustible || "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de ${vehiculo.patente}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/vehiculos/${vehiculo.id}`)}>
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navegar(`/vehiculos/${vehiculo.id}/editar`)}>
                            <Pencil className="size-4" aria-hidden="true" /> Editar vehículo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setVehiculoEliminar(vehiculo)}>
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
          Mostrando {filtrados.length} de {vehiculos.length} vehículos
        </div>
      </Card>

      <Dialog open={vehiculoEliminar !== null} onOpenChange={(valor) => { if (!valor) setVehiculoEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar vehículo</DialogTitle>
            <DialogDescription>
              Se va a eliminar el vehículo <span className="tabular font-medium text-foreground">{vehiculoEliminar?.patente}</span>. Solo se permite si no tiene cotizaciones ni servicios asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehiculoEliminar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
