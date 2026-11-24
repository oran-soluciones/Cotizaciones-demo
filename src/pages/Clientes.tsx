import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, CarFront, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, UserRound, Users } from "lucide-react"
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
import { formatearFecha, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { TIPOS_CLIENTE, type Cliente, type TipoCliente } from "@/lib/types"

export default function Clientes() {
  const { clientes, vehiculos, eliminarCliente } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [tipo, setTipo] = useState<TipoCliente | "todos">("todos")
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return clientes.filter((cliente) => {
      const coincideTexto =
        !texto ||
        cliente.nombre.toLocaleLowerCase("es-AR").includes(texto) ||
        cliente.documento.toLocaleLowerCase("es-AR").includes(texto) ||
        cliente.telefono.toLocaleLowerCase("es-AR").includes(texto) ||
        cliente.email.toLocaleLowerCase("es-AR").includes(texto)
      return coincideTexto && (tipo === "todos" || cliente.tipo === tipo)
    })
  }, [clientes, busqueda, tipo])

  const particulares = clientes.filter((cliente) => cliente.tipo === "Particular").length
  const empresas = clientes.filter((cliente) => cliente.tipo === "Empresa").length

  function eliminar() {
    if (!clienteEliminar) return
    if (!eliminarCliente(clienteEliminar.id)) {
      toast.error("No se puede eliminar: el cliente tiene vehículos, cotizaciones o servicios asociados")
    } else {
      toast.success("Cliente eliminado")
    }
    setClienteEliminar(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Datos de contacto, vehículos asociados yeraldos históricos de presupuestos"
        acciones={
          <Button onClick={() => navegar("/clientes/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo cliente
          </Button>
        }
      />

      <section aria-label="Resumen de clientes" className="grid gap-3 sm:grid-cols-3">
        {[
          { titulo: "Total de clientes", valor: formatearNumero(clientes.length), detalle: "Registrados en el taller", icono: <Users className="size-[18px]" /> },
          { titulo: "Particulares", valor: formatearNumero(particulares), detalle: "Personas físicas", icono: <UserRound className="size-[18px]" /> },
          { titulo: "Empresas", valor: formatearNumero(empresas), detalle: "Flotas y cuentas corporativas", icono: <Building2 className="size-[18px]" /> },
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
            <Label htmlFor="buscar-cliente">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-cliente" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Nombre, DNI/CUIT, teléfono o email…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label htmlFor="filtro-tipo-cliente">Tipo</Label>
            <Select value={tipo} onValueChange={(valor) => setTipo(valor as TipoCliente | "todos")}>
              <SelectTrigger id="filtro-tipo-cliente" name="tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {TIPOS_CLIENTE.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Vehículos</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron clientes con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((cliente) => {
                  const cantidadVehiculos = vehiculos.filter((vehiculo) => vehiculo.clienteId === cliente.id).length
                  return (
                    <TableRow
                      key={cliente.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      aria-label={`Ver detalle de ${cliente.nombre}`}
                      onClick={() => navegar(`/clientes/${cliente.id}`)}
                      onKeyDown={(evento) => {
                        if (evento.key === "Enter" || evento.key === " ") {
                          evento.preventDefault()
                          navegar(`/clientes/${cliente.id}`)
                        }
                      }}
                    >
                      <TableCell className="max-w-[220px]">
                        <p className="truncate text-sm font-semibold">{cliente.nombre}</p>
                        <p className="tabular truncate text-[11px] text-muted-foreground">{cliente.documento || "Sin documento"}</p>
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-[11px]">{cliente.tipo}</span>
                      </TableCell>
                      <TableCell className="tabular whitespace-nowrap text-sm text-muted-foreground">{cliente.telefono || "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">{cliente.email || "—"}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <CarFront className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          {formatearNumero(cantidadVehiculos)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatearFecha(cliente.creadoEn)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost" size="icon"
                              aria-label={`Acciones de ${cliente.nombre}`}
                              onClick={(evento) => evento.stopPropagation()}
                            >
                              <MoreHorizontal className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => navegar(`/clientes/${cliente.id}`)}>
                              <Eye className="size-4" aria-hidden="true" /> Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => navegar(`/clientes/${cliente.id}/editar`)}>
                              <Pencil className="size-4" aria-hidden="true" /> Editar cliente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setClienteEliminar(cliente)}>
                              <Trash2 className="size-4" aria-hidden="true" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Mostrando {filtrados.length} de {clientes.length} clientes
        </div>
      </Card>

      <Dialog open={clienteEliminar !== null} onOpenChange={(valor) => { if (!valor) setClienteEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription>
              Se va a eliminar a <span className="font-medium text-foreground">{clienteEliminar?.nombre}</span>. Solo se permite si no tiene vehículos, cotizaciones ni servicios asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClienteEliminar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
