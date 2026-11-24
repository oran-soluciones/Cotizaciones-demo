import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { subtotalItems, totalPresupuesto } from "@/lib/calculos"
import { formatearMoneda, formatearNumero } from "@/lib/format"
import type { ItemTrabajo, ServicioCatalogo } from "@/lib/types"

export function ItemsTrabajo({
  items,
  editable = false,
  alCambiar,
  manoDeObra = 0,
  descuento = 0,
  alCambiarManoDeObra,
  alCambiarDescuento,
  catalogo = [],
}: {
  items: ItemTrabajo[]
  editable?: boolean
  alCambiar?: (items: ItemTrabajo[]) => void
  catalogo?: ServicioCatalogo[]
  manoDeObra?: number
  descuento?: number
  alCambiarManoDeObra?: (valor: string) => void
  alCambiarDescuento?: (valor: string) => void
}) {
  const subtotal = subtotalItems(items)
  const total = totalPresupuesto(items, manoDeObra, descuento)

  function cambiar(indice: number, parcial: Partial<ItemTrabajo>) {
    alCambiar?.(items.map((item, i) => (i === indice ? { ...item, ...parcial } : item)))
  }

  function agregar() {
    alCambiar?.([
      ...items,
      {
        id: `item-${Date.now()}-${items.length}`,
        descripcion: "",
        cantidad: 1,
        precioUnitario: 0,
      },
    ])
  }

  function agregarDelCatalogo(servicioId: string) {
    const servicio = catalogo.find((item) => item.id === servicioId)
    if (!servicio) return
    alCambiar?.([
      ...items,
      {
        id: `item-${Date.now()}-${items.length}`,
        descripcion: servicio.nombre,
        cantidad: 1,
        precioUnitario: servicio.precio,
      },
    ])
  }

  return (
    <div className="space-y-3">
      {editable && catalogo.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="items-catalogo">Agregar desde el catálogo de servicios</Label>
          <Select value="" onValueChange={agregarDelCatalogo}>
            <SelectTrigger id="items-catalogo" name="catalogo">
              <SelectValue placeholder="Elegir servicio (tren delantero, lavado de auto, etc.)" />
            </SelectTrigger>
            <SelectContent>
              {catalogo.map((servicio) => (
                <SelectItem key={servicio.id} value={servicio.id}>
                  {servicio.nombre} · {formatearMoneda(servicio.precio)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
          Sin ítems cargados
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Descripción</th>
                <th scope="col" className="w-24 px-4 py-2.5 text-right font-medium">Cant.</th>
                <th scope="col" className="w-36 px-4 py-2.5 text-right font-medium">P. unitario</th>
                <th scope="col" className="w-36 px-4 py-2.5 text-right font-medium">Subtotal</th>
                {editable && <th scope="col" className="w-12 px-2 py-2.5"><span className="sr-only">Acciones</span></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, indice) => (
                <tr key={item.id} className="border-t border-border align-top">
                  <td className="px-4 py-2.5">
                    {editable ? (
                      <Input
                        aria-label={`Descripción del ítem ${indice + 1}`}
                        className="h-11"
                        value={item.descripcion}
                        onChange={(evento) => cambiar(indice, { descripcion: evento.target.value })}
                        placeholder="Descripción del trabajo o repuesto"
                      />
                    ) : (
                      <span>{item.descripcion || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editable ? (
                      <Input
                        aria-label={`Cantidad del ítem ${indice + 1}`}
                        type="number" min={1} inputMode="numeric"
                        className="tabular h-11 w-full"
                        value={item.cantidad}
                        onChange={(evento) => cambiar(indice, { cantidad: Number(evento.target.value) || 0 })}
                      />
                    ) : (
                      <span className="tabular">{formatearNumero(item.cantidad)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editable ? (
                      <Input
                        aria-label={`Precio unitario del ítem ${indice + 1}`}
                        type="number" min={0} inputMode="numeric"
                        className="tabular h-11 w-full"
                        value={item.precioUnitario}
                        onChange={(evento) => cambiar(indice, { precioUnitario: Number(evento.target.value) || 0 })}
                      />
                    ) : (
                      <span className="tabular text-muted-foreground">{formatearMoneda(item.precioUnitario)}</span>
                    )}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right font-medium">
                    {formatearMoneda(item.cantidad * item.precioUnitario)}
                  </td>
                  {editable && (
                    <td className="px-2 py-2.5 text-right">
                      <Button
                        type="button" variant="ghost" size="icon"
                        aria-label={`Quitar ítem ${indice + 1}`}
                        onClick={() => alCambiar?.(items.filter((_, i) => i !== indice))}
                      >
                        <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <Button type="button" variant="outline" size="sm" onClick={agregar}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar ítem
        </Button>
      )}

      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular font-medium">{formatearMoneda(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <Label htmlFor="items-mano-obra" className="text-muted-foreground">Mano de obra</Label>
          {editable ? (
            <Input
              id="items-mano-obra" name="manoDeObra" type="number" min={0} inputMode="numeric"
              className="tabular h-11 w-40"
              value={manoDeObra}
              onChange={(evento) => alCambiarManoDeObra?.(evento.target.value)}
            />
          ) : (
            <span className="tabular font-medium">{formatearMoneda(manoDeObra)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <Label htmlFor="items-descuento" className="text-muted-foreground">Descuento (%)</Label>
          {editable ? (
            <Input
              id="items-descuento" name="descuento" type="number" min={0} max={100} inputMode="numeric"
              className="tabular h-11 w-40"
              value={descuento}
              onChange={(evento) => alCambiarDescuento?.(evento.target.value)}
            />
          ) : (
            <span className="tabular font-medium">{descuento ? `${formatearNumero(descuento)} %` : "—"}</span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
          <span className="font-medium">Total</span>
          <span className="tabular text-base font-semibold">{formatearMoneda(total)}</span>
        </div>
      </div>
    </div>
  )
}
