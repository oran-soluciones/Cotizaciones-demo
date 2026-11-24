export const TIPOS_CLIENTE = ["Particular", "Empresa"] as const
export type TipoCliente = (typeof TIPOS_CLIENTE)[number]

export interface Cliente {
  id: string
  nombre: string
  documento: string
  tipo: TipoCliente
  telefono: string
  email: string
  direccion: string
  notas: string
  creadoEn: string
}

export const COMBUSTIBLES = ["Nafta", "Diesel", "GNC", "Híbrido", "Eléctrico"] as const

export interface Vehiculo {
  id: string
  clienteId: string
  patente: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  combustible: string
  color: string
  notas: string
}

export interface ItemTrabajo {
  id: string
  descripcion: string
  cantidad: number
  precioUnitario: number
}

export const ESTADOS_COTIZACION = [
  "Borrador",
  "Enviada",
  "Aceptada",
  "Rechazada",
  "Vencida",
] as const
export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number]

export interface Cotizacion {
  id: string
  numero: string
  titulo: string
  clienteId: string
  vehiculoId: string
  fecha: string
  vigenteHasta: string
  estado: EstadoCotizacion
  items: ItemTrabajo[]
  manoDeObra: number
  descuento: number
  condiciones: string
  notas: string
  creadoEn: string
}

export const ESTADOS_SERVICIO = [
  "Pendiente",
  "En curso",
  "Completado",
  "Entregado",
  "Cancelado",
] as const
export type EstadoServicio = (typeof ESTADOS_SERVICIO)[number]

export interface Servicio {
  id: string
  numero: string
  cotizacionId?: string
  titulo: string
  clienteId: string
  vehiculoId: string
  kilometraje: number
  estado: EstadoServicio
  ingresoEn: string
  entregaEstimadaEn: string
  entregaRealEn?: string
  items: ItemTrabajo[]
  manoDeObra: number
  descuento: number
  notas: string
  creadoEn: string
}

export const TIPOS_COMISION = ["porcentaje", "fijo"] as const
export type TipoComision = (typeof TIPOS_COMISION)[number]

export interface Personal {
  id: string
  nombre: string
  apellido: string
  rol: string
  telefono: string
  email: string
  tipoComision: TipoComision
  valorComision: number
  activo: boolean
  esTitular: boolean
  notas: string
}

export const ESTADOS_COMISION = ["Pendiente", "Pagada"] as const
export type EstadoComision = (typeof ESTADOS_COMISION)[number]

export type OrigenComision = "cotizacion" | "servicio"

export interface Comision {
  id: string
  personalId: string
  personalNombre: string
  origenTipo: OrigenComision
  origenId: string
  origenNumero: string
  tipo: TipoComision
  valor: number
  base: number
  monto: number
  estado: EstadoComision
  creadoEn: string
  pagadaEn?: string
}

export interface ServicioCatalogo {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  activo: boolean
}

export const CATEGORIAS_CATALOGO = [
  "Mantenimiento",
  "Frenos",
  "Suspensión y tren delantero",
  "Lavado y detailing",
  "Eléctrico",
  "Motor",
  "Aire acondicionado",
  "Diagnóstico",
  "Otros",
] as const

export interface DatosApp {
  catalogo: ServicioCatalogo[]
  clientes: Cliente[]
  vehiculos: Vehiculo[]
  cotizaciones: Cotizacion[]
  servicios: Servicio[]
  personal: Personal[]
  comisiones: Comision[]
}
