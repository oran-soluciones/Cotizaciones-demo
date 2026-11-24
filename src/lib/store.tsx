import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { montoComision } from "@/lib/calculos"
import { crearDatosIniciales } from "@/lib/seed"
import type {
  Cliente,
  Comision,
  Cotizacion,
  DatosApp,
  EstadoComision,
  EstadoCotizacion,
  EstadoServicio,
  Personal,
  Servicio,
  ServicioCatalogo,
  Vehiculo,
} from "@/lib/types"

const CLAVE_ALMACENAMIENTO = "cotizaciones-demo:datos:v1"

function cargarDatos(): DatosApp {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO)
    if (crudo) {
      const datos = JSON.parse(crudo) as DatosApp
      if (
        Array.isArray(datos.clientes) &&
        Array.isArray(datos.vehiculos) &&
        Array.isArray(datos.cotizaciones) &&
        Array.isArray(datos.servicios) &&
        Array.isArray(datos.personal) &&
        Array.isArray(datos.comisiones)
      ) {
        if (!Array.isArray(datos.catalogo)) {
          datos.catalogo = crearDatosIniciales().catalogo
        }
        return datos
      }
    }
  } catch {
    // Datos corruptos: se regenera la demo.
  }
  return crearDatosIniciales()
}

function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function siguienteNumero(items: { numero: string }[], prefijo: string): string {
  const ultimo = items.reduce((maximo, item) => {
    const valor = Number(item.numero.split("-").at(-1))
    return Number.isFinite(valor) ? Math.max(maximo, valor) : maximo
  }, 0)
  return `${prefijo}-${new Date().getFullYear()}-${String(ultimo + 1).padStart(4, "0")}`
}

interface ContextoApp extends DatosApp {
  agregarServicioCatalogo: (servicio: Omit<ServicioCatalogo, "id">) => string
  actualizarServicioCatalogo: (id: string, cambios: Partial<ServicioCatalogo>) => void
  eliminarServicioCatalogo: (id: string) => void
  agregarCliente: (cliente: Omit<Cliente, "id" | "creadoEn">) => string
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void
  eliminarCliente: (id: string) => boolean
  agregarVehiculo: (vehiculo: Omit<Vehiculo, "id">) => string
  actualizarVehiculo: (id: string, cambios: Partial<Vehiculo>) => void
  eliminarVehiculo: (id: string) => boolean
  agregarCotizacion: (cotizacion: Omit<Cotizacion, "id" | "numero" | "creadoEn">) => string
  actualizarCotizacion: (id: string, cambios: Partial<Cotizacion>) => void
  eliminarCotizacion: (id: string) => boolean
  cambiarEstadoCotizacion: (id: string, estado: EstadoCotizacion) => void
  generarServicioDesdeCotizacion: (cotizacionId: string) => string | undefined
  agregarServicio: (servicio: Omit<Servicio, "id" | "numero" | "creadoEn">) => string
  actualizarServicio: (id: string, cambios: Partial<Servicio>) => void
  eliminarServicio: (id: string) => boolean
  cambiarEstadoServicio: (id: string, estado: EstadoServicio) => void
  agregarPersonal: (persona: Omit<Personal, "id">) => string
  actualizarPersonal: (id: string, cambios: Partial<Personal>) => void
  eliminarPersonal: (id: string) => boolean
  agregarComision: (comision: Omit<Comision, "id" | "creadoEn" | "pagadaEn" | "monto" | "personalNombre">) => string
  actualizarComision: (id: string, cambios: Partial<Comision>) => void
  eliminarComision: (id: string) => void
  cambiarEstadoComision: (id: string, estado: EstadoComision) => void
  reiniciarDemo: () => void
}

const Contexto = createContext<ContextoApp | null>(null)

export function ProveedorDatos({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DatosApp>(cargarDatos)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos))
    } catch {
      // Almacenamiento lleno o no disponible: la demo sigue en memoria.
    }
  }, [datos])

  const agregarServicioCatalogo = useCallback((servicio: Omit<ServicioCatalogo, "id">) => {
    const id = nuevoId("cat")
    setDatos((actual) => ({ ...actual, catalogo: [{ ...servicio, id }, ...actual.catalogo] }))
    return id
  }, [])

  const actualizarServicioCatalogo = useCallback((id: string, cambios: Partial<ServicioCatalogo>) => {
    setDatos((actual) => ({
      ...actual,
      catalogo: actual.catalogo.map((servicio) => (servicio.id === id ? { ...servicio, ...cambios } : servicio)),
    }))
  }, [])

  const eliminarServicioCatalogo = useCallback((id: string) => {
    setDatos((actual) => ({
      ...actual,
      catalogo: actual.catalogo.filter((servicio) => servicio.id !== id),
    }))
  }, [])

  const agregarCliente = useCallback((cliente: Omit<Cliente, "id" | "creadoEn">) => {
    const id = nuevoId("cli")
    setDatos((actual) => ({
      ...actual,
      clientes: [{ ...cliente, id, creadoEn: new Date().toISOString() }, ...actual.clientes],
    }))
    return id
  }, [])

  const actualizarCliente = useCallback((id: string, cambios: Partial<Cliente>) => {
    setDatos((actual) => ({
      ...actual,
      clientes: actual.clientes.map((cliente) => (cliente.id === id ? { ...cliente, ...cambios } : cliente)),
    }))
  }, [])

  const eliminarCliente = useCallback(
    (id: string) => {
      const enUso =
        datos.vehiculos.some((vehiculo) => vehiculo.clienteId === id) ||
        datos.cotizaciones.some((cotizacion) => cotizacion.clienteId === id) ||
        datos.servicios.some((servicio) => servicio.clienteId === id)
      if (enUso) return false
      setDatos((actual) => ({ ...actual, clientes: actual.clientes.filter((cliente) => cliente.id !== id) }))
      return true
    },
    [datos],
  )

  const agregarVehiculo = useCallback((vehiculo: Omit<Vehiculo, "id">) => {
    const id = nuevoId("veh")
    setDatos((actual) => ({ ...actual, vehiculos: [{ ...vehiculo, id }, ...actual.vehiculos] }))
    return id
  }, [])

  const actualizarVehiculo = useCallback((id: string, cambios: Partial<Vehiculo>) => {
    setDatos((actual) => ({
      ...actual,
      vehiculos: actual.vehiculos.map((vehiculo) => (vehiculo.id === id ? { ...vehiculo, ...cambios } : vehiculo)),
    }))
  }, [])

  const eliminarVehiculo = useCallback(
    (id: string) => {
      const enUso =
        datos.cotizaciones.some((cotizacion) => cotizacion.vehiculoId === id) ||
        datos.servicios.some((servicio) => servicio.vehiculoId === id)
      if (enUso) return false
      setDatos((actual) => ({ ...actual, vehiculos: actual.vehiculos.filter((vehiculo) => vehiculo.id !== id) }))
      return true
    },
    [datos],
  )

  const agregarCotizacion = useCallback(
    (cotizacion: Omit<Cotizacion, "id" | "numero" | "creadoEn">) => {
      const id = nuevoId("cot")
      const numero = siguienteNumero(datos.cotizaciones, "COT")
      setDatos((actual) => ({
        ...actual,
        cotizaciones: [
          { ...cotizacion, id, numero, creadoEn: new Date().toISOString() },
          ...actual.cotizaciones,
        ],
      }))
      return id
    },
    [datos.cotizaciones],
  )

  const actualizarCotizacion = useCallback((id: string, cambios: Partial<Cotizacion>) => {
    setDatos((actual) => ({
      ...actual,
      cotizaciones: actual.cotizaciones.map((cotizacion) =>
        cotizacion.id === id ? { ...cotizacion, ...cambios } : cotizacion,
      ),
    }))
  }, [])

  const eliminarCotizacion = useCallback(
    (id: string) => {
      const enUso =
        datos.servicios.some((servicio) => servicio.cotizacionId === id) ||
        datos.comisiones.some((comision) => comision.origenTipo === "cotizacion" && comision.origenId === id)
      if (enUso) return false
      setDatos((actual) => ({
        ...actual,
        cotizaciones: actual.cotizaciones.filter((cotizacion) => cotizacion.id !== id),
      }))
      return true
    },
    [datos],
  )

  const cambiarEstadoCotizacion = useCallback((id: string, estado: EstadoCotizacion) => {
    setDatos((actual) => ({
      ...actual,
      cotizaciones: actual.cotizaciones.map((cotizacion) =>
        cotizacion.id === id ? { ...cotizacion, estado } : cotizacion,
      ),
    }))
  }, [])

  const generarServicioDesdeCotizacion = useCallback(
    (cotizacionId: string) => {
      const existente = datos.servicios.find((servicio) => servicio.cotizacionId === cotizacionId)
      if (existente) return existente.id

      const cotizacion = datos.cotizaciones.find((item) => item.id === cotizacionId)
      if (!cotizacion) return undefined

      const vehiculo = datos.vehiculos.find((item) => item.id === cotizacion.vehiculoId)
      const id = nuevoId("srv")
      const numero = siguienteNumero(datos.servicios, "SRV")
      const ahora = new Date()
      const entrega = new Date(ahora.getTime() + 3 * 86_400_000)

      setDatos((actual) => ({
        ...actual,
        cotizaciones: actual.cotizaciones.map((item) =>
          item.id === cotizacionId ? { ...item, estado: "Aceptada" as EstadoCotizacion } : item,
        ),
        servicios: [
          {
            id,
            numero,
            cotizacionId,
            titulo: cotizacion.titulo,
            clienteId: cotizacion.clienteId,
            vehiculoId: cotizacion.vehiculoId,
            kilometraje: vehiculo?.kilometraje ?? 0,
            estado: "Pendiente" as EstadoServicio,
            ingresoEn: ahora.toISOString(),
            entregaEstimadaEn: entrega.toISOString(),
            items: cotizacion.items.map((item) => ({ ...item, id: nuevoId("item") })),
            manoDeObra: cotizacion.manoDeObra,
            descuento: cotizacion.descuento,
            notas: cotizacion.notas,
            creadoEn: ahora.toISOString(),
          },
          ...actual.servicios,
        ],
      }))
      return id
    },
    [datos],
  )

  const agregarServicio = useCallback(
    (servicio: Omit<Servicio, "id" | "numero" | "creadoEn">) => {
      const id = nuevoId("srv")
      const numero = siguienteNumero(datos.servicios, "SRV")
      setDatos((actual) => ({
        ...actual,
        servicios: [{ ...servicio, id, numero, creadoEn: new Date().toISOString() }, ...actual.servicios],
      }))
      return id
    },
    [datos.servicios],
  )

  const actualizarServicio = useCallback((id: string, cambios: Partial<Servicio>) => {
    setDatos((actual) => ({
      ...actual,
      servicios: actual.servicios.map((servicio) => (servicio.id === id ? { ...servicio, ...cambios } : servicio)),
    }))
  }, [])

  const eliminarServicio = useCallback(
    (id: string) => {
      const enUso = datos.comisiones.some(
        (comision) => comision.origenTipo === "servicio" && comision.origenId === id,
      )
      if (enUso) return false
      setDatos((actual) => ({
        ...actual,
        servicios: actual.servicios.filter((servicio) => servicio.id !== id),
      }))
      return true
    },
    [datos],
  )

  const cambiarEstadoServicio = useCallback((id: string, estado: EstadoServicio) => {
    setDatos((actual) => ({
      ...actual,
      servicios: actual.servicios.map((servicio) =>
        servicio.id === id
          ? {
              ...servicio,
              estado,
              entregaRealEn:
                estado === "Completado" || estado === "Entregado"
                  ? (servicio.entregaRealEn ?? new Date().toISOString())
                  : servicio.entregaRealEn,
            }
          : servicio,
      ),
    }))
  }, [])

  const agregarPersonal = useCallback((persona: Omit<Personal, "id">) => {
    const id = nuevoId("per")
    setDatos((actual) => ({ ...actual, personal: [{ ...persona, id }, ...actual.personal] }))
    return id
  }, [])

  const actualizarPersonal = useCallback((id: string, cambios: Partial<Personal>) => {
    setDatos((actual) => ({
      ...actual,
      personal: actual.personal.map((persona) => (persona.id === id ? { ...persona, ...cambios } : persona)),
    }))
  }, [])

  const eliminarPersonal = useCallback(
    (id: string) => {
      if (datos.comisiones.some((comision) => comision.personalId === id)) return false
      setDatos((actual) => ({ ...actual, personal: actual.personal.filter((persona) => persona.id !== id) }))
      return true
    },
    [datos],
  )

  const agregarComision = useCallback(
    (comision: Omit<Comision, "id" | "creadoEn" | "pagadaEn" | "monto" | "personalNombre">) => {
      const id = nuevoId("com")
      const persona = datos.personal.find((item) => item.id === comision.personalId)
      setDatos((actual) => ({
        ...actual,
        comisiones: [
          {
            ...comision,
            id,
            personalNombre: persona ? `${persona.nombre} ${persona.apellido}`.trim() : "Personal",
            monto: montoComision(comision),
            creadoEn: new Date().toISOString(),
          },
          ...actual.comisiones,
        ],
      }))
      return id
    },
    [datos.personal],
  )

  const actualizarComision = useCallback((id: string, cambios: Partial<Comision>) => {
    setDatos((actual) => ({
      ...actual,
      comisiones: actual.comisiones.map((comision) => {
        if (comision.id !== id) return comision
        const actualizada = { ...comision, ...cambios }
        return { ...actualizada, monto: montoComision(actualizada) }
      }),
    }))
  }, [])

  const eliminarComision = useCallback((id: string) => {
    setDatos((actual) => ({
      ...actual,
      comisiones: actual.comisiones.filter((comision) => comision.id !== id),
    }))
  }, [])

  const cambiarEstadoComision = useCallback((id: string, estado: EstadoComision) => {
    setDatos((actual) => ({
      ...actual,
      comisiones: actual.comisiones.map((comision) =>
        comision.id === id
          ? {
              ...comision,
              estado,
              pagadaEn: estado === "Pagada" ? (comision.pagadaEn ?? new Date().toISOString()) : undefined,
            }
          : comision,
      ),
    }))
  }, [])

  const reiniciarDemo = useCallback(() => {
    setDatos(crearDatosIniciales())
  }, [])

  const valor = useMemo<ContextoApp>(
    () => ({
      ...datos,
      agregarServicioCatalogo,
      actualizarServicioCatalogo,
      eliminarServicioCatalogo,
      agregarCliente,
      actualizarCliente,
      eliminarCliente,
      agregarVehiculo,
      actualizarVehiculo,
      eliminarVehiculo,
      agregarCotizacion,
      actualizarCotizacion,
      eliminarCotizacion,
      cambiarEstadoCotizacion,
      generarServicioDesdeCotizacion,
      agregarServicio,
      actualizarServicio,
      eliminarServicio,
      cambiarEstadoServicio,
      agregarPersonal,
      actualizarPersonal,
      eliminarPersonal,
      agregarComision,
      actualizarComision,
      eliminarComision,
      cambiarEstadoComision,
      reiniciarDemo,
    }),
    [
      datos,
      agregarServicioCatalogo,
      actualizarServicioCatalogo,
      eliminarServicioCatalogo,
      agregarCliente,
      actualizarCliente,
      eliminarCliente,
      agregarVehiculo,
      actualizarVehiculo,
      eliminarVehiculo,
      agregarCotizacion,
      actualizarCotizacion,
      eliminarCotizacion,
      cambiarEstadoCotizacion,
      generarServicioDesdeCotizacion,
      agregarServicio,
      actualizarServicio,
      eliminarServicio,
      cambiarEstadoServicio,
      agregarPersonal,
      actualizarPersonal,
      eliminarPersonal,
      agregarComision,
      actualizarComision,
      eliminarComision,
      cambiarEstadoComision,
      reiniciarDemo,
    ],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useDatos(): ContextoApp {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error("useDatos debe usarse dentro de ProveedorDatos")
  return contexto
}
