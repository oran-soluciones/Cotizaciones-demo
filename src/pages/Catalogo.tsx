import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
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
import { formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { ServicioCatalogo } from "@/lib/types"

export default function Catalogo() {
  const { catalogo, eliminarServicioCatalogo } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState<string>("todas")
  const [servicioEliminar, setServicioEliminar] = useState<ServicioCatalogo | null>(null)

  const categorias = Array.from(new Set(catalogo.map((servicio) => servicio.categoria))).sort()

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return catalogo.filter((servicio) => {
      const coincideTexto =
        !texto ||
        servicio.nombre.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.descripcion.toLocaleLowerCase("es-AR").includes(texto)
      return coincideTexto && (categoria === "todas" || servicio.categoria === categoria)
    })
  }, [catalogo, busqueda, categoria])

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Catálogo de servicios"
        descripcion="Servicios frecuentes del taller: tren delantero, lavado de auto, mantenimiento y más"
        acciones={
          <Button onClick={() => navegar("/catalogo/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo servicio
          </Button>
        }
      />

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-catalogo">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-catalogo" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Nombre o descripción del servicio…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-64">
            <Label htmlFor="filtro-categoria-catalogo">Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="filtro-categoria-catalogo" name="categoria"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio sugerido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                    No hay servicios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((servicio) => (
                  <TableRow
                    key={servicio.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Editar servicio ${servicio.nombre}`}
                    onClick={() => navegar(`/catalogo/${servicio.id}/editar`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/catalogo/${servicio.id}/editar`)
                      }
                    }}
                  >
                    <TableCell className="max-w-[380px]">
                      <p className="truncate text-sm font-semibold">{servicio.nombre}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{servicio.descripcion || "Sin descripción"}</p>
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-[11px]">{servicio.categoria}</span>
                    </TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">
                      {formatearMoneda(servicio.precio)}
                    </TableCell>
                    <TableCell>
                      <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${
                        servicio.activo ? "border border-emerald-700 bg-emerald-600 text-white" : "border border-slate-700 bg-slate-600 text-white"
                      }`}>
                        {servicio.activo ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de ${servicio.nombre}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/catalogo/${servicio.id}/editar`)}>
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
          Mostrando {filtrados.length} de {formatearNumero(catalogo.length)} servicios del catálogo
        </div>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ClipboardList className="size-3.5" aria-hidden="true" />
        Estos servicios aparecen al cargar ítems en cotizaciones y servicios. También podés agregar ítems personalizados.
      </p>

      <Dialog open={servicioEliminar !== null} onOpenChange={(valor) => { if (!valor) setServicioEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar servicio del catálogo</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="font-medium text-foreground">{servicioEliminar?.nombre}</span>. Las cotizaciones y servicios ya creados conservan sus ítems.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServicioEliminar(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (servicioEliminar) {
                  eliminarServicioCatalogo(servicioEliminar.id)
                  toast.success("Servicio eliminado del catálogo")
                }
                setServicioEliminar(null)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
