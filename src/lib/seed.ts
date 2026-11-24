import { montoComision, totalPresupuesto } from "@/lib/calculos"
import type {
  Cliente,
  Comision,
  Cotizacion,
  DatosApp,
  ItemTrabajo,
  Personal,
  Servicio,
  ServicioCatalogo,
  Vehiculo,
} from "@/lib/types"

const hoy = new Date()

function fechaRelativa(dias: number, hora = 10, minuto = 0): string {
  const fecha = new Date(hoy)
  fecha.setDate(fecha.getDate() + dias)
  fecha.setHours(hora, minuto, 0, 0)
  return fecha.toISOString()
}

let contadorItem = 0
function item(descripcion: string, cantidad: number, precioUnitario: number): ItemTrabajo {
  contadorItem += 1
  return { id: `item-seed-${contadorItem}`, descripcion, cantidad, precioUnitario }
}

const catalogo: ServicioCatalogo[] = [
  { id: "cat-1", nombre: "Cambio de aceite y filtro", descripcion: "Aceite sintético 5W30 + filtro de aceite. Incluye revisión de niveles.", categoria: "Mantenimiento", precio: 68000, activo: true },
  { id: "cat-2", nombre: "Revisión general (50 puntos)", descripcion: "Chequeo de frenos, suspensión, fluidos, luces, neumáticos y batería.", categoria: "Mantenimiento", precio: 95000, activo: true },
  { id: "cat-3", nombre: "Tren delantero: alineación y balanceo", descripcion: "Alineación de dirección y balanceo de las 4 ruedas.", categoria: "Suspensión y tren delantero", precio: 74000, activo: true },
  { id: "cat-4", nombre: "Tren delantero completo", descripcion: "Amortiguadores, bases, barras estabilizadoras, alineación y balanceo.", categoria: "Suspensión y tren delantero", precio: 285000, activo: true },
  { id: "cat-5", nombre: "Lavado de auto", descripcion: "Lavado exterior con agua a presión, secado y limpieza de vidrios.", categoria: "Lavado y detailing", precio: 18000, activo: true },
  { id: "cat-6", nombre: "Lavado interior", descripcion: "Aspirado de tapizados, limpieza de tablero y consola.", categoria: "Lavado y detailing", precio: 22000, activo: true },
  { id: "cat-7", nombre: "Lavado y encerado premium", descripcion: "Lavado exterior, encerado a mano y aplicación de protectores.", categoria: "Lavado y detailing", precio: 45000, activo: true },
  { id: "cat-8", nombre: "Cambio de pastillas de freno", descripcion: "Pastillas delanteras o traseras, según vehículo.", categoria: "Frenos", precio: 120000, activo: true },
  { id: "cat-9", nombre: "Revisión de frenos", descripcion: "Control de pastillas, discos, líquido y conductos.", categoria: "Frenos", precio: 35000, activo: true },
  { id: "cat-10", nombre: "Cambio de distribución", descripcion: "Kit de distribución con bomba de agua y correa auxiliar.", categoria: "Motor", precio: 265000, activo: true },
  { id: "cat-11", nombre: "Diagnóstico electrónico", descripcion: "Lectura de códigos de falla con escáner y análisis de datos.", categoria: "Diagnóstico", precio: 45000, activo: true },
  { id: "cat-12", nombre: "Carga de aire acondicionado", descripcion: "Carga de gas R134a con control de fugas.", categoria: "Aire acondicionado", precio: 60000, activo: true },
  { id: "cat-13", nombre: "Revisión de GNC", descripcion: "Control de instalación, tanque, válvulas y regulador.", categoria: "Mantenimiento", precio: 55000, activo: true },
  { id: "cat-14", nombre: "Cambio de batería", descripcion: "Batería nueva con instalación y test de carga.", categoria: "Eléctrico", precio: 135000, activo: true },
  { id: "cat-15", nombre: "Limpieza de inyectores", descripcion: "Limpieza por ultrasonido y prueba de caudal.", categoria: "Motor", precio: 88000, activo: true },
  { id: "cat-16", nombre: "Cambio de filtros", descripcion: "Filtros de aceite, aire y habitáculo según vehículo.", categoria: "Mantenimiento", precio: 52000, activo: true },
]

const clientes: Cliente[] = [
  {
    id: "cli-1",
    nombre: "Martín",
    documento: "34.567.890",
    tipo: "Particular",
    telefono: "11 5555 1234",
    email: "martin.pereyra@email.com",
    direccion: "Av. Rivadavia 1234, CABA",
    notas: "Prefiere que lo llamen por la mañana.",
    creadoEn: fechaRelativa(-220),
  },
  {
    id: "cli-2",
    nombre: "Laura Gómez",
    documento: "29.876.543",
    tipo: "Particular",
    telefono: "11 4444 9876",
    email: "laura.gomez@email.com",
    direccion: "Thames 890, CABA",
    notas: "",
    creadoEn: fechaRelativa(-180),
  },
  {
    id: "cli-3",
    nombre: "Transportes del Sur SRL",
    documento: "30-71234567-8",
    tipo: "Empresa",
    telefono: "11 3333 2211",
    email: "administracion@transportesdelsur.com.ar",
    direccion: "Av. Oeste 2450, Moreno",
    notas: "Flota de 8 vehículos. Solicitan factura A.",
    creadoEn: fechaRelativa(-150),
  },
  {
    id: "cli-4",
    nombre: "Diego Fernández",
    documento: "36.112.908",
    tipo: "Particular",
    telefono: "11 6666 3344",
    email: "diego.fernandez@email.com",
    direccion: "Mitre 456, Quilmes",
    notas: "",
    creadoEn: fechaRelativa(-95),
  },
  {
    id: "cli-5",
    nombre: "Valeria Ruiz",
    documento: "31.998.120",
    tipo: "Particular",
    telefono: "11 7777 8899",
    email: "valeria.ruiz@email.com",
    direccion: "San Martín 1120, Morón",
    notas: "Siempre solicita revisión de frenos.",
    creadoEn: fechaRelativa(-60),
  },
  {
    id: "cli-6",
    nombre: "Estación Service Norte",
    documento: "30-68912345-2",
    tipo: "Empresa",
    telefono: "11 2222 1100",
    email: "compras@stationservice.com.ar",
    direccion: "Ruta 8 km 32, Pilar",
    notas: "Cliente mayorista, pago a 30 días.",
    creadoEn: fechaRelativa(-40),
  },
]

const vehiculos: Vehiculo[] = [
  { id: "veh-1", clienteId: "cli-1", patente: "AB 123 CD", marca: "Ford", modelo: "Fiesta", anio: 2019, kilometraje: 87500, combustible: "Nafta", color: "Rojo", notas: "Ruido en suspensión delantera." },
  { id: "veh-2", clienteId: "cli-2", patente: "XY 456 ZT", marca: "Toyota", modelo: "Corolla", anio: 2021, kilometraje: 45200, combustible: "Nafta", color: "Gris", notas: "" },
  { id: "veh-3", clienteId: "cli-3", patente: "KL 789 MN", marca: "Volkswagen", modelo: "Gol", anio: 2018, kilometraje: 132400, combustible: "Diesel", color: "Blanco", notas: "Vehículo de flota, uso diario." },
  { id: "veh-4", clienteId: "cli-4", patente: "PQ 321 RS", marca: "Chevrolet", modelo: "Onix", anio: 2022, kilometraje: 28900, combustible: "Nafta", color: "Azul", notas: "" },
  { id: "veh-5", clienteId: "cli-5", patente: "MN 654 OP", marca: "Honda", modelo: "Fit", anio: 2017, kilometraje: 98700, combustible: "Nafta", color: "Negro", notas: "Cambio de aceite cada 8.000 km." },
  { id: "veh-6", clienteId: "cli-6", patente: "RT 987 UV", marca: "Peugeot", modelo: "208", anio: 2020, kilometraje: 61300, combustible: "Nafta", color: "Blanco", notas: "" },
  { id: "veh-7", clienteId: "cli-1", patente: "EF 147 GH", marca: "Renault", modelo: "Sandero", anio: 2016, kilometraje: 145000, combustible: "GNC", color: "Gris", notas: "Revisar tanque de GNC." },
]

const cotizaciones: Cotizacion[] = [
  {
    id: "cot-101", numero: "COT-2026-0101", titulo: "Revisión general y cambio de filtros",
    clienteId: "cli-1", vehiculoId: "veh-1", fecha: fechaRelativa(-12),
    vigenteHasta: fechaRelativa(18), estado: "Aceptada",
    items: [
      item("Aceite sintético 5W30", 1, 38500),
      item("Filtro de aceite", 1, 12500),
      item("Filtro de aire", 1, 15800),
      item("Filtro de habitáculo", 1, 14200),
    ],
    manoDeObra: 60000, descuento: 5,
    condiciones: "Validez 30 días. Se requiere seña del 30% para iniciar el trabajo.",
    notas: "El cliente autorizó la revisión completa.", creadoEn: fechaRelativa(-12),
  },
  {
    id: "cot-102", numero: "COT-2026-0102", titulo: "Reparación de frenos delanteros",
    clienteId: "cli-2", vehiculoId: "veh-2", fecha: fechaRelativa(-8),
    vigenteHasta: fechaRelativa(22), estado: "Enviada",
    items: [
      item("Kit de pastillas delanteras", 1, 72000),
      item("Discos de freno", 2, 48500),
      item("Líquido de frenos", 1, 9800),
    ],
    manoDeObra: 85000, descuento: 0,
    condiciones: "Presupuesto sujeto a revisión de discos.", notas: "Enviada por email.", creadoEn: fechaRelativa(-8),
  },
  {
    id: "cot-103", numero: "COT-2026-0103", titulo: "Mantenimiento de flota - 3 vehículos",
    clienteId: "cli-3", vehiculoId: "veh-3", fecha: fechaRelativa(-20),
    vigenteHasta: fechaRelativa(10), estado: "Aceptada",
    items: [
      item("Cambio de aceite y filtros (por vehículo)", 3, 68000),
      item("Revisión de frenos (por vehículo)", 3, 42000),
      item("Chequeo de suspensión (por vehículo)", 3, 35000),
    ],
    manoDeObra: 210000, descuento: 10,
    condiciones: "Factura A. Pago a 15 días.", notas: "Incluye 3 vehículos de la flota.", creadoEn: fechaRelativa(-20),
  },
  {
    id: "cot-104", numero: "COT-2026-0104", titulo: "Cambio de distribución",
    clienteId: "cli-4", vehiculoId: "veh-4", fecha: fechaRelativa(-5),
    vigenteHasta: fechaRelativa(25), estado: "Enviada",
    items: [
      item("Kit de distribución", 1, 168000),
      item("Bomba de agua", 1, 74000),
      item("Correa auxiliar", 1, 22000),
    ],
    manoDeObra: 120000, descuento: 0,
    condiciones: "Se requiere seña del 50%.", notas: "El cliente está comparando con otro taller.", creadoEn: fechaRelativa(-5),
  },
  {
    id: "cot-105", numero: "COT-2026-0105", titulo: "Diagnóstico y reparación de aire acondicionado",
    clienteId: "cli-5", vehiculoId: "veh-5", fecha: fechaRelativa(-2),
    vigenteHasta: fechaRelativa(28), estado: "Borrador",
    items: [
      item("Carga de gas R134a", 1, 45000),
      item("Búsqueda de pérdidas", 1, 32000),
      item("Filtro secador", 1, 18000),
    ],
    manoDeObra: 55000, descuento: 0,
    condiciones: "", notas: "Pendiente de revisión con el cliente.", creadoEn: fechaRelativa(-2),
  },
  {
    id: "cot-106", numero: "COT-2026-0106", titulo: "Suspensión delantera completa",
    clienteId: "cli-1", vehiculoId: "veh-1", fecha: fechaRelativa(-45),
    vigenteHasta: fechaRelativa(-15), estado: "Vencida",
    items: [
      item("Amortiguadores delanteros", 2, 58000),
      item("Bases de amortiguador", 2, 18500),
      item("Barras estabilizadoras", 2, 21000),
    ],
    manoDeObra: 95000, descuento: 0,
    condiciones: "Validez 30 días.", notas: "El cliente pidió tiempo para decidir.", creadoEn: fechaRelativa(-45),
  },
  {
    id: "cot-107", numero: "COT-2026-0107", titulo: "Cambio de aceite - flota",
    clienteId: "cli-6", vehiculoId: "veh-6", fecha: fechaRelativa(-30),
    vigenteHasta: fechaRelativa(-5), estado: "Rechazada",
    items: [
      item("Aceite 10W40", 2, 34000),
      item("Filtro de aceite", 2, 11000),
    ],
    manoDeObra: 40000, descuento: 0,
    condiciones: "Pago a 30 días.", notas: "Rechazada por diferencia de precio.", creadoEn: fechaRelativa(-30),
  },
  {
    id: "cot-108", numero: "COT-2026-0108", titulo: "Revisión de GNC y encendido",
    clienteId: "cli-1", vehiculoId: "veh-7", fecha: fechaRelativa(-1),
    vigenteHasta: fechaRelativa(29), estado: "Borrador",
    items: [
      item("Revisión de instalación GNC", 1, 55000),
      item("Bujías", 4, 8500),
      item("Cables de encendido", 1, 28000),
    ],
    manoDeObra: 48000, descuento: 0,
    condiciones: "", notas: "", creadoEn: fechaRelativa(-1),
  },
  {
    id: "cot-109", numero: "COT-2026-0109", titulo: "Lavado de auto e interior",
    clienteId: "cli-5", vehiculoId: "veh-5", fecha: fechaRelativa(-3),
    vigenteHasta: fechaRelativa(27), estado: "Enviada",
    items: [
      item("Lavado de auto", 1, 18000),
      item("Lavado interior", 1, 22000),
      item("Lavado y encerado premium", 1, 45000),
    ],
    manoDeObra: 0, descuento: 0,
    condiciones: "Turno con 24 horas de anticipación.", notas: "Consulta por paquete de 5 lavados.", creadoEn: fechaRelativa(-3),
  },
]

const servicios: Servicio[] = [
  {
    id: "srv-201", numero: "SRV-2026-0201", cotizacionId: "cot-101",
    titulo: "Revisión general y cambio de filtros", clienteId: "cli-1", vehiculoId: "veh-1",
    kilometraje: 87500, estado: "En curso", ingresoEn: fechaRelativa(-2, 9),
    entregaEstimadaEn: fechaRelativa(1, 17),
    items: cotizaciones[0].items, manoDeObra: 60000, descuento: 5,
    notas: "Vehículo en elevador. Falta filtro de habitáculo.", creadoEn: fechaRelativa(-2),
  },
  {
    id: "srv-202", numero: "SRV-2026-0202", cotizacionId: "cot-103",
    titulo: "Mantenimiento de flota - 3 vehículos", clienteId: "cli-3", vehiculoId: "veh-3",
    kilometraje: 132400, estado: "Completado", ingresoEn: fechaRelativa(-9, 8),
    entregaEstimadaEn: fechaRelativa(-7, 18), entregaRealEn: fechaRelativa(-7, 16, 30),
    items: cotizaciones[2].items, manoDeObra: 210000, descuento: 10,
    notas: "Trabajo finalizado. Pendiente de facturación.", creadoEn: fechaRelativa(-9),
  },
  {
    id: "srv-203", numero: "SRV-2026-0203", titulo: "Cambio de aceite y filtro",
    clienteId: "cli-5", vehiculoId: "veh-5", kilometraje: 98700,
    estado: "Entregado", ingresoEn: fechaRelativa(-15, 10),
    entregaEstimadaEn: fechaRelativa(-15, 15), entregaRealEn: fechaRelativa(-15, 14, 45),
    items: [item("Aceite 5W30", 1, 39000), item("Filtro de aceite", 1, 13000)],
    manoDeObra: 35000, descuento: 0, notas: "Entregado en tiempo y forma.", creadoEn: fechaRelativa(-15),
  },
  {
    id: "srv-204", numero: "SRV-2026-0204", titulo: "Diagnóstico de falla eléctrica",
    clienteId: "cli-4", vehiculoId: "veh-4", kilometraje: 29150,
    estado: "Pendiente", ingresoEn: fechaRelativa(0, 14),
    entregaEstimadaEn: fechaRelativa(2, 17),
    items: [item("Diagnóstico electrónico", 1, 45000)],
    manoDeObra: 30000, descuento: 0, notas: "Esperando al cliente.", creadoEn: fechaRelativa(0),
  },
  {
    id: "srv-205", numero: "SRV-2026-0205", titulo: "Tren delantero: alineación y balanceo",
    clienteId: "cli-2", vehiculoId: "veh-2", kilometraje: 45300,
    estado: "En curso", ingresoEn: fechaRelativa(-1, 11),
    entregaEstimadaEn: fechaRelativa(0, 16),
    items: [item("Alineación de dirección", 1, 38000), item("Balanceo de ruedas", 4, 6500), item("Revisión de suspensión", 1, 18000)],
    manoDeObra: 25000, descuento: 0, notas: "Pide presupuesto de tren delantero completo.", creadoEn: fechaRelativa(-1),
  },
  {
    id: "srv-206", numero: "SRV-2026-0206", titulo: "Lavado de auto e interior",
    clienteId: "cli-5", vehiculoId: "veh-5", kilometraje: 98800,
    estado: "Entregado", ingresoEn: fechaRelativa(-4, 9),
    entregaEstimadaEn: fechaRelativa(-4, 12), entregaRealEn: fechaRelativa(-4, 11, 30),
    items: [item("Lavado de auto", 1, 18000), item("Lavado interior", 1, 22000), item("Lavado y encerado premium", 1, 45000)],
    manoDeObra: 0, descuento: 0, notas: "Cliente conformes con el resultado.", creadoEn: fechaRelativa(-4),
  },
]

const personal: Personal[] = [
  { id: "per-1", nombre: "Ricardo", apellido: "Álvarez", rol: "Titular / Mecánico", telefono: "11 6000 1001", email: "ricardo@taller.com.ar", tipoComision: "porcentaje", valorComision: 35, activo: true, esTitular: true, notas: "Titular del taller. Se asigna el 35% de cada trabajo." },
  { id: "per-2", nombre: "Ana", apellido: "Ledesma", rol: "Mecánica", telefono: "11 6000 1002", email: "ana@taller.com.ar", tipoComision: "porcentaje", valorComision: 25, activo: true, esTitular: false, notas: "Especialista en frenos y suspensión." },
  { id: "per-3", nombre: "Jorge", apellido: "Ramírez", rol: "Mecánico", telefono: "11 6000 1003", email: "jorge@taller.com.ar", tipoComision: "fijo", valorComision: 45000, activo: true, esTitular: false, notas: "Monto fijo por servicio." },
  { id: "per-4", nombre: "Sofía", apellido: "Torres", rol: "Administración", telefono: "11 6000 1004", email: "sofia@taller.com.ar", tipoComision: "porcentaje", valorComision: 10, activo: true, esTitular: false, notas: "Comisión por cotizaciones aceptadas." },
  { id: "per-5", nombre: "Lucas", apellido: "Benítez", rol: "Ayudante", telefono: "11 6000 1005", email: "lucas@taller.com.ar", tipoComision: "fijo", valorComision: 25000, activo: false, esTitular: false, notas: "Inactivo desde el mes pasado." },
]

type ComisionSemilla = {
  id: string
  personalId: string
  origenTipo: "cotizacion" | "servicio"
  origenId: string
  origenNumero: string
  tipo: "porcentaje" | "fijo"
  valor: number
  base: number
  estado: "Pendiente" | "Pagada"
  dias: number
}

function comisionesSemilla(): Comision[] {
  const datos: ComisionSemilla[] = [
    { id: "com-1", personalId: "per-1", origenTipo: "servicio", origenId: "srv-201", origenNumero: "SRV-2026-0201", tipo: "porcentaje", valor: 35, base: totalPresupuesto(servicios[0].items, servicios[0].manoDeObra, servicios[0].descuento), estado: "Pendiente", dias: -2 },
    { id: "com-2", personalId: "per-2", origenTipo: "servicio", origenId: "srv-201", origenNumero: "SRV-2026-0201", tipo: "porcentaje", valor: 25, base: totalPresupuesto(servicios[0].items, servicios[0].manoDeObra, servicios[0].descuento), estado: "Pendiente", dias: -2 },
    { id: "com-3", personalId: "per-1", origenTipo: "servicio", origenId: "srv-202", origenNumero: "SRV-2026-0202", tipo: "porcentaje", valor: 35, base: totalPresupuesto(servicios[1].items, servicios[1].manoDeObra, servicios[1].descuento), estado: "Pagada", dias: -7 },
    { id: "com-4", personalId: "per-2", origenTipo: "servicio", origenId: "srv-202", origenNumero: "SRV-2026-0202", tipo: "porcentaje", valor: 25, base: totalPresupuesto(servicios[1].items, servicios[1].manoDeObra, servicios[1].descuento), estado: "Pagada", dias: -7 },
    { id: "com-5", personalId: "per-3", origenTipo: "servicio", origenId: "srv-202", origenNumero: "SRV-2026-0202", tipo: "fijo", valor: 45000, base: totalPresupuesto(servicios[1].items, servicios[1].manoDeObra, servicios[1].descuento), estado: "Pagada", dias: -7 },
    { id: "com-6", personalId: "per-1", origenTipo: "servicio", origenId: "srv-203", origenNumero: "SRV-2026-0203", tipo: "porcentaje", valor: 35, base: totalPresupuesto(servicios[2].items, servicios[2].manoDeObra, servicios[2].descuento), estado: "Pagada", dias: -15 },
    { id: "com-7", personalId: "per-4", origenTipo: "cotizacion", origenId: "cot-101", origenNumero: "COT-2026-0101", tipo: "porcentaje", valor: 10, base: totalPresupuesto(cotizaciones[0].items, cotizaciones[0].manoDeObra, cotizaciones[0].descuento), estado: "Pendiente", dias: -12 },
    { id: "com-8", personalId: "per-4", origenTipo: "cotizacion", origenId: "cot-103", origenNumero: "COT-2026-0103", tipo: "porcentaje", valor: 10, base: totalPresupuesto(cotizaciones[2].items, cotizaciones[2].manoDeObra, cotizaciones[2].descuento), estado: "Pagada", dias: -20 },
    { id: "com-9", personalId: "per-2", origenTipo: "servicio", origenId: "srv-205", origenNumero: "SRV-2026-0205", tipo: "porcentaje", valor: 25, base: totalPresupuesto(servicios[4].items, servicios[4].manoDeObra, servicios[4].descuento), estado: "Pendiente", dias: -1 },
    { id: "com-10", personalId: "per-3", origenTipo: "servicio", origenId: "srv-204", origenNumero: "SRV-2026-0204", tipo: "fijo", valor: 45000, base: totalPresupuesto(servicios[3].items, servicios[3].manoDeObra, servicios[3].descuento), estado: "Pendiente", dias: 0 },
  ]

  return datos.map((dato) => {
    const persona = personal.find((item) => item.id === dato.personalId)!
    return {
      id: dato.id,
      personalId: dato.personalId,
      personalNombre: `${persona.nombre} ${persona.apellido}`,
      origenTipo: dato.origenTipo,
      origenId: dato.origenId,
      origenNumero: dato.origenNumero,
      tipo: dato.tipo,
      valor: dato.valor,
      base: dato.base,
      monto: montoComision(dato),
      estado: dato.estado,
      creadoEn: fechaRelativa(dato.dias),
      ...(dato.estado === "Pagada" ? { pagadaEn: fechaRelativa(dato.dias + 1) } : {}),
    }
  })
}

export function crearDatosIniciales(): DatosApp {
  contadorItem = 0
  return {
    catalogo,
    clientes,
    vehiculos,
    cotizaciones,
    servicios,
    personal,
    comisiones: comisionesSemilla(),
  }
}
