import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  CarFront, CheckCircle2, CircleDollarSign, Clock3, Coins, FileText,
  TrendingUp, UserRound, Wrench,
} from "lucide-react"
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts"
import { EstadoCotizacionBadge, EstadoComisionBadge, EstadoServicioBadge, TarjetaMetrica } from "@/components/comunes/Indicadores"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { totalPresupuesto } from "@/lib/calculos"
import { formatearFecha, formatearMoneda, formatearNumero, textoVencimiento } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_COTIZACION } from "@/lib/types"

const COLORES_ESTADO: Record<string, string> = {
  Borrador: "#475569",
  Enviada: "#0284c7",
  Aceptada: "#059669",
  Rechazada: "#dc2626",
  Vencida: "#d97706",
}

const COLORES_PERSONAL = ["#059669", "#0284c7", "#7c3aed", "#d97706", "#db2777", "#475569"]

export default function Dashboard() {
  const { clientes, vehiculos, cotizaciones, servicios, personal, comisiones } = useDatos()

  const totalCotizado = useMemo(
    () => cotizaciones.reduce((total, item) => total + totalPresupuesto(item.items, item.manoDeObra, item.descuento), 0),
    [cotizaciones],
  )
  const totalAceptado = useMemo(
    () => cotizaciones
      .filter((item) => item.estado === "Aceptada")
      .reduce((total, item) => total + totalPresupuesto(item.items, item.manoDeObra, item.descuento), 0),
    [cotizaciones],
  )
  const serviciosActivos = servicios.filter((item) => item.estado === "Pendiente" || item.estado === "En curso")
  const comisionesPendientes = comisiones.filter((item) => item.estado === "Pendiente")
  const montoPendiente = comisionesPendientes.reduce((total, item) => total + item.monto, 0)
  const entregados = servicios.filter((item) => item.estado === "Entregado")
  const facturado = entregados.reduce(
    (total, item) => total + totalPresupuesto(item.items, item.manoDeObra, item.descuento), 0,
  )

  const datosEstados = ESTADOS_COTIZACION.map((estado) => ({
    estado,
    cantidad: cotizaciones.filter((item) => item.estado === estado).length,
  }))

  const datosPersonal = personal
    .map((persona) => ({
      nombre: persona.nombre,
      monto: comisiones
        .filter((comision) => comision.personalId === persona.id)
        .reduce((total, comision) => total + comision.monto, 0),
    }))
    .filter((item) => item.monto > 0)

  const proximasCotizaciones = [...cotizaciones]
    .filter((item) => item.estado === "Enviada" || item.estado === "Borrador")
    .sort((a, b) => new Date(a.vigenteHasta).getTime() - new Date(b.vigenteHasta).getTime())
    .slice(0, 4)

  const nombreCliente = (id: string) => clientes.find((cliente) => cliente.id === id)?.nombre ?? "—"
  const patenteVehiculo = (id: string) => vehiculos.find((vehiculo) => vehiculo.id === id)?.patente ?? "—"

  const tooltipEstilo = {
    contentStyle: { borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)", fontSize: 12 },
    formatter: (valor: unknown) => [formatearNumero(Number(valor)), "Cantidad"],
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Resumen del taller</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cotizaciones, servicios en curso y costos del personal de un vistazo.
        </p>
      </div>

      <section aria-label="Indicadores principales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          titulo="Total cotizado"
          valor={formatearMoneda(totalCotizado)}
          detalle={`${formatearMoneda(totalAceptado)} aceptados`}
          icono={<CircleDollarSign className="size-[18px]" />}
          tono="primario"
        />
        <TarjetaMetrica
          titulo="Servicios activos"
          valor={formatearNumero(serviciosActivos.length)}
          detalle={`${formatearNumero(entregados.length)} entregados · ${formatearMoneda(facturado)}`}
          icono={<Wrench className="size-[18px]" />}
          tono="info"
        />
        <TarjetaMetrica
          titulo="Comisiones pendientes"
          valor={formatearMoneda(montoPendiente)}
          detalle={`${formatearNumero(comisionesPendientes.length)} por pagar`}
          icono={<Coins className="size-[18px]" />}
          tono="alerta"
        />
        <TarjetaMetrica
          titulo="Clientes y vehículos"
          valor={`${clientes.length} / ${vehiculos.length}`}
          detalle="Clientes registrados / vehículos"
          icono={<TrendingUp className="size-[18px]" />}
          tono="violeta"
        />
      </section>

      <section aria-label="Gráficos" className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-xl border-border/70 shadow-none lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cotizaciones por estado</CardTitle>
            <CardDescription>Cantidad de presupuestos en cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosEstados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="estado" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipEstilo} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                    {datosEstados.map((entrada) => (
                      <Cell key={entrada.estado} fill={COLORES_ESTADO[entrada.estado]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comisiones por persona</CardTitle>
            <CardDescription>Total asignado a cada integrante</CardDescription>
          </CardHeader>
          <CardContent>
            {datosPersonal.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Sin comisiones asignadas
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosPersonal}
                      dataKey="monto"
                      nameKey="nombre"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {datosPersonal.map((entrada, indice) => (
                        <Cell key={entrada.nombre} fill={COLORES_PERSONAL[indice % COLORES_PERSONAL.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(valor: unknown) => formatearMoneda(Number(valor))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {datosPersonal.map((entrada, indice) => (
                <div key={entrada.nombre} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: COLORES_PERSONAL[indice % COLORES_PERSONAL.length] }} aria-hidden="true" />
                  {entrada.nombre}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Actividad reciente" className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cotizaciones por vencer</CardTitle>
              <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardDescription>Presupuestos pendientes de respuesta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximasCotizaciones.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No hay cotizaciones pendientes.</p>
            ) : (
              proximasCotizaciones.map((cotizacion) => (
                <Link key={cotizacion.id} to={`/cotizaciones/${cotizacion.id}`} className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="tabular text-[11px] text-muted-foreground">{cotizacion.numero}</p>
                      <p className="truncate text-sm font-medium">{cotizacion.titulo}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{nombreCliente(cotizacion.clienteId)} · {patenteVehiculo(cotizacion.vehiculoId)}</p>
                    </div>
                    <span className="tabular whitespace-nowrap text-sm font-semibold">
                      {formatearMoneda(totalPresupuesto(cotizacion.items, cotizacion.manoDeObra, cotizacion.descuento))}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">{textoVencimiento(cotizacion.vigenteHasta)}</span>
                    <EstadoCotizacionBadge estado={cotizacion.estado} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Servicios en curso</CardTitle>
              <Wrench className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardDescription>Trabajos pendientes y en ejecución</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {serviciosActivos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No hay servicios activos.</p>
            ) : (
              serviciosActivos.slice(0, 4).map((servicio) => (
                <Link key={servicio.id} to={`/servicios/${servicio.id}`} className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="tabular text-[11px] text-muted-foreground">{servicio.numero}</p>
                      <p className="truncate text-sm font-medium">{servicio.titulo}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{patenteVehiculo(servicio.vehiculoId)} · {nombreCliente(servicio.clienteId)}</p>
                    </div>
                    <EstadoServicioBadge estado={servicio.estado} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="size-3" aria-hidden="true" />
                    Entrega estimada: {formatearFecha(servicio.entregaEstimadaEn)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Comisiones a pagar</CardTitle>
              <Coins className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardDescription>Pendientes del equipo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {comisionesPendientes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No hay comisiones pendientes.</p>
            ) : (
              comisionesPendientes.slice(0, 4).map((comision) => (
                <Link key={comision.id} to={`/comisiones/${comision.id}`} className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{comision.personalNombre}</p>
                      <p className="tabular truncate text-[11px] text-muted-foreground">{comision.origenNumero}</p>
                    </div>
                    <span className="tabular whitespace-nowrap text-sm font-semibold">{formatearMoneda(comision.monto)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {comision.tipo === "porcentaje" ? `${comision.valor} % del total` : "Monto fijo"}
                    </span>
                    <EstadoComisionBadge estado={comision.estado} />
                  </div>
                </Link>
              ))
            )}
            <Link to="/comisiones" className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
              Ver todas las comisiones
            </Link>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Accesos rápidos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { a: "/clientes", etiqueta: "Clientes", icono: UserRound, detalle: `${clientes.length} registrados` },
          { a: "/vehiculos", etiqueta: "Vehículos", icono: CarFront, detalle: `${vehiculos.length} en el sistema` },
          { a: "/catalogo", etiqueta: "Catálogo", icono: CheckCircle2, detalle: "Servicios del taller" },
          { a: "/personal", etiqueta: "Personal", icono: Coins, detalle: `${personal.length} integrantes` },
        ].map(({ a, etiqueta, icono: Icono, detalle }) => (
          <Link key={a} to={a} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/50">
            <Icono className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{etiqueta}</p>
              <p className="truncate text-[11px] text-muted-foreground">{detalle}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
