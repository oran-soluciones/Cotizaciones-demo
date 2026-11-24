import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Coins, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, UserRoundCog } from "lucide-react"
import { toast } from "sonner"
import { ActivoBadge } from "@/components/comunes/Indicadores"
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
import { formatearMoneda, formatearNumero, formatearPorcentaje } from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { Personal } from "@/lib/types"

export default function PersonalPage() {
  const { personal, comisiones, eliminarPersonal } = useDatos()
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState("todos")
  const [personaEliminar, setPersonaEliminar] = useState<Personal | null>(null)

  const totalComisiones = (id: string) =>
    comisiones.filter((comision) => comision.personalId === id).reduce((total, comision) => total + comision.monto, 0)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return personal.filter((persona) => {
      const nombre = `${persona.nombre} ${persona.apellido}`.toLocaleLowerCase("es-AR")
      const coincideTexto = !texto || nombre.includes(texto) || persona.rol.toLocaleLowerCase("es-AR").includes(texto)
      const coincideEstado = estado === "todos" || (estado === "activo" ? persona.activo : !persona.activo)
      return coincideTexto && coincideEstado
    })
  }, [personal, busqueda, estado])

  const activos = personal.filter((persona) => persona.activo)
  const titular = personal.find((persona) => persona.esTitular)
  const pendiente = comisiones.filter((comision) => comision.estado === "Pendiente").reduce((total, comision) => total + comision.monto, 0)

  function eliminar() {
    if (!personaEliminar) return
    if (!eliminarPersonal(personaEliminar.id)) {
      toast.error("No se puede eliminar: tiene comisiones asignadas")
    } else {
      toast.success("Integrante eliminado")
    }
    setPersonaEliminar(null)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Personal"
        descripcion="Equipo del taller, comisiones por defecto y titular"
        acciones={
          <Button onClick={() => navegar("/personal/nuevo")}>
            <Plus className="size-4" aria-hidden="true" />
            Agregar personal
          </Button>
        }
      />

      <section aria-label="Resumen del personal" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Integrantes", valor: formatearNumero(personal.length), detalle: "Personal registrado", icono: <UserRoundCog className="size-[18px]" /> },
          { titulo: "Activos", valor: formatearNumero(activos.length), detalle: "Disponibles para asignar", icono: <UserRoundCog className="size-[18px]" /> },
          { titulo: "Titular", valor: titular ? titular.nombre : "—", detalle: titular?.rol ?? "Sin titular", icono: <UserRoundCog className="size-[18px]" /> },
          { titulo: "Comisiones pendientes", valor: formatearMoneda(pendiente), detalle: "A pagar del equipo", icono: <Coins className="size-[18px]" /> },
        ].map((metrica) => (
          <Card key={metrica.titulo} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <p className="text-xs font-medium text-muted-foreground">{metrica.titulo}</p>
            <p className="tabular mt-1.5 truncate text-xl font-semibold tracking-tight">{metrica.valor}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metrica.detalle}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-personal">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-personal" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Nombre o rol…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label htmlFor="filtro-estado-personal">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="filtro-estado-personal" name="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integrante</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Comisión por defecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total comisiones</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontró personal con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((persona) => (
                  <TableRow
                    key={persona.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`Ver detalle de ${persona.nombre} ${persona.apellido}`}
                    onClick={() => navegar(`/personal/${persona.id}`)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter" || evento.key === " ") {
                        evento.preventDefault()
                        navegar(`/personal/${persona.id}`)
                      }
                    }}
                  >
                    <TableCell>
                      <p className="truncate text-sm font-semibold">{persona.nombre} {persona.apellido}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{persona.telefono || persona.email || "Sin contacto"}</p>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">{persona.rol || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {persona.tipoComision === "porcentaje"
                        ? formatearPorcentaje(persona.valorComision)
                        : `${formatearMoneda(persona.valorComision)} fijos`}
                    </TableCell>
                    <TableCell><ActivoBadge activo={persona.activo} /></TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">
                      {formatearMoneda(totalComisiones(persona.id))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label={`Acciones de ${persona.nombre}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(evento) => evento.stopPropagation()}>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => navegar(`/personal/${persona.id}`)}>
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navegar(`/personal/${persona.id}/editar`)}>
                            <Pencil className="size-4" aria-hidden="true" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setPersonaEliminar(persona)}>
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
          Mostrando {filtrados.length} de {personal.length} integrantes
        </div>
      </Card>

      <Dialog open={personaEliminar !== null} onOpenChange={(valor) => { if (!valor) setPersonaEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar integrante</DialogTitle>
            <DialogDescription>
              Se va a eliminar a <span className="font-medium text-foreground">{personaEliminar?.nombre} {personaEliminar?.apellido}</span>. No se permite si tiene comisiones asignadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonaEliminar(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
