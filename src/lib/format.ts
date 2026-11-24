const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const fechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const fechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const numero = new Intl.NumberFormat("es-AR")

export function formatearMoneda(valor: number): string {
  return moneda.format(valor)
}

export function formatearNumero(valor: number): string {
  return numero.format(valor)
}

export function formatearPorcentaje(valor: number): string {
  return `${numero.format(valor)} %`
}

export function formatearFecha(iso?: string): string {
  if (!iso) return "—"
  return fechaCorta.format(new Date(iso))
}

export function formatearFechaHora(iso?: string): string {
  if (!iso) return "—"
  return fechaHora.format(new Date(iso))
}

export function aInputFecha(iso?: string): string {
  if (!iso) return ""
  const fecha = new Date(iso)
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export function deInputFecha(valor: string): string | undefined {
  if (!valor) return undefined
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString()
}

export function diasHasta(iso: string): number {
  const objetivo = new Date(iso)
  const hoy = new Date()
  objetivo.setHours(0, 0, 0, 0)
  hoy.setHours(0, 0, 0, 0)
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000)
}

export function textoVencimiento(iso: string): string {
  const dias = diasHasta(iso)
  if (dias === 0) return "Vence hoy"
  if (dias === 1) return "Vence mañana"
  if (dias > 1) return `Vence en ${dias} días`
  if (dias === -1) return "Venció ayer"
  return `Venció hace ${Math.abs(dias)} días`
}

export function iniciales(nombre: string, apellido = ""): string {
  return [nombre, apellido]
    .flatMap((parte) => parte.split(" ").filter(Boolean))
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("")
}
