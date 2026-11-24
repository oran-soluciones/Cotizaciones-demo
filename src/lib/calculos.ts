import type { Comision, ItemTrabajo } from "@/lib/types"

export function subtotalItems(items: ItemTrabajo[]): number {
  return items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0)
}

export function totalPresupuesto(
  items: ItemTrabajo[],
  manoDeObra: number,
  descuento: number,
): number {
  const bruto = subtotalItems(items) + (Number(manoDeObra) || 0)
  return Math.max(0, bruto - bruto * ((Number(descuento) || 0) / 100))
}

export function montoComision(comision: Pick<Comision, "tipo" | "valor" | "base">): number {
  return comision.tipo === "porcentaje"
    ? (comision.base * (Number(comision.valor) || 0)) / 100
    : Number(comision.valor) || 0
}

export function esVencida(vigenteHasta: string): boolean {
  return new Date(vigenteHasta).getTime() < Date.now()
}
